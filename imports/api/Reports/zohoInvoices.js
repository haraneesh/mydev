/* eslint-disable camelcase */
import { Meteor } from 'meteor/meteor';
import { ZhInvoices } from '../Invoices/Invoices';
import zh from '../ZohoSyncUps/ZohoBooks';
import ZohoSyncUps, { syncUpConstants } from '../ZohoSyncUps/ZohoSyncUps';
import {
  getZhDisplayDate,
  retResponse,
  updateSyncAndReturn,
} from '../ZohoSyncUps/zohoCommon';

const createLineItemObject = (line_item) => {
  const {
    line_item_id,
    item_id,
    item_type,
    name,
    item_order,
    bcy_rate,
    rate,
    quantity,
    unit,
    discount_amount,
    discount,
  } = line_item;

  return {
    line_item_id,
    item_id,
    item_type,
    name,
    item_order,
    bcy_rate,
    rate,
    quantity,
    unit,
    discount_amount,
    discount,
  };
};

const createZhInvoiceObject = (invoice) => {
  const {
    invoice_id,
    date,
    status,
    due_date,
    last_payment_date,
    reference_number,
    balance,
    customer_id,
    created_time,
    last_modified_time,
    invoice_url,
  } = invoice;

  return {
    invoice_id,
    date,
    status,
    due_date,
    last_payment_date,
    reference_number,
    balance,
    customer_id,
    created_time,
    last_modified_time,
    invoice_url,
  };
};

const createZohoInvoiceObject = (invoice) => {
  const inv = createZhInvoiceObject(invoice);
  const lineItemsArray = invoice.line_items.map((lineItem) =>
    createLineItemObject(lineItem),
  );
  inv.line_items = lineItemsArray;

  return inv;
};

const callGetInvoiceDetailsFromZoho = async (invoices) => {
  const successResp = [];
  const errorResp = [];
  let returnSuccess = true;

  for (const invoice of invoices) {
    const r = await zh.getRecordById('invoices', invoice.invoice_id);
    if (r.code === 0 /* Success */) {
      await ZhInvoices.upsertAsync(
        { invoice_id: r.invoice.invoice_id },
        { $set: createZohoInvoiceObject(r.invoice) },
      );
      successResp.push(retResponse(r));
    } else {
      const res = {
        code: r.code,
        message: `Invoice Id ${r.message}`,
      };
      errorResp.push(retResponse(res));
      returnSuccess = false;
    }
  }

  await updateSyncAndReturn(
    'invoices',
    successResp,
    errorResp,
    new Date(),
    syncUpConstants.invoiceDetailsFromZoho,
  );

  return returnSuccess;
};

const callGetInvoicesFromZoho = async (lastNoErrorSyncDate) => {
  const successResp = [];
  const errorResp = [];

  let invoices = [];

  if (Meteor.isServer) {
    // const r = zh.getRecordsByParams('purchaseorders', {status:"billed", delivery_date: getZhDisplayDate(nowDate), });
    // const r = zh.getRecordsByParams('invoices', { last_modified_time: `${getZhDisplayDate(lookBackDate)}T00:00:00+0000` }); // modified after this date

    let page = 1;
    let hasMorePages = true;

    // const syncDT = await ZohoSyncUps.findOneAsync({ syncEntity: syncUpConstants.users }).syncDateTime;

    // page<10, 10 is arbitrary if it goes to more than 10 pages want to break out, may be something is wrong
    while (hasMorePages && page < 10) {
      const r = await zh.getRecordsByParams('invoices', {
        last_modified_time: `${getZhDisplayDate(lastNoErrorSyncDate)}T00:00:00+0000` /* last_modified_time: '2020-02-04T00:00:00+0000' */,
        page,
      });
      if (r.code === 0 /* Success */) {
        successResp.push(retResponse(r));
        invoices = invoices.concat(r.invoices);
        const pageContext = r.page_context; // have to loop if there are more pages
        hasMorePages = pageContext.has_more_page;
        page = pageContext.page + 1;
      } else {
        hasMorePages = false; // breakout on error
        const res = {
          code: r.code,
          message: `Page:${page} HasMorePages${hasMorePages} ${r.message}`,
        };
        errorResp.push(retResponse(res));
      }
    }

    // get Invoices
    let wasSuccessFull = false;
    if (errorResp.length < 1) {
      wasSuccessFull = await callGetInvoiceDetailsFromZoho(invoices);
    }
    const noErrorSyncDate = wasSuccessFull ? new Date() : lastNoErrorSyncDate;

    console.log(`${getZhDisplayDate(lastNoErrorSyncDate)}T00:00:00+0000`);

    await updateSyncAndReturn(
      'invoices',
      successResp,
      errorResp,
      new Date(),
      syncUpConstants.invoicesLastModifiedTimeFromZoho,
      noErrorSyncDate,
    );
  }
  return invoices;
};

const getInvoicesFromZoho = async () => {
  if (Meteor.isServer) {
    const { noErrorSyncDate } = await ZohoSyncUps.findOneAsync({
      syncEntity: syncUpConstants.invoicesLastModifiedTimeFromZoho,
    });
    return await callGetInvoicesFromZoho(noErrorSyncDate);
  }
};

export default getInvoicesFromZoho;
