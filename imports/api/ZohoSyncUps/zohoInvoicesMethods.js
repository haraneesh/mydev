import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import rateLimit from '../../modules/rate-limit';
import constants from '../../modules/constants';
import zh from './ZohoBooks';
import { syncUpConstants } from './ZohoSyncUps';
import { updateSyncAndReturn, retResponse } from './zohoCommon';
import Orders from '../Orders/Orders';

const areAllItemsInvoiced = (zhSalesOrder) => {
  const lineItems = zhSalesOrder.line_items;
  return lineItems.reduce((startValue, item) => startValue && item.is_invoiced, true);
};

/*
Status of Invoices
Status	Description

draft	Invoices when created will be in Draft status before being sent to the customer.
unpaid	Invoices once sent to the customer with a due date for payment, will be shown as Sent.
overdue	Once the due date for payment is exceeded, it will be shown as Overdue.
partially_paid	When the payment is made for a part of the items in the invoice, it will be shown as Partially Paid.
paid	Once the payment is made by your customer for the invoice raised, it will be shown as Paid.
viewed
sent
*/

const areAllInvoicedItemsPaid = (orderId, zhInvoices) => {
  const invoices = zhInvoices;
  return invoices.reduce((startValue, invoice) => startValue && (invoice.status === 'paid'), true);
};

const createInvoiceObject = (orderId, zhInvoice) => {
  const invoice = {};
  /*
    invoice.products = [];
    zhInvoice.line_items.forEach((value) => {
    invoice.products.push(
      {
        zh_item_id: value.item_id,
        name: value.name,
        unitOfSale: value.unit,
        unitprice: value.rate,
        description: value.description,
        quantity: value.quantity,
      },
    );

  }); */

  // reference to Order against which this incoice was created
  invoice.totalInvoicedAmount = zhInvoice.total;
  invoice.balanceInvoicedAmount = zhInvoice.balance;
  invoice.zhNotes = zhInvoice.notes;
  invoice.zhInvoiceId = zhInvoice.invoice_id;
  invoice.zhInvoiceStatus = zhInvoice.status;
  invoice.createdAt = zhInvoice.created_time;
  invoice.updatedAt = zhInvoice.last_modified_time;

  return invoice;
};

const getInvoices = (orderId, zhInvoices) => {
  const invoices = [];

  zhInvoices.forEach((value) => {
    const invoice = createInvoiceObject(orderId, value);
    invoices.push(invoice);
  });

  return invoices;
};

const deriveOrderStatusFromInvoices = (zhInvoices) => {
  const invoices = zhInvoices;
  const statuses = {
    overdue: 0,
    due: 0,
    sent: 0,
    paid: 0,
    void: 0,
    draft: 0,
  };

  invoices.forEach((invoice) => {
    switch (true) {
      case (invoice.status === 'overdue'):
        // return 'overdue';
        statuses.overdue += 1;
        break;
      case (invoice.status === 'due'):
        statuses.due += 1;
        break;
      case (invoice.status === 'partially_paid'):
        statuses.due += 1;
        break;
      case (invoice.status === 'sent'):
        statuses.sent += 1;
        break;
      case (invoice.status === 'paid'):
        statuses.paid += 1;
        break;
      case (invoice.status === 'void'):
        statuses.void += 1;
        break;
      default:
        statuses.draft += 1;
        break;
    }
  });

  switch (true) {
    case (statuses.overdue > 0):
      return 'overdue';
    case (statuses.due > 0):
      return 'due';
    case (statuses.sent > 0):
      return 'sent';
    case (statuses.paid > 0):
      return 'paid';
    case (statuses.void > 0):
      return 'void';
    default:
      return 'draft';
  }
};

export const processInvoicesFromZoho = (awaitOrd, successResp, errorResp) => {
  const order = awaitOrd;
  // const r = zh.getRecordsByParams('invoices', { reference_number: order.zh_salesorder_number });
  const r = zh.getRecordsByParams('invoices', { reference_number_contains: order.zh_salesorder_number });

  if (r.code === 0 /* Success */) {
    const zhInvoices = r.invoices;

    let orderStatus;

    const derivedOrderStatusFromInvoices = deriveOrderStatusFromInvoices(zhInvoices);

    switch (derivedOrderStatusFromInvoices) {
      case ('overdue'):
        orderStatus = constants.OrderStatus.Awaiting_Payment.name;
        break;
      case ('due'):
        orderStatus = constants.OrderStatus.Awaiting_Payment.name;
        break;
      case ('sent'):
        orderStatus = constants.OrderStatus.Shipped.name;
        break;
      case ('paid'):
        if (order.zh_salesorder_status === 'partially_invoiced') {
          orderStatus = constants.OrderStatus.Partially_Completed.name;
        } else {
          orderStatus = constants.OrderStatus.Completed.name;
        }
        break;
      case ('draft'):
        orderStatus = constants.OrderStatus.Awaiting_Fulfillment.name;
        break;
      default:
        orderStatus = constants.OrderStatus.Awaiting_Fulfillment.name;
        break;
    }
    const invoices = getInvoices(order._id, zhInvoices);
    Orders.update({ _id: order._id }, { $set: { order_status: orderStatus, invoices } });

    successResp.push(retResponse(r));
  } else {
    const res = {
      code: r.code,
      message: `${r.message} : zoho salesOrder number=${order.zh_salesorder_number}`,
    };
    errorResp.push(retResponse(res));
  }
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
export const getAndProcessInvoicesFromZoho = new ValidatedMethod({
  name: 'invoices.getAndProcessInvoicesFromZoho',
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
        if (ord.zh_salesorder_number) {
          processInvoicesFromZoho(ord, successResp, errorResp);
        }
      });
    }
    return updateSyncAndReturn('invoices', successResp, errorResp, nowDate, syncUpConstants.invoicesFromZoho);
  },
});

rateLimit({
  methods: [getAndProcessInvoicesFromZoho],
  limit: 5,
  timeRange: 1000,
});

