/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  totalInvoicedAmount: { type: Number, label: 'The total bill amount.', min: 0 },
  createdAt: { type: Date, label: 'The date on which the invoice was created in Zoho.' },
  updatedAt: {
    type: Date, label: 'The date on which the invoice was last modified in Zoho',
  },
  balanceInvoicedAmount: { type: Number, label: 'Balance amount to be received from the customer.', min: 0 },
  zhNotes: { type: String, label: 'Notes sent in the zoho invoice', optional: true },
  zhInvoiceId: { type: String, label: 'Corresponding Zoho Sales Order Id' },
  zhInvoiceStatus: { type: String, label: 'Status of the invoice in Zoho.' },
});

const ZohoLineItemsSchemaDefObj = new SimpleSchema({
  line_item_id: String,
  item_id: String,
  item_type: String,
  name: String,
  item_order: Number,
  bcy_rate: Number,
  rate: Number,
  quantity: Number,
  unit: String,
  discount_amount: Number,
  discount: Number,
});

export const ZhInvoices = new Mongo.Collection('ZhInvoices');
ZhInvoices.schema = new SimpleSchema({
  invoice_id: { type: String },
  date: { type: String },
  status: { type: String },
  due_date: { type: String },
  last_payment_date: { type: String, optional: true },
  reference_number: { type: String },
  balance: { type: Number },
  customer_id: { type: String },
  created_time: { type: Date },
  last_modified_time: { type: String },
  invoice_url: { type: String },
  line_items: { type: Array, optional: true },
  'line_items.$': ZohoLineItemsSchemaDefObj,
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset(); // Prevent user from supplying their own value
    },
    optional: true,
  },
  // Force value to be current date (on server) upon update
  // and don't allow it to be set upon insert.
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isInsert || this.isUpdate || this.isUpsert) {
        return new Date();
      }
    },
    optional: true,
  },
});

ZhInvoices.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

ZhInvoices.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

if (Meteor.isServer) {
  // ZhInvoices.rawCollection().createIndex({ reference_number: 1, customer_id: 1 }, { unique: false });
  ZhInvoices.rawCollection().createIndex({ created_time: 1 }, { unique: false });
  ZhInvoices.rawCollection().createIndex({ invoice_id: 1 }, { unique: true });
}

ZhInvoices.attachSchema(ZhInvoices.schema);
