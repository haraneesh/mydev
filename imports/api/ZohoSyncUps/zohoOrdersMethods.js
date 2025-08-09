import { Roles } from 'meteor/alanning:roles';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import constants from '../../modules/constants';
import handleMethodException from '../../modules/handle-method-exception';
import rateLimit from '../../modules/rate-limit';
import { Orders } from '../Orders/Orders';
import Products from '../Products/Products';
import zh from './ZohoBooks';
import { syncUpConstants } from './ZohoSyncUps';
import {
  getZhDisplayDate,
  retResponse,
  updateSyncAndReturn,
  updateUserSyncAndReturn,
} from './zohoCommon';
import { processInvoicesFromZoho } from './zohoInvoices';
// import orderCommon from '../../modules/both/orderCommon';

// TODO May have to be a seperate table
const _productTypeToZohoGroupIdMap = {
  Vegetables: '702207000000066009',
  Groceries: '702207000000066019',
  Batter: '702207000000066029',
};

const _getZohoGroupId = (type) => _productTypeToZohoGroupIdMap[type];

/**
 * Parses a unitsForSelection string and returns the corresponding value
 * based on a given quantity. The unitsForSelection string can contain
 * simple numeric values or key-value pairs (e.g., "0.5=5%").
 *
 * @param {string} unitsForSelection - A comma-separated string of units,
 * e.g., "0,0.25,0.5=5%,0.75=10%,1".
 * @param {number} quantity - The numeric quantity to match against.
 * @param {number} fullPrice - The full price of the product.
 * @returns {number|string|null} The matched value (e.g., 10, "0.5") or null if no match is found.
 */
function getDiscountedPrice(unitsForSelection, quantity, fullPrice) {
  let result = 0;

  // Split the string into individual options
  const options = unitsForSelection.split(',');

  // Iterate through the options to find the match
  for (const option of options) {
    if (option.includes('=')) {
      // This option has a mapped value (e.g., "0.5=5%")
      const [value, mappedValue] = option.split('=');
      // Use parseFloat for robust numeric comparison
      if (parseFloat(value) === quantity) {
        // If the mapped value ends with '%', remove it and parse as an integer
        if (mappedValue.endsWith('%')) {
          result = parseInt(mappedValue);
        }
        break; // Found the match, exit the loop
      }
    } else if (parseFloat(option) === quantity) {
      break;
    }
  }
  if (result > 0) {
    const discountedAmount = (fullPrice * result) / 100;
    return fullPrice - discountedAmount;
  }
  return fullPrice;
}

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

const getZohoSalesOrderStatus = (status) =>
  _orderStatusToZohoSalesOrderStatus[status].zh_status;

const getZohoUserIdFromUserId = async (userId) => {
  // mongo collections have only meteor ids
  const user = await Meteor.users.findOneAsync({ _id: userId });
  return user.zh_contact_id || '';
};

const getZohoItemIdFromProductId = async (productId) => {
  const product = await Products.findOneAsync({ _id: productId });
  return product.zh_item_id || '';
};

const createZohoSalesOrder = async (order) => {
  const notes = ` ${order.comments || ''} 
  | ${order.issuesWithPreviousOrder || ''} 
  | ${order.payCashWithThisDelivery ? ' Customer wants to pay cash, please collect with this delivery' : ''}
  | ${order.collectRecyclablesWithThisDelivery ? ' Customer wants to pick up bootles, or bags with this delivery' : ''}
  `;

  const zhSalesOrder = {
    customer_id: await getZohoUserIdFromUserId(order.customer_details._id), // mandatory
    salesperson_id:
      order.zohoSalesPerson && order.zohoSalesPerson.salesperson_zoho_id
        ? order.zohoSalesPerson.salesperson_zoho_id
        : null,
    salesperson_name:
      order.zohoSalesPerson && order.zohoSalesPerson.salesperson_zoho_name
        ? order.zohoSalesPerson.salesperson_zoho_name
        : null,
    is_inclusive_tax: true, // treat line item rates are inclusive of tax
    date: getZhDisplayDate(order.createdAt), // "2013-11-17"
    // hide for books status: _getZohoSalesOrderStatus(order.order_status), // possible values -
    notes,
  };

  const lineItems = [];

  for (const product of order.products) {
    const itemId = await getZohoItemIdFromProductId(product._id);
    lineItems.push({
      item_id: product.zh_item_id || itemId, // mandatory
      name: product.name,
      description: product.description || '',
      rate: getDiscountedPrice(
        product.unitsForSelection,
        product.quantity,
        product.unitprice,
      ),
      quantity: product.quantity,
      unit: product.unitOfSale,
    });

    if (
      product.includeReturnables &&
      product.associatedReturnables &&
      product.associatedReturnables.quantity > 0
    ) {
      const itemId = await getZohoItemIdFromProductId(
        product.associatedReturnables._id,
      );
      lineItems.push({
        item_id: itemId,
        name: product.associatedReturnables.name,
        description: `Deliver ${product.name} in ${product.associatedReturnables.name}`,
        rate: product.associatedReturnables.totalPrice,
        quantity: 1,
      });
    }
  }

  zhSalesOrder.line_items = lineItems;
  return zhSalesOrder;
};

