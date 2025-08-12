/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import rateLimit from '../../modules/rate-limit';
import zh from '../ZohoSyncUps/ZohoBooks';
import handleMethodException from '../../modules/handle-method-exception';
import { ZhInvoices } from '../ZhInvoices/ZhInvoices';

Meteor.methods({
  'invoices.getAll': async function getInvoices(invoiceIds) {
    check(invoiceIds, [String]);

    const invoices = [];
    if (Meteor.isServer) {
      for (const invoiceId of invoiceIds) {
        const r = await zh.getRecordById('invoices', invoiceId);
        if (r.code === 0 /* success */) {
            invoices.push(r.invoice);
        } else {
            handleMethodException(r.message, r.code);
        }
      }
      return invoices;
    }
  },

  async 'invoices.getUnpaidInvoices'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to view invoices');
    }

    try {
      // Get current user and extract Zoho contact ID
      const user = await Meteor.users.findOneAsync(this.userId);
      const customerId = user?.zh_contact_id;
      
      if (!customerId) {
        console.error('No Zoho contact ID found in user object:', JSON.stringify(user, null, 2));
        throw new Meteor.Error('no-customer', 'No Zoho contact ID found for this user');
      }
      
      if (!customerId) {
        console.error('No customer ID found in user object');
        throw new Meteor.Error('no-customer', 'No customer profile found for this user');
      }

      return await ZhInvoices.find({
        'customer.id': customerId,
        status: { $in: ['unpaid', 'overdue', 'partially_paid'] }
      }, {
        sort: { date: 1 } // Sort by invoice date
      }).fetchAsync();
    } catch (error) {
      console.error('Error in getUnpaidInvoices:', error);
      throw new Meteor.Error('server-error', 'Failed to retrieve unpaid invoices');
    }
  },

  async 'invoices.payInvoices'({ invoiceIds }) {
    check(invoiceIds, [String]);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to pay invoices');
    }

    if (!invoiceIds || invoiceIds.length === 0) {
      throw new Meteor.Error('invalid-parameters', 'No invoices selected for payment');
    }

    try {
      // Get current user's Zoho contact ID
      const user = await Meteor.users.findOneAsync(this.userId);
      const customerId = user?.zh_contact_id;
      
      if (!customerId) {
        console.error('No Zoho contact ID found in user object:', JSON.stringify(user, null, 2));
        throw new Meteor.Error('no-customer', 'No Zoho contact ID found for this user');
      }

      // Get the total amount to be paid
      const invoices = await ZhInvoices.find({
        _id: { $in: invoiceIds },
        'customer.id': customerId,
        status: { $in: ['unpaid', 'overdue', 'partially_paid'] }
      }).fetchAsync();

      if (invoices.length === 0) {
        throw new Meteor.Error('not-found', 'No unpaid invoices found');
      }

      const totalAmount = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
      
      // Here you would typically integrate with your payment gateway
      // For example: const paymentResult = PaymentGateway.charge(totalAmount, paymentMethod);
      // For now, we'll simulate a successful payment
      const paymentResult = { success: true, transactionId: `tx_${Date.now()}` };

      if (paymentResult.success) {
        // Update all invoices as paid
        ZhInvoices.update(
          { _id: { $in: invoiceIds } },
          { 
            $set: { 
              status: 'paid',
              last_payment_date: new Date(),
              payment_made: totalAmount,
              balance: 0,
              paymentTransactionId: paymentResult.transactionId
            } 
          },
          { multi: true }
        );

        // Here you might want to update the user's wallet balance
        // Meteor.users.update(this.userId, { $inc: { 'wallet.balance': -totalAmount } });

        return { success: true };
      } else {
        throw new Meteor.Error('payment-failed', 'Payment processing failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      throw new Meteor.Error('payment-error', error.message);
    }
  }
});

rateLimit({
  methods: ['invoices.getAll', 'invoices.getUnpaidInvoices', 'invoices.payInvoices'],
  limit: 5,
  timeRange: 1000,
});
