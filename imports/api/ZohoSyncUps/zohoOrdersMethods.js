import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import moment from 'moment';
import 'moment-timezone';
import rateLimit from '../../modules/rate-limit';
import Products from '../Products/Products';
import Orders from '../Orders/Orders';
import constants from '../../modules/constants';
import zh from './ZohoBooks';
import { syncUpConstants } from './ZohoSyncUps';
import { updateSyncAndReturn, retResponse } from './zohoCommon';
import { processInvoicesFromZoho } from './zohoInvoicesMethods';


// TODO May have to be a seperate table
const _productTypeToZohoGroupIdMap = {
  Vegetables: '702207000000066009',
  Groceries: '702207000000066019',
  Batter: '702207000000066029',
};

const _getZohoGroupId = type => _productTypeToZohoGroupIdMap[type];

// Sales Order - draft, open, invoiced, partially_invoiced, void and overdue

const _orderStatusToZohoSalesOrderStatus = {
  Pending: { zh_status: 'draft' },
  Awaiting_Payment: { zh_status: 'open' },
  Awaiting_Fulfillment: { zh_status: 'open' },
  Completed: { zh_status: 'invoiced' },
  Cancelled: { zh_status: 'void' },
  Shipped: { zh_status: 'invoiced' },
};

const _getZohoSalesOrderStatus = status => _orderStatusToZohoSalesOrderStatus[status].zh_status;

const _getZhDisplayDate = (dateObject) => {
  // const dateObject = new Date(dateString)
  const zhDateSettings = {
    format: 'YYYY-MM-DD',
    timeZone: 'Asia/Kolkata',
  };
  return moment(dateObject).tz(zhDateSettings.timeZone).format(zhDateSettings.format);
};

const _getZohoUserIdFromUserId = userId =>
  // mongo collections have only meteor ids
   Meteor.users.findOne({ _id: userId }, { zh_contact_id: 1 }).zh_contact_id || '';

const _getZohoItemIdFromProductId = productId =>
  Products.findOne({ _id: productId }, { zh_item_id: 1 }).zh_item_id || '';

const _createZohoSalesOrder = (order) => {
  const zhSalesOrder = {
    customer_id: _getZohoUserIdFromUserId(order.customer_details._id), // mandatory
    date: _getZhDisplayDate(order.createdAt), // "2013-11-17"
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
  const r = (order.zh_salesorder_id) ?
          zh.updateRecord('salesorders', order.zh_salesorder_id, zhSalesOrder) :
          zh.createRecord('salesorders', zhSalesOrder);

  if (r.code === 0 /* Success */) {
    Orders.update({ _id: order._id }, { $set: {
      zh_salesorder_id: r.salesorder.salesorder_id,
      zh_salesorder_number: r.salesorder.salesorder_number,
      order_status: constants.OrderStatus.Awaiting_Fulfillment.name,
    } });
    successResp.push(retResponse(r));
  } else {
    errorResp.push(retResponse(r));
  }
};

export const syncBulkOrdersWithZoho = new ValidatedMethod({
  name: 'orders.syncBulkOrdersWithZoho',
  validate() {},
  run() {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(403, 'Access denied');
    }
    const nowDate = new Date();
    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const query = { order_status: constants.OrderStatus.Pending.name };
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

  const r = zh.getRecordById('salesorders', order.zh_salesorder_id);
  if (r.code === 0 /* Success */) {
    const orderQuery = {
      zh_salesorder_status: r.salesorder.status,
      zh_salesorder_order_status: r.salesorder.order_status,
    };

    if (r.salesorder.status === 'void') {
      orderQuery.order_status = constants.OrderStatus.Cancelled.name;
    } else {
      getInvoices = true;
    }

    Orders.update({ _id: order._id }, { $set: orderQuery });
    successResp.push(retResponse(r));
  } else {
    errorResp.push(retResponse(r));
  }
  return getInvoices;
};

export const getOrdersAndInvoicesFromZoho = new ValidatedMethod({
  name: 'orders.getOrdersAndInvoicesFromZoho',
  validate() {},
  run() {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(403, 'Access denied');
    }
    const nowDate = new Date();
    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const query = { $and: [
               { order_status: { $ne: constants.OrderStatus.Cancelled.name } },
               { order_status: { $ne: constants.OrderStatus.Completed.name } },
               { order_status: { $ne: constants.OrderStatus.Pending.name } },
      ] };
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


rateLimit({
  methods: [syncBulkOrdersWithZoho, getOrdersAndInvoicesFromZoho],
  limit: 5,
  timeRange: 1000,
});
