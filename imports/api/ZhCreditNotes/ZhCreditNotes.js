import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

// Create the collection
export const ZhCreditNotes = new Mongo.Collection('ZhCreditNotes');

// Define the schema
const ZhCreditNoteSchema = new SimpleSchema({
  creditnote_id: {
    type: String,
    label: 'Zoho Credit Note ID',
  },
  creditnote_number: {
    type: String,
    label: 'Credit Note Number',
  },
  date: {
    type: Date,
    label: 'Credit Note Date',
  },
  status: {
    type: String,
    label: 'Credit Note Status',
    allowedValues: ['open', 'closed', 'void'],
  },
  total: {
    type: Number,
    label: 'Total Amount',
    min: 0,
  },
  balance: {
    type: Number,
    label: 'Balance Amount',
    min: 0,
  },
  customer_id: {
    type: String,
    label: 'Zoho Customer ID',
  },
  customer_name: {
    type: String,
    label: 'Customer Name',
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
    optional: true,
  },
  'line_items.$.name': {
    type: String,
  },
  'line_items.$.quantity': {
    type: Number,
    min: 0,
  },
  'line_items.$.rate': {
    type: Number,
    min: 0,
  },
  'line_items.$.total': {
    type: Number,
    min: 0,
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
ZhCreditNotes.attachSchema(ZhCreditNoteSchema);

export default ZhCreditNotes;
