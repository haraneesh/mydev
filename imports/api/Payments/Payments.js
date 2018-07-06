/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Payments = new Mongo.Collection('Payments');
export default Payments;

if (Meteor.isServer) {
  Payments._ensureIndex({ orderId: 1 });
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
  orderId: {
    type: String,
    label: 'Order Id against which this payment was processed',
  },
  owner: {
    type: String,
    label: 'Customer Id against which this payment was processed',
  },
  paymentApiResponseObject: {
    type: Object,
    label: 'payment JSON object returned by payment gateway',
    blackbox: true,
  },
  paymentZohoResponseObject: {
    type: Object,
    label: 'payment JSON object returned by zoho payment api',
    blackbox: true,
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