const syncOrdersWithZoho = async (pendOrd, successResp, errorResp) => {
  const order = pendOrd;
  const zhSalesOrder = await createZohoSalesOrder(order);

  let r = {};
  if (
    order.customer_details.role &&
    order.customer_details.role === constants.Roles.shopOwner.name
  ) {
    r = order.zh_salesorder_id
      ? await zh.updateRecord(
          'deliverychallans',
          order.zh_salesorder_id,
          zhSalesOrder,
        )
      : await zh.createRecord('deliverychallans', zhSalesOrder);
  } else {
    r = order.zh_salesorder_id
      ? await zh.updateRecord(
          'salesorders',
          order.zh_salesorder_id,
          zhSalesOrder,
        )
      : await zh.createRecord('salesorders', zhSalesOrder);
  }

  if (r.code === 0 /* Success */) {
    if (r.salesorder) {
      await Orders.updateAsync(
        { _id: order._id },
        {
          $set: {
            zh_sales_type: 'salesorder',
            zh_salesorder_id: r.salesorder.salesorder_id,
            zh_salesorder_number: r.salesorder.salesorder_number,
            order_status: constants.OrderStatus.Awaiting_Fulfillment.name,
          },
        },
      );
    } else {
      await Orders.updateAsync(
        { _id: order._id },
        {
          $set: {
            zh_sales_type: 'deliverychallan',
            zh_salesorder_id: r.deliverychallan.deliverychallan_id,
            zh_salesorder_number: r.deliverychallan.deliverychallan_number,
            order_status: constants.OrderStatus.Awaiting_Fulfillment.name,
          },
        },
      );
    }
    successResp.push(retResponse(r));
  } else {
    const res = {
      code: r.code,
      message: `${r.message}: zoho salesOrder id = ${order.zh_salesorder_id} : order Id = ${order._id} : order details = ${JSON.stringify(order)}`,
    };
    errorResp.push(retResponse(res));
  }
};

export const syncBulkOrdersWithZoho = new ValidatedMethod({
  name: 'orders.syncBulkOrdersWithZoho',
  validate() {},
  async run() {
    const isAdmin = await Roles.userIsInRoleAsync(
      this.userId,
      constants.Roles.admin.name,
    );

    if (!isAdmin) {
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
      const orders = await Orders.find(query).fetchAsync(); // change to get products updated after sync date

      for (let i = 0; i < orders.length; i++) {
        const ord = orders[i];
        await syncOrdersWithZoho(ord, successResp, errorResp);
      }
    }
    const result = await updateSyncAndReturn(
      'orders',
      successResp,
      errorResp,
      nowDate,
      syncUpConstants.ordersToZoho,
    );

    console.log('------- order result -----');
    console.log(result);

    return result;
  },
});

