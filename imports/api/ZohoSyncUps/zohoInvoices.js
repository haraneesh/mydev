import constants from '../../modules/constants';
import { Orders } from '../Orders/Orders';
import zh from './ZohoBooks';
import { retResponse } from './zohoCommon';

const areAllItemsInvoiced = (zhSalesOrder) => {
  const lineItems = zhSalesOrder.line_items;
  return lineItems.reduce(
    (startValue, item) => startValue && item.is_invoiced,
    true,
  );
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
  return invoices.reduce(
    (startValue, invoice) => startValue && invoice.status === 'paid',
    true,
  );
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

  // reference to Order against which this invoice was created
  invoice.totalInvoicedAmount = zhInvoice.total;
  invoice.balanceInvoicedAmount = zhInvoice.balance;
  invoice.zhNotes = zhInvoice.notes;
  invoice.zhInvoiceId = zhInvoice.invoice_id;
  invoice.zhInvoiceStatus = zhInvoice.status;
  invoice.createdAt = zhInvoice.created_time;
  invoice.updatedAt = zhInvoice.last_modified_time;
  return invoice;
};

export const InvoiceStatuses = {
  overdue: { value: 'overdue' },
  due: { value: 'due' },
  sent: { value: 'sent' },
  paid: { value: 'paid' },
  void: { value: 'void' },
  draft: { value: 'draft' },
  partially_paid: { value: 'partially_paid' },
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
      case invoice.status === 'overdue':
        // return 'overdue';
        statuses.overdue += 1;
        break;
      case invoice.status === 'due':
        statuses.due += 1;
        break;
      case invoice.status === 'partially_paid':
        statuses.due += 1;
        break;
      case invoice.status === 'sent':
        statuses.sent += 1;
        break;
      case invoice.status === 'paid':
        statuses.paid += 1;
        break;
      case invoice.status === 'void':
        statuses.void += 1;
        break;
      default:
        statuses.draft += 1;
        break;
    }
  });

  switch (true) {
    case statuses.overdue > 0:
      return 'overdue';
    case statuses.due > 0:
      return 'due';
    case statuses.sent > 0:
      return 'sent';
    case statuses.paid > 0:
      return 'paid';
    case statuses.void > 0:
      return 'void';
    default:
      return 'draft';
  }
};

export const processInvoicesFromZoho = async (
  awaitOrd,
  successResp,
  errorResp,
) => {
  const order = awaitOrd;
  // const r = zh.getRecordsByParams('invoices', { reference_number: order.zh_salesorder_number });
  const r = await zh.getRecordsByParams('invoices', {
    reference_number_contains: order.zh_salesorder_number,
  });

  if (r.code === 0 /* Success */) {
    console.log('------- Invoices -----------');
    console.log(JSON.stringify(r));

    const zhInvoices = r.invoices;

    let orderStatus;

    const derivedOrderStatusFromInvoices =
      deriveOrderStatusFromInvoices(zhInvoices);

    switch (derivedOrderStatusFromInvoices) {
      case 'overdue':
        orderStatus = constants.OrderStatus.Awaiting_Payment.name;
        break;
      case 'due':
        orderStatus = constants.OrderStatus.Awaiting_Payment.name;
        break;
      case 'sent':
        orderStatus = constants.OrderStatus.Shipped.name;
        break;
      case 'paid':
        // if (order.zh_salesorder_status === 'partially_invoiced') {
        //   orderStatus = constants.OrderStatus.Partially_Completed.name;
        // } else {
        orderStatus = constants.OrderStatus.Completed.name;
        // }
        break;
      case 'draft':
        orderStatus = constants.OrderStatus.Awaiting_Fulfillment.name;
        break;
      default:
        orderStatus = constants.OrderStatus.Awaiting_Fulfillment.name;
        break;
    }
    const invoices = getInvoices(order._id, zhInvoices);
    await Orders.updateAsync(
      { _id: order._id },
      { $set: { order_status: orderStatus, invoices } },
    );

    successResp.push(retResponse(r));
  } else {
    const res = {
      code: r.code,
      message: `${r.message} : zoho salesOrder number=${
        order.zh_salesorder_number
      }`,
    };
    errorResp.push(retResponse(res));
  }
};
