import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import { check } from 'meteor/check';
import rateLimit from '../../modules/rate-limit';
import Products from '../Products/Products';
import { Orders } from '../Orders/Orders';
import constants from '../../modules/constants';
import zh from './ZohoBooks';
import { syncUpConstants } from './ZohoSyncUps';
import {
  updateSyncAndReturn, retResponse, updateUserSyncAndReturn, getZhDisplayDate,
} from './zohoCommon';
import { processInvoicesFromZoho } from './zohoInvoices';
import handleMethodException from '../../modules/handle-method-exception';
// import orderCommon from '../../modules/both/orderCommon';

// TODO May have to be a seperate table
const _productTypeToZohoGroupIdMap = {
  Vegetables: '702207000000066009',
  Groceries: '702207000000066019',
  Batter: '702207000000066029',
};

const _getZohoGroupId = (type) => _productTypeToZohoGroupIdMap[type];

// Sales Order - draft, open, invoiced, partially_invoiced, void and overdue

const _orderStatusToZohoSalesOrderStatus = {
  Pending: { zh_status: 'draft' },
  Processing: { zh_status: 'open' },
  Awaiting_Payment: { zh_status: 'open' },
  Awaiting_Fulfillment: { zh_status: 'open' },
  Completed: { zh_status: 'invoiced' },
  Cancelled: { zh_status: 'void' },
  Shipped: { zh_status: 'invoiced' },
};

const _getZohoSalesOrderStatus = (status) => _orderStatusToZohoSalesOrderStatus[status].zh_status;

const _getZohoUserIdFromUserId = (userId) =>
  // mongo collections have only meteor ids
  Meteor.users.findOne({ _id: userId }, { zh_contact_id: 1 }).zh_contact_id || '';

const _getZohoItemIdFromProductId = (productId) => Products.findOne({ _id: productId }, { zh_item_id: 1 }).zh_item_id || '';

const _createZohoSalesOrder = (order) => {
  const zhSalesOrder = {
    customer_id: _getZohoUserIdFromUserId(order.customer_details._id), // mandatory
    date: getZhDisplayDate(order.createdAt), // "2013-11-17"
    // hide for books status: _getZohoSalesOrderStatus(order.order_status), // possible values -
    notes: order.comments || '',
  };

  const lineItems = [];
  order.products.forEach((product) => {
    lineItems.push({
      item_id: product.zh_item_id || _getZohoItemIdFromProductId(product._id), // mandatory
      name: product.name,
      description: product.description || '',
      rate: product.unitprice,
      quantity: product.quantity,
      unit: product.unitOfSale,
    });
  });

  zhSalesOrder.line_items = lineItems;
  return zhSalesOrder;
};

const syncOrdersWithZoho = (pendOrd, successResp, errorResp) => {
  const order = pendOrd;
  const zhSalesOrder = _createZohoSalesOrder(order);

  let r = {};
  if (order.customer_details.role && (order.customer_details.role === constants.Roles.shopOwner.name)) {
    r = (order.zh_salesorder_id)
      ? zh.updateRecord('deliverychallans', order.zh_salesorder_id, zhSalesOrder)
      : zh.createRecord('deliverychallans', zhSalesOrder);
  } else {
    r = (order.zh_salesorder_id)
      ? zh.updateRecord('salesorders', order.zh_salesorder_id, zhSalesOrder)
      : zh.createRecord('salesorders', zhSalesOrder);
  }

  if (r.code === 0 /* Success */) {
    if (r.salesorder) {
      Orders.update({ _id: order._id }, {
        $set: {
          zh_sales_type: 'salesorder',
          zh_salesorder_id: r.salesorder.salesorder_id,
          zh_salesorder_number: r.salesorder.salesorder_number,
          order_status: constants.OrderStatus.Awaiting_Fulfillment.name,
        },
      });
    } else {
      Orders.update({ _id: order._id }, {
        $set: {
          zh_sales_type: 'deliverychallan',
          zh_salesorder_id: r.deliverychallan.deliverychallan_id,
          zh_salesorder_number: r.deliverychallan.deliverychallan_number,
          order_status: constants.OrderStatus.Awaiting_Fulfillment.name,
        },
      });
    }
    successResp.push(retResponse(r));
  } else {
    const res = {
      code: r.code,
      message: `${r.message}: zoho salesOrder id = ${order.zh_salesorder_id} : order Id = ${order._id}`,
    };
    errorResp.push(retResponse(res));
  }
};

