import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import moment from 'moment';
import 'moment-timezone';
import rateLimit from '../../modules/rate-limit';
import Products from '../Products/Products';
import Orders from '../Orders/Orders';
import constants from '../../modules/constants';
import zh from './ZohoInventory';
import { syncUpConstants } from './ZohoSyncUps';
import { updateSyncAndReturn, retResponse } from './zohoCommon';


// TODO May have to be a seperate table
const _productTypeToZohoGroupIdMap = {
  Vegetables: '702207000000066009',
  Groceries: '702207000000066019',
  Batter: '702207000000066029',
};

const _getZohoGroupId = type => _productTypeToZohoGroupIdMap[type];


// SalesOrder status - sent, draft, overdue, paid, void, unpaid, partially_paid and viewed
// Sales order status - draft, confirmed, SalesOrderd, closed, void, on hold
const _orderStatusToZohoSalesOrderStatus = {
  Pending: { zh_status: 'confirmed' },
  Awaiting_Payment: { zh_status: 'open' },
  Awaiting_Fulfillment: { zh_status: 'open' },
  Completed: { zh_status: 'fulfilled' },
  Cancelled: { zh_status: 'void' },
  Shipped: { zh_status: 'fulfilled' },
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
    date: _getZhDisplayDate(order.createdAt), // "2013-11-17"
    status: _getZohoSalesOrderStatus(order.order_status), // possible values -
    customer_id: _getZohoUserIdFromUserId(order.customer_details._id), // mandatory
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


const _syncOrdersWithZoho = (pendOrd, successResp, errorResp) => {
  const order = pendOrd;
  const zhSalesOrder = _createZohoSalesOrder(order);
  const r = (order.zh_salesorder_id) ?
          zh.updateRecord('salesorders', order.zh_salesorder_id, zhSalesOrder) :
          zh.createRecord('salesorders', zhSalesOrder);

  if (r.code === 0 /* Success */) {
    Orders.update({ _id: order._id }, { $set: {
      zh_salesorder_id: r.salesorder.salesorder_id,
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
      throw new Meteor.Error(401, 'Access denied');
    }
    const nowDate = new Date();
    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const query = { order_status: constants.OrderStatus.Pending.name };

      const orders = Orders.find(query).fetch(); // change to get products updated after sync date

      orders.forEach((ord) => {
        _syncOrdersWithZoho(ord, successResp, errorResp);
      });
    }
    return updateSyncAndReturn('orders', successResp, errorResp, nowDate, syncUpConstants.ordersToZoho);
  },
});

const _areAllItemsInvoiced = (zhSalesOrder) => {
  const lineItems = zhSalesOrder.line_items;
  return lineItems.reduce((startValue, item) => startValue && item.is_invoiced, true);
};

/*
Status of Invoices
Status	Description
Draft	Invoices when created will be in Draft status before being sent to the customer.
Due	Invoices once sent to the customer with a due date for payment, will be shown as Sent.
Overdue	Once the due date for payment is exceeded, it will be shown as Overdue.
Partially Paid	When the payment is made for a part of the items in the invoice, it will be shown as Partially Paid.
Paid	Once the payment is made by your customer for the invoice raised, it will be shown as Paid.
*/

const _areAllInvoicedItemsPaid = (zhSalesOrder) => {
  const invoices = zhSalesOrder.invoices;
  return invoices.reduce((startValue, invoice) => startValue && (invoice.status === 'paid'), true);
};

/*
Status of a Sales Order
A Sales Order status indicates the stage of progress and the current condition of the order. Lets take a look at what each status indicates.

Draft - This indicates that a SO has been created successfully, but is yet to be sent to the customer.
Confirmed - This indicates that the SO created has been sent to the customer.
Closed - The SO becomes Closed when you either raise an Invoice or when a Shipment is fulfilled (or both, depending on what you’ve chosen in the Sales Order Preferences.)
Void - The SO status becomes Void, when you decide to freeze/nullify the SO and make it void.
On Hold - The status is set as On Hold, when there’s an unbilled backordered PO raised for the Sales Order. Once the PO has been billed, the SO will revert back to its previous status.
*/

const _syncOrderFromZoho = (awaitOrd, successResp, errorResp) => {
  const order = awaitOrd;
  const r = zh.getRecordById('salesorders', order.zh_salesorder_id);
  if (r.code === 0 /* Success */) {
    // From invoices update status
    const zhSalesOrder = r.salesorder;
    if (zhSalesOrder.status !== 'draft') {
      let orderStatus;

      const areAllItemsInvoiced = _areAllItemsInvoiced(zhSalesOrder);
      const areAllInvoicedItemsPaid = _areAllInvoicedItemsPaid(zhSalesOrder);

      switch (true) {
        case (areAllItemsInvoiced && areAllInvoicedItemsPaid):
          orderStatus = constants.OrderStatus.Completed.name;
          break;
        case (areAllItemsInvoiced && !areAllInvoicedItemsPaid):
          orderStatus = constants.OrderStatus.Awaiting_Payment.name;
          break;
        case (!areAllItemsInvoiced && areAllInvoicedItemsPaid):
          orderStatus = constants.OrderStatus.Partially_Completed.name;
          break;
        case (zhSalesOrder.status === 'void'):
          orderStatus = constants.OrderStatus.Cancelled.name;
          break;
        default:
          orderStatus = constants.OrderStatus.Awaiting_Fulfillment.name;
          break;
      }
      Orders.update({ _id: order._id }, { $set: { order_status: orderStatus } });
    }

    successResp.push(retResponse(r));
  } else {
    errorResp.push(retResponse(r));
  }
};

export const updateOrdersFromZoho = new ValidatedMethod({
  name: 'orders.updateOrdersFromZoho',
  validate() {},
  run() {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(401, 'Access denied');
    }
    const nowDate = new Date();
    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const query = { $or: [
               { order_status: constants.OrderStatus.Awaiting_Fulfillment.name },
               { order_status: constants.OrderStatus.Partially_Completed.name },
      ] };
      const orders = Orders.find(query).fetch();
      orders.forEach((ord) => {
        _syncOrderFromZoho(ord, successResp, errorResp);
      });
    }
    return updateSyncAndReturn('orders', successResp, errorResp, nowDate, syncUpConstants.ordersFromZoho);
  },
});


rateLimit({
  methods: [updateOrdersFromZoho, syncBulkOrdersWithZoho],
  limit: 5,
  timeRange: 1000,
});