// Zoho status = Allowed Values: draft, open, invoiced, partially_invoiced, void and overdue.
// Zoho order_status = draft, open, closed, void
export const updateOrderStatusFromZoho = async (awaitOrd, successResp, errorResp) => {
  const order = awaitOrd;
  let getInvoices = false;

  let r = {};
  let dcOrSo = 'salesorder';

  if (
    order.customer_details.role &&
    order.customer_details.role === constants.Roles.shopOwner.name
  ) {
    dcOrSo = 'deliverychallan';
    // r = zh.getRecordById('deliverychallans', order.zh_salesorder_id);
    getInvoices = true;
  } else {
    dcOrSo = 'salesorder';
    r = await zh.getRecordById('salesorders', order.zh_salesorder_id);

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

      await Orders.updateAsync({ _id: order._id }, { $set: orderQuery });
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

export const getUserOrdersAndInvoicesFromZoho = async (userId) => {
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

    const orders = await Orders.find(query).fetchAsync();
    for (const ord of orders) {
      if (ord.zh_salesorder_id) {
        const getInvoices = await updateOrderStatusFromZoho(
          ord,
          successResp,
          errorResp,
        );

        if (getInvoices && ord.zh_salesorder_number) {
          await processInvoicesFromZoho(ord, successResp, errorResp, null);
        }
      }
    }
  }
  return await updateUserSyncAndReturn(
    'invoices',
    userId,
    successResp,
    errorResp,
    nowDate,
    syncUpConstants.invoicesFromZoho,
  );
};

export const getOrdersAndInvoicesFromZoho = new ValidatedMethod({
  name: 'orders.getOrdersAndInvoicesFromZoho',
  validate() {},
  async run() {
    const isAdmin = await Roles.userIsInRoleAsync(
      this.userId,
      constants.Roles.admin.name,
    );
    if (!isAdmin) {
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
          {
            order_status: { $ne: constants.OrderStatus.Awaiting_Payment.name },
          },
        ],
      };
      const orders = await Orders.find(query).fetchAsync();
      for (const ord of orders) {
        if (ord.zh_salesorder_id) {
          const getInvoices = await updateOrderStatusFromZoho(
            ord,
            successResp,
            errorResp,
          );
          if (getInvoices && ord.zh_salesorder_number) {
            await processInvoicesFromZoho(ord, successResp, errorResp, null);
          }
        }
      }
    }
    return await updateSyncAndReturn(
      'invoices',
      successResp,
      errorResp,
      nowDate,
      syncUpConstants.invoicesFromZoho,
    );
  },
});

export const syncOfflinePaymentDetails = new ValidatedMethod({
  name: 'orders.syncOfflinePaymentDetails',
  validate() {},
  async run() {
    const isAdmin = await Roles.userIsInRoleAsync(
      this.userId,
      constants.Roles.admin.name,
    );
    if (!isAdmin) {
      handleMethodException('Access denied', 403);
    }
    const nowDate = new Date();
    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const query = {
        order_status: constants.OrderStatus.Awaiting_Payment.name,
      };
      const orders = await Orders.find(query).fetchAsync();

      for (const ord of orders) {
        if (ord.zh_salesorder_id) {
          const getInvoices = await updateOrderStatusFromZoho(
            ord,
            successResp,
            errorResp,
          );
          if (getInvoices && ord.zh_salesorder_number) {
            await processInvoicesFromZoho(ord, successResp, errorResp, null);
          }
        }
      }
    }
    return await updateSyncAndReturn(
      'invoicesPayment',
      successResp,
      errorResp,
      nowDate,
      syncUpConstants.invoicesFromZoho,
    );
  },
});

Meteor.methods({
  'orders.getOrdersBetweenJul6Jul18':
    async function getOrdersBetweenJul6Jul18() {
      if (Meteor.isServer) {
        try {
          const date_after = '2021-07-05';
          const date_before = '2021-07-19';

          const zhSOResponse = await zh.getRecordsByParams('salesorders', {
            date_after,
            date_before,
          });

          // insert lost orders
          const salesOrders = zhSOResponse.salesorders;
          for (const salesorder of salesOrders) {
            // get customer id
            const user = await Meteor.users.findOneAsync({
              zh_contact_id: salesorder.customer_id,
            });

            if (user) {
              // get products placed in the order

              const zhSalesOrder = await zh.getRecordById(
                'salesorders',
                salesorder.salesorder_id,
              );

              const soProducts = zhSalesOrder.salesorder.line_items;

              const productArray = [];

              for (let i = 0; i < soProducts.length; i += 1) {
                const soOrderDetails = soProducts[i];

                const product = await Products.findOneAsync({
                  zh_item_id: soOrderDetails.item_id,
                });
                if (product) {
                  delete product.createdAt;
                  delete product.updatedAt;
                  delete product.availableToOrderWH;
                  delete product.frequentlyOrdered;
                  delete product.sourceSuppliers;
                  product.quantity = soOrderDetails.quantity;
                  productArray.push(product);
                }
              }

              const insertId = await Orders.upsertAsync(
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
                    order_status:
                      constants.OrderStatus.Awaiting_Fulfillment.name,
                    total_bill_amount: salesorder.total,
                    comments: '** Restored from backup **',
                  },
                },
              );
              // console.log(insertId);
            } else {
              console.log('---------------');
              console.log(`- SO Id ${salesorder.salesorder_id} -`);
              console.log(`- Customer Id ${salesorder.customer_id} -`);
              console.log(`- Customer Name ${salesorder.customer_name} -`);
              console.log('---------------');
            }
          }
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
