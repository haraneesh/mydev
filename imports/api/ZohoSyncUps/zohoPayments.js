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

// List customer payments
// GET /customerpayments	List all the payments made by your customer.
// GET /customerpayments/:payment_id	Get the details of a customer payment.

// Create a customer payment
// POST /customerpayments	Create a payment made by your customer and you can also apply them to invoices either partially or fully.
// @param {Object} args - Payment arguments
// @param {string} args.customer_id - Zoho customer ID
// @param {string} args.payment_mode - Payment mode (e.g., 'creditcard', 'banktransfer')
// @param {number} args.amount - Payment amount in rupees
// @param {string} args.reference_number - Payment reference number
// @param {string} args.description - Payment description
// @param {string} args.date - Payment date in YYYY-MM-DD format
// @param {Array} args.invoices - Array of invoice objects with invoice_id and amount_applied
// @param {string} [args.account_id] - Zoho fund deposit account ID
// @returns {Promise<Object>} Zoho API response
async function createCustomerPayment(args) {
  // Handle both new object format and legacy parameter format
  const zhPaymentObj = { ...args } 

  try {
    console.log('Creating payment in Zoho with data:', JSON.stringify(zhPaymentObj, null, 2));
    const response = await zh.createRecord('customerpayments', zhPaymentObj);
    console.log('Payment created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error creating payment in Zoho:', error);
    throw new Error(`Failed to create payment in Zoho: ${error.message}`);
  }
}

async function getCustomerPayments(zhCustomerId){
  const response = await zh.getRecordsByParams('customerpayments', {
    customer_id: zhCustomerId,
  });
  return response;
}

const zohoPayments = {
  createCustomerPayment,
  getCustomerPayments,
};

export default zohoPayments;
