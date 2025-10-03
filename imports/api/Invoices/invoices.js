import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

export const Invoices = new Mongo.Collection('invoices');

// Schema for invoice validation
const InvoiceSchema = new SimpleSchema({
  _id: {
    type: String,
  },
  userId: {
    type: String,
  },
  invoiceNumber: {
    type: String,
    optional: true,
  },
  customerId: {
    type: String,
    optional: true,
  },
  invoiceDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  status: {
    type: String,
    allowedValues: ['draft', 'sent', 'paid', 'overdue', 'void'],
    defaultValue: 'draft',
  },
  total: {
    type: Number,
    min: 0,
  },
  items: {
    type: Array,
    optional: true,
  },
  'items.$': {
    type: Object,
  },
  'items.$.productId': {
    type: String,
  },
  'items.$.description': {
    type: String,
  },
  'items.$.quantity': {
    type: Number,
    min: 0,
  },
  'items.$.unitPrice': {
    type: Number,
    min: 0,
  },
  'items.$.amount': {
    type: Number,
    min: 0,
  },
  notes: {
    type: String,
    optional: true,
  },
  paidAt: {
    type: Date,
    optional: true,
  },
  paymentTransactionId: {
    type: String,
    optional: true,
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      return this.unset();
    },
  },
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isUpdate) {
        return new Date();
      }
      return undefined;
    },
    optional: true,
  },
});

// Attach the schema to the collection
Invoices.attachSchema(InvoiceSchema);

// Export the collection
if (Meteor.isServer) {
  // Create indexes for better query performance
  Meteor.startup(async () => {
    try {
      await Invoices.rawCollection().createIndex({ userId: 1 });
      await Invoices.rawCollection().createIndex({ status: 1 });
      await Invoices.rawCollection().createIndex({ dueDate: 1 });
    } catch (error) {
      console.error('Error creating indexes for Invoices collection:', error);
    }
  });
}

export default Invoices;
