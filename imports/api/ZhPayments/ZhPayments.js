import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

// Create the collection
export const ZhPayments = new Mongo.Collection('ZhPayments');

// Define the schema
const ZhPaymentSchema = new SimpleSchema({
  payment_id: {
    type: String,
    label: 'Zoho Payment ID',
  },
  payment_number: {
    type: String,
    label: 'Payment Number',
  },
  date: {
    type: Date,
    label: 'Payment Date',
  },
  payment_mode: {
    type: String,
    label: 'Payment Mode',
  },
  amount: {
    type: Number,
    label: 'Payment Amount',
    min: 0,
  },
  unused_amount: {
    type: Number,
    label: 'Unused Payment Amount',
    min: 0,
    optional: true,
    defaultValue: 0,
  },
  reference_number: {
    type: String,
    label: 'Reference Number',
    optional: true,
  },
  description: {
    type: String,
    label: 'Description',
    optional: true,
  },
  customer_id: {
    type: String,
    label: 'Zoho Customer ID',
  },
  customer_name: {
    type: String,
    label: 'Customer Name',
  },
  invoices: {
    type: Array,
    label: 'Applied Invoices',
    optional: true,
  },
  'invoices.$': {
    type: Object,
  },
  'invoices.$.invoice_id': {
    type: String,
  },
  'invoices.$.amount_applied': {
    type: Number,
  },
  created_at: {
    type: Date,
    label: 'Created At',
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      return this.unset();
    },
  },
  updated_at: {
    type: Date,
    label: 'Updated At',
    autoValue() {
      return new Date();
    },
  },
});

// Attach the schema to the collection
ZhPayments.attachSchema(ZhPaymentSchema);

// Export the collection and schema
export default ZhPayments;
