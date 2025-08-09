import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ZhInvoices } from './ZhInvoices';
import { check, Match } from 'meteor/check';

// Type definitions for user object
/**
 * @typedef {Object} UserEmail
 * @property {string} address - The email address
 * @property {boolean} verified - Whether the email is verified
 */

/**
 * @typedef {Object} UserProfile
 * @property {string[]} [roles] - User roles in profile
 */

/**
 * @typedef {Object} User
 * @property {string} _id - User ID
 * @property {UserEmail[]} [emails] - User emails
 * @property {UserProfile} [profile] - User profile
 * @property {string[]} [roles] - User roles
 * @property {string} [zh_contact_id] - Zoho contact ID
 */

// Extend Meteor.User type to include our custom fields
/**
 * @typedef {Meteor.User & {
 *   zh_contact_id?: string,
 *   roles?: string[],
 *   profile?: {
 *     roles?: string[]
 *   }
 * }} ExtendedUser
 */

/**
 * @typedef {Object} ZohoCustomer
 * @property {string} [email]
 * @property {string} [name]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ZohoInvoiceLineItem
 * @property {string} [item_id]
 * @property {string} [name]
 * @property {number} [quantity]
 * @property {number} [rate]
 * @property {number} [total]
 */

/**
 * @typedef {Object} ZohoInvoice
 * @property {string} [invoice_id]
 * @property {string} [_id]
 * @property {string|number} [reference_number] - The reference number which can be a string or number
 * @property {Date|string} [date]
 * @property {string} [status] - The status of the invoice, always stored as a string
 * @property {number} [total]
 * @property {ZohoCustomer} [customer]
 * @property {ZohoInvoiceLineItem[]} [line_items]
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

/**
 * Upsert a Zoho invoice into the ZhInvoices collection
 * @param {ZohoInvoice} invoice - The Zoho invoice object
 * @returns {String} - The ID of the upserted document
 */
const upsertZhInvoice = new ValidatedMethod({
  name: 'zhInvoices.upsert',
  validate(args) {
    // Convert status to string before validation if it exists
    if (args.invoice && args.invoice.status != null) {
      args.invoice.status = String(args.invoice.status);
    }
    
    check(args, {
      invoice: Match.ObjectIncluding({
        invoice_id: Match.Optional(String),
        _id: Match.Optional(String),
        reference_number: Match.OneOf(String, Number, null, undefined),
        date: Match.OneOf(String, Date, null),
        status: Match.Optional(String),
        total: Match.Optional(Number),
        customer: Match.Optional(Object),
        line_items: Match.Optional(Array),
      })
    });
    
    const { invoice } = args;
    
    // Check for required fields
    if (!invoice.invoice_id && !invoice._id) {
      throw new Meteor.Error('validation-error', 'Invoice must have either invoice_id or _id');
    }
  },
  /**
   * @param {Object} params
   * @param {ZohoInvoice} params.invoice
   */
  async run({ invoice }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update invoices');
    }

    const now = new Date();
    const { invoice_id } = invoice;
    
    // Check if invoice already exists
    const existingInvoice = await ZhInvoices.findOneAsync({ invoice_id });
    
    // Clean the invoice data to match the schema
    const invoiceData = {
      // Ensure invoice_id is always a string
      invoice_id: invoice.invoice_id != null ? String(invoice.invoice_id) : '',
      // Convert reference_number to string with type safety
      reference_number: (() => {
        const ref = invoice.reference_number;
        // Return empty string for null/undefined
        if (ref == null) return '';
        // Use a type-safe string conversion with fallback
        try {
          // @ts-ignore - We know this is safe
          return String(ref);
        } catch (e) {
          console.warn('Error converting reference_number to string:', e);
          return '';
        }
      })(),
      date: invoice.date ? new Date(invoice.date) : null,
      // Handle status with type safety
      status: (() => {
        const status = invoice.status;
        if (status == null) return 'draft';
        if (typeof status === 'string') return status;
        return String(status);
      })(),
      total: Number(parseFloat(invoice.total) || 0),
      customer: (() => {
        // Safely extract and type customer properties
        const customer = invoice.customer || {};
        return {
          email: customer.email ? String(customer.email) : '',
          name: customer.name ? String(customer.name) : '',
          id: customer.id ? String(customer.id) : '',
        };
      })(),
      // Process line items with proper type checking
      line_items: (Array.isArray(invoice.line_items) ? invoice.line_items : []).map(/** @param {any} item */ (item) => {
        // Ensure all item properties have the correct types
        const lineItem = item || {};
        const parsedItem = {
          item_id: '',
          name: '',
          quantity: 0,
          rate: 0,
          total: 0,
        };
        
        if (lineItem.item_id != null) parsedItem.item_id = String(lineItem.item_id);
        if (lineItem.name != null) parsedItem.name = String(lineItem.name);
        if (lineItem.quantity != null) parsedItem.quantity = Number(parseFloat(lineItem.quantity)) || 0;
        if (lineItem.rate != null) parsedItem.rate = Number(parseFloat(lineItem.rate)) || 0;
        if (lineItem.total != null) parsedItem.total = Number(parseFloat(lineItem.total)) || 0;
        
        return parsedItem;
      }),
      updatedAt: now,
    };

    if (existingInvoice) {
      // Preserve the original createdAt date
      invoiceData.createdAt = existingInvoice.createdAt;
      
      // Update existing invoice
      await ZhInvoices.updateAsync(
        { _id: existingInvoice._id },
        { $set: invoiceData }
      );
      return existingInvoice._id;
    } else {
      // Insert new invoice with current timestamp
      invoiceData.createdAt = now;
      const result = await ZhInvoices.insertAsync(invoiceData);
      return result;
    }
  },
});