export const syncBulkOrdersWithZoho = new ValidatedMethod({
  name: 'orders.syncBulkOrdersWithZoho',
  validate() { },
  run() {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      handleMethodException('Access denied', 403);
    }
    const nowDate = new Date();

    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const query = {
        order_status: constants.OrderStatus.Processing.name,
        // expectedDeliveryDate: { $lte: orderCommon.getTomorrowDateOnServer() },
      };
      const orders = Orders.find(query).fetch(); // change to get products updated after sync date

      orders.forEach((ord) => {
        syncOrdersWithZoho(ord, successResp, errorResp);
      });
    }
    return updateSyncAndReturn('orders', successResp, errorResp, nowDate, syncUpConstants.ordersToZoho);
  },
});

// Zoho status = Allowed Values: draft, open, invoiced, partially_invoiced, void and overdue.
// Zoho order_status = draft, open, closed, void
const updateOrderStatusFromZoho = (awaitOrd, successResp, errorResp) => {
  const order = awaitOrd;
  let getInvoices = false;

  let r = {};
  let dcOrSo = 'salesorder';

  if (order.customer_details.role && (order.customer_details.role === constants.Roles.shopOwner.name)) {
    dcOrSo = 'deliverychallan';
    // r = zh.getRecordById('deliverychallans', order.zh_salesorder_id);
    getInvoices = true;
  } else {
    dcOrSo = 'salesorder';
    r = zh.getRecordById('salesorders', order.zh_salesorder_id);

    if (r.code === 0 /* Success */) {
      const orderQuery = {
        zh_salesorder_status: r[dcOrSo].status,
        zh_salesorder_order_status: r[dcOrSo].order_status,
      };

      if (r.salesorder.status === 'void') {
        orderQuery.order_status = constants.OrderStatus.Cancelled.name;
      } else {
        getInvoices = true;
      }

      Orders.update({ _id: order._id }, { $set: orderQuery });
      successResp.push(retResponse(r));
    } else {
      const res = {
        code: r.code,
        message: `${r.message}: zoho salesOrder id = ${order.zh_salesorder_id} : order Id = ${order._id}`,
      };
      errorResp.push(retResponse(res));
    }
  }

  return getInvoices;
};

export const getUserOrdersAndInvoicesFromZoho = (userId) => {
  const nowDate = new Date();
  const successResp = [];
  const errorResp = [];
  if (Meteor.isServer) {
    const query = {
      $and: [
        { 'customer_details._id': userId },
        { order_status: { $ne: constants.OrderStatus.Cancelled.name } },
        { order_status: { $ne: constants.OrderStatus.Completed.name } },
        { order_status: { $ne: constants.OrderStatus.Pending.name } },
        { order_status: { $ne: constants.OrderStatus.Processing.name } },
      ],
    };
    const orders = Orders.find(query).fetch();
    orders.forEach((ord) => {
      if (ord.zh_salesorder_id) {
        const getInvoices = updateOrderStatusFromZoho(ord, successResp, errorResp);
        if (getInvoices && ord.zh_salesorder_number) {
          processInvoicesFromZoho(ord, successResp, errorResp);
        }
      }
    });
  }
  return updateUserSyncAndReturn('invoices', userId, successResp, errorResp, nowDate, syncUpConstants.invoicesFromZoho);
};

export const getOrdersAndInvoicesFromZoho = new ValidatedMethod({
  name: 'orders.getOrdersAndInvoicesFromZoho',
  validate() { },
  run() {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      handleMethodException('Access denied', 403);
    }
    const nowDate = new Date();
    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const query = {
        $and: [
          { order_status: { $ne: constants.OrderStatus.Cancelled.name } },
          { order_status: { $ne: constants.OrderStatus.Completed.name } },
          { order_status: { $ne: constants.OrderStatus.Pending.name } },
          { order_status: { $ne: constants.OrderStatus.Processing.name } },
          { order_status: { $ne: constants.OrderStatus.Awaiting_Payment.name } },
        ],
      };
      const orders = Orders.find(query).fetch();
      orders.forEach((ord) => {
        if (ord.zh_salesorder_id) {
          const getInvoices = updateOrderStatusFromZoho(ord, successResp, errorResp);
          if (getInvoices && ord.zh_salesorder_number) {
            processInvoicesFromZoho(ord, successResp, errorResp);
          }
        }
      });
    }
    return updateSyncAndReturn('invoices', successResp, errorResp, nowDate, syncUpConstants.invoicesFromZoho);
  },
});

