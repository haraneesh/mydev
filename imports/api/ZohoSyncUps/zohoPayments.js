import zh from './ZohoBooks';

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
import { check, Match } from 'meteor/check';
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
      const user = await Meteor.users.findOneAsync(this.userId);
      if (!user?.zh_contact_id) {
        throw new Meteor.Error('missing-zoho-id', 'No Zoho contact ID found for user');
      }

      const response = await getCustomerPayments(user.zh_contact_id, { limit: 10 });
      const payments = response.customerpayments || [];
      
      // Clear existing records for this customer before inserting fresh ones
      await ZhPayments.removeAsync({ customer_id: user.zh_contact_id });
      
      // Save each payment to the ZhPayments collection
      if (payments.length > 0) {
        for (const payment of payments) {
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

          // Upsert the payment (async)
          await ZhPayments.upsertAsync(
            { payment_id: payment.payment_id },
            { $set: paymentData },
            { multi: false }
          );
        }
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
      // Resolve Zoho contact for the logged-in user
      const user = await Meteor.users.findOneAsync(this.userId);
      if (!user?.zh_contact_id) {
        throw new Meteor.Error('missing-zoho-id', 'No Zoho contact ID found for user');
      }

      // Fetch open credit notes for this customer from Zoho
      const response = await zh.getRecordsByParams('creditnotes', {
        status: 'open',
        customer_id: user.zh_contact_id,
        sort_column: 'date',
        sort_order: 'D', // Most recent first
        per_page: 10,   // Limit to 10 records
      });

      const creditNotes = response.creditnotes || [];
      
      // Clear existing records for this customer before inserting fresh ones
      await ZhCreditNotes.removeAsync({ customer_id: user.zh_contact_id });
      
      // Save each credit note to the ZhCreditNotes collection
      if (creditNotes.length > 0) {
        for (const creditNote of creditNotes) {
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

          // Upsert the credit note (async)
          await ZhCreditNotes.upsertAsync(
            { creditnote_id: creditNote.creditnote_id },
            { $set: creditNoteData },
            { multi: false }
          );
        }
      }

      return creditNotes;
    } catch (error) {
      console.error('Error in zohoPayments.getOpenCreditNotes:', error);
      throw new Meteor.Error('fetch-failed', `Failed to fetch credit notes: ${error.message}`);
    }
  },
  
  /**
   * Apply credits (credit notes and/or customer payments) to an invoice in Zoho.
   * Mirrors https://www.zoho.com/books/api/v3/invoices/#apply-credits
   *
   * @param {Object} params
   * @param {string} params.invoice_id - Zoho invoice ID
   * @param {Array<{creditnote_id:string, amount:number}>} [params.creditnotes] - Credits from credit notes
   * @param {Array<{payment_id:string, amount:number}>} [params.customerpayments] - Credits from customer payments (unused amounts)
   * @returns {Promise<Object>} Zoho API response
   */
  async 'zoho.applyPaymentToInvoice'(params) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      // Validate arguments early to satisfy audit-argument-checks
      check(params, {
        invoice_id: String,
        creditnotes: Match.Optional(Array),
        customerpayments: Match.Optional(Array),
      });

      const { invoice_id, creditnotes = [], customerpayments = [] } = params || {};

      if (!invoice_id || typeof invoice_id !== 'string') {
        throw new Meteor.Error('invalid-params', 'invoice_id is required');
      }

      // Basic validation for arrays
      if (!Array.isArray(creditnotes) || !Array.isArray(customerpayments)) {
        throw new Meteor.Error('invalid-params', 'creditnotes and customerpayments must be arrays');
      }

      // Build Zoho payload: invoice_payments and apply_creditnotes are expected
      const payload = {
        apply_creditnotes: creditnotes
          .filter(cn => cn && typeof cn.creditnote_id === 'string' && Number(cn.balance) > 0)
          .map(cn => ({
            creditnote_id: cn.creditnote_id,
            amount_applied: Number(cn.balance),
          })),
        invoice_payments: customerpayments
          .filter(p => p && typeof p.payment_id === 'string' && Number(p.unused_amount) > 0)
          .map(p => ({
            payment_id: p.payment_id,
            amount_applied: Number(p.unused_amount),
          })),
      };

      // Ensure there's at least one credit to apply
      const hasCredits = (payload.apply_creditnotes && payload.apply_creditnotes.length > 0)
        || (payload.invoice_payments && payload.invoice_payments.length > 0);
      if (!hasCredits) {
        throw new Meteor.Error('no-credits', 'No credits to apply');
      }

      // Call Zoho Books endpoint: POST /invoices/{invoice_id}/credits
      const response = await zh.postRecordByIdAndParams({
        module: 'invoices',
        id: invoice_id,
        submodule: 'credits',
        params: payload,
        connectionInfo: undefined,
        getParamsWithPost: undefined,
      });

      if (response?.code && response.code !== 0) {
        throw new Meteor.Error('api-error', response.message || 'Zoho API error while applying credits');
      }

      return response;
    } catch (error) {
      // Normalize and rethrow
      const reason = error?.reason || error?.message || 'Failed to apply credits to invoice';
      console.error('Error in zoho.applyPaymentToInvoice:', error);
      throw new Meteor.Error('apply-credits-failed', reason);
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