/**
 * Upsert multiple Zoho invoices in bulk
 * @param {Array} invoices - Array of Zoho invoice objects
 * @returns {Object} - Object containing results of the bulk operation
 */
const bulkUpsertZhInvoices = new ValidatedMethod({
  name: 'zhInvoices.bulkUpsert',
  validate({ invoices }) {
    check(invoices, [Object]);
  },
  async run({ invoices }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update invoices');
    }

    const now = new Date();
    const results = {
      success: 0,
      errors: 0,
      errorDetails: [],
    };

    // Process each invoice
    for (const invoice of invoices) {
      try {
        const { invoice_id } = invoice;
        if (!invoice_id) {
          throw new Error('Invoice ID is required');
        }

        // Format the invoice data to match the schema
        const invoiceData = {
          invoice_id: invoice.invoice_id != null ? String(invoice.invoice_id) : '',
          reference_number: (() => {
            const ref = invoice.reference_number;
            if (ref == null) return '';
            return String(ref);
          })(),
          date: invoice.date ? new Date(invoice.date) : null,
          status: (() => {
            const status = invoice.status;
            if (status == null) return 'draft';
            if (typeof status === 'string') return status;
            return String(status);
          })(),
          total: Number(parseFloat(invoice.total) || 0),
          customer: (() => {
            // Ensure customer object exists and has required fields
            const customer = invoice.customer || {};
            if (!customer.email && !customer.id) {
              throw new Error('Customer email or ID is required');
            }
            return {
              email: customer.email ? String(customer.email) : '',
              name: customer.name ? String(customer.name) : '',
              id: customer.id ? String(customer.id) : '',
            };
          })(),
          // Process line items with proper type checking
          line_items: (Array.isArray(invoice.line_items) ? invoice.line_items : []).map((item) => {
            const lineItem = item || {};
            const parsedItem = {
              item_id: '',
              name: '',
              quantity: 0,
              rate: 0,
              total: 0,
            };
            
            if (lineItem.item_id != null) parsedItem.item_id = String(lineItem.item_id);
            if (lineItem.name != null) parsedItem.name = String(lineItem.name);
            if (lineItem.quantity != null) parsedItem.quantity = Number(parseFloat(lineItem.quantity)) || 0;
            if (lineItem.rate != null) parsedItem.rate = Number(parseFloat(lineItem.rate)) || 0;
            if (lineItem.total != null) parsedItem.total = Number(parseFloat(lineItem.total)) || 0;
            
            return parsedItem;
          }),
          updatedAt: now,
        };

        const existingInvoice = await ZhInvoices.findOneAsync({ invoice_id });

        if (existingInvoice) {
          // Update existing invoice, preserving the original createdAt
          invoiceData.createdAt = existingInvoice.createdAt;
          await ZhInvoices.updateAsync(
            { _id: existingInvoice._id },
            { $set: invoiceData }
          );
        } else {
          // Insert new invoice with current timestamp
          invoiceData.createdAt = now;
          await ZhInvoices.insertAsync(invoiceData);
        }
        results.success++;
      } catch (error) {
        console.error('Error processing invoice:', error);
        results.errors++;
        results.errorDetails.push({
          invoice: invoice?.invoice_id || 'unknown',
          error: error.message,
        });
      }
    }

    return results;
  },
});