export const syncOfflinePaymentDetails = new ValidatedMethod({
  name: 'orders.syncOfflinePaymentDetails',
  validate() { },
  run() {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      handleMethodException('Access denied', 403);
    }
    const nowDate = new Date();
    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const query = {
        order_status: constants.OrderStatus.Awaiting_Payment.name,
      };
      const orders = Orders.find(query).fetch();
      orders.forEach((ord) => {
        if (ord.zh_salesorder_id) {
          const getInvoices = updateOrderStatusFromZoho(ord, successResp, errorResp);
          if (getInvoices && ord.zh_salesorder_number) {
            processInvoicesFromZoho(ord, successResp, errorResp);
          }
        }
      });
    }
    return updateSyncAndReturn('invoicesPayment', successResp, errorResp, nowDate, syncUpConstants.invoicesFromZoho);
  },
});

Meteor.methods({
  'orders.getOrdersBetweenJul6Jul18': function getOrdersBetweenJul6Jul18() {
    if (Meteor.isServer) {
      try {
        const date_after = '2021-07-05';
        const date_before = '2021-07-19';

        const zhSOResponse = zh.getRecordsByParams(
          'salesorders',
          {
            date_after,
            date_before,
          },
        );

        // insert lost orders
        const salesOrders = zhSOResponse.salesorders;
        salesOrders.forEach((salesorder) => {
          // get customer id
          const user = Meteor.users.findOne({
            zh_contact_id: salesorder.customer_id,
          });

          if (user) {
          // get products placed in the order

            const zhSalesOrder = zh.getRecordById('salesorders', salesorder.salesorder_id);

            const soProducts = zhSalesOrder.salesorder.line_items;

            const productArray = [];
            soProducts.forEach((soOrderDetails) => {
              const product = Products.findOne({ zh_item_id: soOrderDetails.item_id });
              if (product) {
                delete product.createdAt;
                delete product.updatedAt;
                delete product.availableToOrderWH;
                delete product.frequentlyOrdered;
                delete product.sourceSuppliers;
                product.quantity = soOrderDetails.quantity;
                productArray.push(product);
              }
            });

            const insertId = Orders.upsert(
              { zh_salesorder_id: salesorder.salesorder_id },
              {
                $set: {
                  products: productArray,
                  productOrderListId: '1',
                  customer_details: {
                    role: constants.Roles.customer.name,
                    _id: user._id,
                    name: user.profile.name.first,
                    email: user.emails[0].address,
                    mobilePhone: user.username,
                    deliveryAddress: user.profile.deliveryAddress,
                  },
                  createdAt: salesorder.date,
                  zh_sales_type: 'salesorder',
                  zh_salesorder_id: salesorder.salesorder_id,
                  zh_salesorder_number: salesorder.salesorder_number,
                  order_status: constants.OrderStatus.Awaiting_Fulfillment.name,
                  total_bill_amount: salesorder.total,
                  comments: '** Restored from backup **',
                },
              },
            );
            console.log(insertId);
          } else {
            console.log('---------------');
            console.log(`- SO Id ${salesorder.salesorder_id} -`);
            console.log(`- Customer Id ${salesorder.customer_id} -`);
            console.log(`- Customer Name ${salesorder.customer_name} -`);
            console.log('---------------');
          }
        });
      // return zhSOResponse;
      } catch (exception) {
        console.log(exception);
      }
    }
  },
});

rateLimit({
  methods: [
    'orders.getOrdersBetweenJul6Jul18',
    syncBulkOrdersWithZoho,
    getOrdersAndInvoicesFromZoho,
    syncOfflinePaymentDetails,
  ],
  limit: 5,
  timeRange: 1000,
});
