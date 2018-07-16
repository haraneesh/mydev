import { Meteor } from 'meteor/meteor';
import 'moment-timezone';
import moment from 'moment';
import zh from './ZohoBooks';
import { dateSettings, dateSettingsWithTime } from '../../modules/settings';

function todayFormattedForZoho() {
  const today = new Date();
  return moment(today)
    .tz(dateSettingsWithTime.timeZone)
    .format(dateSettings.zhPayDateFormat);
}

function retZohoPaymentObject(
  zhCustomerId,
  paymentAmountInPaise,
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
    paymentMode,
    razorPaymentId,
    paymentDescription,
    razorPayChargesInPaise,
  } = args;

  const zhPaymentObj = retZohoPaymentObject(
    zhCustomerId,
    paymentAmountInPaise,
    paymentMode,
    razorPaymentId,
    paymentDescription,
    razorPayChargesInPaise,
  );

  const response = zh.createRecord('customerpayments', zhPaymentObj);

  return response;
}

const zohoPayments = {
  createCustomerPayment,
};

export default zohoPayments;