/**
 * Fetches invoices for the current user based on their zh_contact_id
 * @returns {Promise<Array>} Array of invoices for the current user
 */
const getUserInvoices = new ValidatedMethod({
  name: 'zhInvoices.getUserInvoices',
  validate() {
    // No parameters to validate
  },
  async run() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to view invoices');
    }

    // Get the current user with just the zh_contact_id field using findOneAsync
    const user = await Meteor.users.findOneAsync(this.userId, {
      fields: { 'zh_contact_id': 1 }
    });

    // Safely access the zh_contact_id
    const zhContactId = user?.zh_contact_id;
    
    if (!zhContactId) {
      console.log('No zh_contact_id found for user', this.userId);
      return [];
    }

    try {
      // Ensure we have a valid contact ID that can be used in the query
      let contactId;
      if (zhContactId === null || zhContactId === undefined) {
        console.error('Contact ID is null or undefined');
        return [];
      }
      
      // Convert to string if it's a number, otherwise use as is
      contactId = typeof zhContactId === 'number' ? zhContactId.toString() : zhContactId;
      
      console.log('Contact ID:', contactId);


      // Find invoices where customer.id matches the user's zh_contact_id
      return ZhInvoices.find({
        'customer.id': contactId
      }, {
        sort: { date: -1 }, // Most recent first
        limit: 1000, // Reasonable limit to prevent performance issues
        fields: {
          invoice_id: 1,
          reference_number: 1,
          date: 1,
          status: 1,
          total: 1,
          balance: 1,
          'customer.name': 1,
          'customer.email': 1,
          'customer.id': 1,
          line_items: 1,
          notes: 1,
          terms: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }).fetch();
    } catch (error) {
      console.error('Error fetching user invoices:', error);
      throw new Meteor.Error('fetch-failed', 'Failed to fetch invoices');
    }
  }
});

import ZohoBooks from '../ZohoSyncUps/ZohoBooks';

/**
 * Fetches a single invoice by ID for the current user
 * @param {string} invoiceId - The ID of the invoice to fetch
 * @returns {Object} The invoice document
 */
const getInvoiceById = new ValidatedMethod({
  name: 'zhInvoices.getInvoiceById',
  validate({ invoiceId }) {
    check(invoiceId, String);
  },
  async run({ invoiceId }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to view invoices');
    }

    try {
      // First, check if we have a local copy of the invoice
      const localInvoice = await ZhInvoices.findOneAsync({ invoice_id: invoiceId });
      
      if (!localInvoice) {
        throw new Meteor.Error('not-found', 'Invoice not found in local database');
      }

      // Check authorization using local invoice data
      /** @type {ExtendedUser} */
      const user = await Meteor.users.findOneAsync(this.userId, {
        fields: { 
          'zh_contact_id': 1, 
          'profile': 1, 
          'roles': 1 
        }
      });
      
      if (!user) {
        throw new Meteor.Error('user-not-found', 'User not found');
      }
      
      const zhContactId = user.zh_contact_id;
      // Check for admin role
      const isAdmin = (user.roles && user.roles.includes('admin')) || 
                     (user.profile?.roles && user.profile.roles.includes('admin'));
      
      if (localInvoice.customer.id !== zhContactId && !isAdmin) {
        throw new Meteor.Error('not-authorized', 'You are not authorized to view this invoice');
      }

      // If authorized, fetch the full invoice details from Zoho Books
      try {
        const response = await ZohoBooks.getRecordById('invoices', invoiceId, {
          organization_id: Meteor.settings.private.zoho_organization_id
        });
        
        if (!response || response.code === -1 || !response.invoice) {
          console.error('Error fetching invoice from Zoho:', response);
          throw new Meteor.Error('api-error', response?.message || 'Failed to fetch invoice from Zoho');
        }
        
        // Return the full invoice details
        return response.invoice;
      } catch (error) {
        console.error('Zoho API error:', error);
        throw new Meteor.Error('api-error', `Zoho API error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in zhInvoices.getInvoiceById:', error);
      throw new Meteor.Error('server-error', 'Failed to fetch invoice');
    }
  },
});

// Export all methods
export { upsertZhInvoice, bulkUpsertZhInvoices, getUserInvoices, getInvoiceById };
