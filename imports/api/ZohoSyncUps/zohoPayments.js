import { Meteor } from 'meteor/meteor';
import 'moment-timezone';
import moment from 'moment';
import zh from './ZohoBooks';
import { InvoiceStatuses } from './zohoInvoices';
import { dateSettings, dateSettingsWithTime } from '../../modules/settings';

const IsInvoiceStatusValid = invoice => {
  if (invoice.zhInvoiceStatus === InvoiceStatuses.void.value) {
    return false;
  }

  return true;
};

function prepareInvoicesForZoho(invoices, paymentAmountInPaise) {
  let paymentAvailableToBeAppliedInPaise = paymentAmountInPaise;
  return invoices.reduce((rows, invoice) => {
    if (
      invoice.balanceInvoicedAmount > 0 &&
      IsInvoiceStatusValid(invoice) &&
      paymentAvailableToBeAppliedInPaise > 0
    ) {
      const deductPaymentInPaise =
        paymentAvailableToBeAppliedInPaise -
        invoice.balanceInvoicedAmount * 100;
      rows.push({
        invoice_id: invoice.zhInvoiceId,
        amount_applied:
          deductPaymentInPaise < 0
            ? paymentAvailableToBeAppliedInPaise / 100
            : invoice.balanceInvoicedAmount,
      });
      paymentAvailableToBeAppliedInPaise = deductPaymentInPaise;
    }
    return rows;
  }, []);
}

function todayFormattedForZoho() {
  const today = new Date();
  return moment(today)
    .tz(dateSettingsWithTime.timeZone)
    .format(dateSettings.zhPayDateFormat);
}

function retZohoPaymentObject(
  zhCustomerId,
  paymentAmountInPaise,
  invoices,
  paymentMode,
  razorPaymentId,
  paymentDescription,
  // razorPayChargesInPaise,
) {
  const zohoPaymentObj = {
    customer_id: zhCustomerId,
    payment_mode: paymentMode,
    amount: paymentAmountInPaise / 100,
    date: todayFormattedForZoho(),
    reference_number: razorPaymentId,
    description: paymentDescription,
    invoices: prepareInvoicesForZoho(invoices, paymentAmountInPaise),
    //bank_charges: razorPayChargesInPaise / 100,
  };

  return zohoPaymentObj;
}

// List customer payments
// GET /customerpayments	List all the payments made by your customer.
// GET /customerpayments/:payment_id	Get the details of a customer payment.

// Create a customer payment
// POST /customerpayments	Create a payment made by your customer and you can also apply them to invoices either partially or fully.
function createCustomerPayment(args) {
  const {
    zhCustomerId,
    paymentAmountInPaise,
    invoices,
    paymentMode,
    razorPaymentId,
    paymentDescription,
    razorPayChargesInPaise,
  } = args;

  const zhPaymentObj = retZohoPaymentObject(
    zhCustomerId,
    paymentAmountInPaise,
    invoices,
    paymentMode,
    razorPaymentId,
    paymentDescription,
    razorPayChargesInPaise,
  );

  const response = zh.createRecord('customerpayments', zhPaymentObj);

  if (response.code !== 0) {
    throw new Meteor.Error(response.code, response.message);
  }

  return response;
}

const zohoPayments = {
  createCustomerPayment,
};

export default zohoPayments;
