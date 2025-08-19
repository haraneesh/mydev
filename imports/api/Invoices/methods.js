import { check } from 'meteor/check';
/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import handleMethodException from '../../modules/handle-method-exception';
import rateLimit from '../../modules/rate-limit';
import { ZhInvoices } from '../ZhInvoices/ZhInvoices';
import zh from '../ZohoSyncUps/ZohoBooks';
import zohoPayments from '../ZohoSyncUps/zohoPayments';

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
      throw new Meteor.Error(
        'not-authorized',
        'You must be logged in to view invoices',
      );
    }

    try {
      // Get current user and extract Zoho contact ID
      const user = await Meteor.users.findOneAsync(this.userId);
      const customerId = user?.zh_contact_id;

      if (!customerId) {
        console.error(
          'No Zoho contact ID found in user object:',
          JSON.stringify(user, null, 2),
        );
        throw new Meteor.Error(
          'no-customer',
          'No Zoho contact ID found for this user',
        );
      }

      if (!customerId) {
        console.error('No customer ID found in user object');
        throw new Meteor.Error(
          'no-customer',
          'No customer profile found for this user',
        );
      }

      return await ZhInvoices.find(
        {
          'customer.id': customerId,
          status: { $in: ['unpaid', 'overdue', 'partially_paid', 'sent'] },
        },
        {
          sort: { date: 1 }, // Sort by invoice date
        },
      ).fetchAsync();
    } catch (error) {
      console.error('Error in getUnpaidInvoices:', error);
      throw new Meteor.Error(
        'server-error',
        'Failed to retrieve unpaid invoices',
      );
    }
  },
});

rateLimit({
  methods: ['invoices.getAll', 'invoices.getUnpaidInvoices'],
  limit: 5,
  timeRange: 1000,
});
