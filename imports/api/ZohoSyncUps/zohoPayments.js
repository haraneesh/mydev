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


/**
 * Get latest payments for a customer
 * @param {string} zhCustomerId - Zoho customer ID
 * @param {Object} [options] - Additional options
 * @param {number} [options.limit=10] - Number of payments to return (max 200)
 * @param {number} [options.page=1] - Page number for pagination
 * @returns {Promise<Object>} Zoho API response with payments array
 */
async function getCustomerPayments(zhCustomerId, { limit = 10, page = 1 } = {}) {
  try {
    const response = await zh.getRecordsByParams('customerpayments', {
      customer_id: zhCustomerId,
      sort_column: 'date',
      sort_order: 'D', // Descending order (newest first)
      per_page: Math.min(limit, 200), // Zoho's max per page is 200
      page,
    });
    return response;
  } catch (error) {
    console.error('Error fetching customer payments:', error);
    throw new Error(`Failed to fetch payments: ${error.message}`);
  }
}

import { Meteor } from 'meteor/meteor';
import { ZhPayments } from '../ZhPayments/ZhPayments';
import { ZhCreditNotes } from '../ZhCreditNotes/ZhCreditNotes';

/**
 * Get latest payments for the currently logged-in user and save them to ZhPayments collection
 * @returns {Promise<Array>} Array of payment objects
 */
Meteor.methods({
  async 'zohoPayments.getMyRecentPayments'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      const user = Meteor.users.findOne(this.userId);
      if (!user?.zh_contact_id) {
        throw new Meteor.Error('missing-zoho-id', 'No Zoho contact ID found for user');
      }

      const response = await getCustomerPayments(user.zh_contact_id, { limit: 10 });
      const payments = response.customerpayments || [];
      
      // Save each payment to the ZhPayments collection
      if (payments.length > 0) {
        payments.forEach(payment => {
          const paymentData = {
            payment_id: payment.payment_id,
            payment_number: payment.payment_number,
            date: new Date(payment.date),
            payment_mode: payment.payment_mode,
            amount: payment.amount,
            unused_amount: payment.unused_amount,
            reference_number: payment.reference_number,
            description: payment.description,
            customer_id: payment.customer_id,
            customer_name: payment.customer_name,
            invoices: (payment.invoices || []).map(inv => ({
              invoice_id: inv.invoice_id,
              amount_applied: inv.amount_applied
            }))
          };

          // Upsert the payment
          ZhPayments.upsert(
            { payment_id: payment.payment_id },
            { $set: paymentData },
            { multi: false }
          );
        });
      }

      return payments;
    } catch (error) {
      console.error('Error in zohoPayments.getMyRecentPayments:', error);
      throw new Meteor.Error('fetch-failed', error.message);
    }
  },

  /**
   * Retrieves and stores the top 10 open credit notes from Zoho
   * @returns {Promise<Array>} Array of open credit note objects
   */
  async 'zohoPayments.getOpenCreditNotes'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      // Fetch open credit notes from Zoho
      const response = await zh.getRecordsByParams('creditnotes', {
        status: 'open',
        sort_column: 'date',
        sort_order: 'D', // Most recent first
        per_page: 10,   // Limit to 10 records
      });

      const creditNotes = response.creditnotes || [];
      
      // Save each credit note to the ZhCreditNotes collection
      if (creditNotes.length > 0) {
        creditNotes.forEach(creditNote => {
          const creditNoteData = {
            creditnote_id: creditNote.creditnote_id,
            creditnote_number: creditNote.creditnote_number,
            date: new Date(creditNote.date),
            status: creditNote.status,
            total: creditNote.total,
            balance: creditNote.balance,
            customer_id: creditNote.customer_id,
            customer_name: creditNote.customer_name,
            reference_number: creditNote.reference_number,
            description: creditNote.notes,
            line_items: (creditNote.line_items || []).map(item => ({
              item_id: item.item_id,
              name: item.name,
              quantity: item.quantity,
              rate: item.rate,
              total: item.item_total
            }))
          };

          // Upsert the credit note
          ZhCreditNotes.upsert(
            { creditnote_id: creditNote.creditnote_id },
            { $set: creditNoteData },
            { multi: false }
          );
        });
      }

      return creditNotes;
    } catch (error) {
      console.error('Error in zohoPayments.getOpenCreditNotes:', error);
      throw new Meteor.Error('fetch-failed', `Failed to fetch credit notes: ${error.message}`);
    }
  },
});

const zohoPayments = {
  createCustomerPayment,
  getCustomerPayments,
  getOpenCreditNotes: 'zohoPayments.getOpenCreditNotes',
  getMyRecentPayments: 'zohoPayments.getMyRecentPayments'
};

export default zohoPayments;
