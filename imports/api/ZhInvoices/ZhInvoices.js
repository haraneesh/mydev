import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

// Create the collection
export const ZhInvoices = new Mongo.Collection('ZhInvoices');

// Define the schema
const ZhInvoiceSchema = new SimpleSchema({
  invoice_id: {
    type: String,
    label: 'Zoho Invoice ID',
  },
  reference_number: {
    type: SimpleSchema.oneOf({
      type: String,
      optional: true,
    }, {
      type: Number,
      optional: true,
    }),
    label: 'Reference Number (Sales Order)',
    optional: true,
    autoValue() {
      // Convert number to string when setting the value
      if (this.isSet && this.value !== null && this.value !== undefined) {
        return String(this.value);
      }
      return this.value;
    },
  },
  date: {
    type: Date,
    label: 'Invoice Date',
  },
  status: {
    type: String,
    label: 'Invoice Status',
    allowedValues: ['draft', 'sent', 'paid', 'overdue', 'void', 'unpaid', 'partially_paid'],
  },
  total: {
    type: Number,
    label: 'Invoice Total',
    min: 0,
  },
  customer: {
    type: Object,
    label: 'Customer Information',
  },
  'customer.name': {
    type: String,
    label: 'Customer Name',
    optional: true,
  },
  'customer.id': {
    type: String,
    label: 'Customer ID',
    optional: true,
  },
  balance: {
    type: Number,
    label: 'Invoice Balance',
    optional: true,
    min: 0,
  },
  created_time: {
    type: Date,
    label: 'Created Time',
    optional: true,
  },
  last_modified_time: {
    type: Date,
    label: 'Last Modified Time',
    optional: true,
  },
  invoice_number: {
    type: String,
    label: 'Invoice Number',
    optional: true,
  },
  due_date: {
    type: Date,
    label: 'Due Date',
    optional: true,
  },
  line_items: {
    type: Array,
    label: 'Line Items',
    optional: true,
  },
  'line_items.$': {
    type: Object,
  },
  'line_items.$.item_id': {
    type: String,
    label: 'Item ID',
  },
  'line_items.$.name': {
    type: String,
    label: 'Item Name',
  },
  'line_items.$.quantity': {
    type: Number,
    label: 'Quantity',
    min: 0,
  },
  'line_items.$.rate': {
    type: Number,
    label: 'Rate',
    min: 0,
  },
  'line_items.$.total': {
    type: Number,
    label: 'Line Item Total',
    min: 0,
  },
  // Timestamps will be handled by MongoDB or explicitly in methods
  createdAt: {
    type: Date,
    optional: true,
  },
  updatedAt: {
    type: Date,
    optional: true,
  },
});

// Add indexes for better query performance
if (Meteor.isServer) {
  // Create indexes when the server starts
  Meteor.startup(() => {
    // Index on invoice_id for fast lookups
    ZhInvoices.rawCollection().createIndex({ invoice_id: 1 }, { unique: true });
    
    // Index on reference_number for querying by sales order number
    ZhInvoices.rawCollection().createIndex({ reference_number: 1 });
    
    // Index on date for date range queries
    ZhInvoices.rawCollection().createIndex({ date: 1 });
    
    // Index on customer email for user-specific queries
    ZhInvoices.rawCollection().createIndex({ 'customer.email': 1 });
  });
}

// Attach the schema to the collection (only in development)
if (Meteor.isDevelopment) {
  // @ts-ignore - attachSchema is added by aldeed:collection2
  if (typeof ZhInvoices.attachSchema === 'function') {
    // @ts-ignore
    ZhInvoices.attachSchema(ZhInvoiceSchema);
  }
}

export default ZhInvoices;
