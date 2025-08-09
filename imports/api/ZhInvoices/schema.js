/**
 * Type definitions for Zoho Invoice objects
 * This file helps with type checking without requiring TypeScript
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
 * @property {string} [status]
 * @property {number} [total]
 * @property {ZohoCustomer} [customer]
 * @property {ZohoInvoiceLineItem[]} [line_items]
 * @property {Date} [createdAt]
 * @property {Date} [updatedAt]
 */

// Export the types for use in other files
export const Types = {
  ZohoCustomer: {},
  ZohoInvoiceLineItem: {},
  ZohoInvoice: {}
};
