import { check } from 'meteor/check';
/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import handleMethodException from '../../modules/handle-method-exception';
import rateLimit from '../../modules/rate-limit';
import { ZhInvoices } from '../ZhInvoices/ZhInvoices';
import zh from '../ZohoSyncUps/ZohoBooks';
import zohoPayments from '../ZohoSyncUps/zohoPayments';

// Cooldown to prevent excessive syncs (1 minute)
const SYNC_COOLDOWN_MS = 60000;
const lastSyncTimes = new Map(); // userId -> timestamp

/**
 * Bulk fetch and update invoices from Zoho Books
 * @param {Array} localInvoices - Array of local invoice objects
 * @param {String} customerId - Zoho customer ID
 * @returns {Promise<Array>} Updated invoices
 */
async function fetchAndUpdateInvoicesFromZoho(localInvoices, customerId) {
  if (!localInvoices || localInvoices.length === 0) {
    return [];
  }

  try {
    console.log(`Bulk fetching invoices from Zoho for customer ${customerId}...`);

    // Bulk fetch overdue invoices for this customer in ONE API call
    // customer_id is already the Zoho contact ID from user.zh_contact_id
    const response = await zh.getRecordsByParams('invoices', {
      customer_id: customerId,
      status: 'overdue',
      per_page: 200, // Zoho's maximum
    });

    if (response.code !== 0 || !response.invoices) {
      console.error('Failed to fetch invoices from Zoho:', response.message);
      // Return local invoices if Zoho fetch fails
      return localInvoices;
    }

    console.log(`Fetched ${response.invoices.length} invoices from Zoho Books`);

    // Create a map of local invoice IDs for quick lookup
    const localInvoiceIds = new Set(localInvoices.map((inv) => inv.invoice_id));

    // Filter to only the invoices we have locally
    const relevantInvoices = response.invoices.filter((inv) =>
      localInvoiceIds.has(inv.invoice_id),
    );

    console.log(`Found ${relevantInvoices.length} relevant invoices to update`);

    if (relevantInvoices.length === 0) {
      return localInvoices;
    }

    // Prepare bulk update operations
    const bulkOps = relevantInvoices.map((invoice) => ({
      updateOne: {
        filter: { invoice_id: invoice.invoice_id },
        update: {
          $set: {
            status: invoice.status,
            balance: parseFloat(invoice.balance) || 0,
            total: parseFloat(invoice.total) || 0,
            last_modified_time: invoice.last_modified_time
              ? new Date(invoice.last_modified_time)
              : new Date(),
            updatedAt: new Date(),
          },
        },
      },
    }));

    // Execute bulk update
    if (bulkOps.length > 0) {
      const result = await ZhInvoices.rawCollection().bulkWrite(bulkOps);
      console.log(
        `Bulk update complete: ${result.modifiedCount} invoices updated`,
      );
    }

    // Fetch and return updated invoices from database
    return await ZhInvoices.find(
      {
        'customer.id': customerId,
        status: { $in: ['unpaid', 'overdue', 'partially_paid', 'sent'] },
      },
      {
        sort: { date: 1 },
      },
    ).fetchAsync();
  } catch (error) {
    console.error('Error in fetchAndUpdateInvoicesFromZoho:', error);
    // Return local invoices if sync fails
    return localInvoices;
  }
}

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
      // 1. Get user, customer ID, and outstanding amount
      const user = await Meteor.users.findOneAsync(this.userId);
      const customerId = user?.zh_contact_id;
      const outstandingAmountInRs =
        (user?.wallet?.outstanding_receivable_amount_InPaise || 0) / 100;

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

      // 2. Fetch local invoices
      const localInvoices = await ZhInvoices.find(
        {
          'customer.id': customerId,
          status: { $in: ['unpaid', 'overdue', 'partially_paid', 'sent'] },
        },
        {
          sort: { date: 1 }, // Sort by invoice date
        },
      ).fetchAsync();

      // 3. Calculate sum of balances
      const sumOfBalances = localInvoices.reduce(
        (sum, inv) => sum + (inv.balance || 0),
        0,
      );

      console.log(
        `Invoice balance sum: ₹${sumOfBalances.toFixed(2)}, Outstanding amount: ₹${outstandingAmountInRs.toFixed(2)}`,
      );

      // 4. Check if sync is needed and cooldown has passed
      const lastSyncTime = lastSyncTimes.get(this.userId);
      const cooldownPassed =
        !lastSyncTime || Date.now() - lastSyncTime > SYNC_COOLDOWN_MS;

      if (sumOfBalances > outstandingAmountInRs && cooldownPassed) {
        console.log(
          'Discrepancy detected! Syncing invoices from Zoho Books...',
        );

        // Update last sync time
        lastSyncTimes.set(this.userId, Date.now());

        // 5. Bulk fetch and update from Zoho
        const updatedInvoices = await fetchAndUpdateInvoicesFromZoho(
          localInvoices,
          customerId,
        );

        console.log(`Sync complete. Returning ${updatedInvoices.length} invoices.`);

        return updatedInvoices;
      } else if (sumOfBalances > outstandingAmountInRs && !cooldownPassed) {
        console.log(
          'Sync needed but cooldown active. Returning local invoices.',
        );
      } else {
        console.log('No sync needed. Returning local invoices.');
      }

      // 6. Return local data if no sync needed
      return localInvoices;
    } catch (error) {
      console.error('Error in getUnpaidInvoices:', error);
      throw new Meteor.Error(
        'server-error',
        'Failed to retrieve open invoices',
      );
    }
  },
});

rateLimit({
  methods: ['invoices.getAll', 'invoices.getUnpaidInvoices'],
  limit: 5,
  timeRange: 1000,
});
