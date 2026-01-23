/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Payments = new Mongo.Collection('Payments');
export default Payments;

if (Meteor.isServer) {
  Payments.rawCollection().createIndex({ orderId: 1 });
}

Payments.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Payments.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Payments.schema = new SimpleSchema({
  owner: {
    type: String,
    label: 'Customer Id against which this payment was processed',
  },
  orderId: {
    type: String,
    label: 'OrderId of the transaction',
    optional: true,
  },
  paymentApiInitiationResponseObject: {
    type: Object,
    label: 'payment JSON initiation return response from gateway',
    blackbox: true,
    optional: true,
  },
  paymentApiResponseObject: {
    type: Object,
    label: 'payment JSON object returned by payment gateway',
    blackbox: true,
    optional: true,
  },
  paymentZohoResponseObject: {
    type: Object,
    label: 'payment JSON object returned by zoho payment api',
    blackbox: true,
    optional: true,
  },
  contactZohoResponseObject: {
    type: Object,
    label: 'contact JSON object returned by zoho contact api',
    blackbox: true,
    optional: true,
  },
  errorObject: {
    type: Array,
    label: 'error JSON object returned by any of the calls',
    blackbox: true,
    optional: true,
  },
  'errorObject.$': {
    type: Object,
    blackbox: true,
    optional: true,
  },
  status: {
    type: String,
    label: 'Status of the payment',
    allowedValues: ['pending', 'completed', 'failed', 'refunded', 'error'],
    optional: true,
  },
  paymentMethod: {
    type: String,
    label: 'Payment mode used',
    optional: true,
  },
  totalAmount: {
    type: Number,
    label: 'Total amount paid',
    optional: true,
  },
  relatedInvoices: {
    type: Array,
    label: 'List of invoice IDs paid in this transaction',
    optional: true,
  },
  'relatedInvoices.$': {
    type: String,
  },
  invoiceCount: {
    type: Number,
    optional: true,
  },
  processedAt: {
    type: Date,
    optional: true,
  },
  error: {
    type: SimpleSchema.oneOf({
      type: String,
      optional: true,
    }, {
      type: Object,
      blackbox: true,
      optional: true,
    }),
    optional: true,
  },
  errorDetails: {
    type: String,
    optional: true,
  },
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

export const PaymentConstants = {
  products: 'products',
  users: 'users',
  ordersToZoho: 'orders-to-zoho',
  ordersFromZoho: 'orders-from-zoho',
  invoicesFromZoho: 'invoices-from-zoho',
};

Payments.attachSchema(Payments.schema);
