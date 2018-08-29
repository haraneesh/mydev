/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const ZohoSyncUps = new Mongo.Collection('ZohoSyncUps');
export default ZohoSyncUps;

if (Meteor.isServer) {
  ZohoSyncUps._ensureIndex({ syncEntity: 1, syncedForUser: 1 });
}

ZohoSyncUps.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

ZohoSyncUps.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

ZohoSyncUps.schema = new SimpleSchema({
  syncDateTime: {
    type: Date,
    label: 'The time when the sync up happened',
  },
  errorRecords: {
    type: Array,
    optional: true,
    label: 'The ID of the post to which this comment is attached.',
  },
  'errorRecords.$': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  successRecords: {
    type: Array,
    optional: true,
    blackbox: true,
    label: 'The comment goes here.',
  },
  'successRecords.$': {
    type: Object,
    optional: true,
    blackbox: true,
  },
  syncEntity: {
    type: String,
    label: 'The collection that was synced.',
    allowedValues: ['products', 'users', 'orders-to-zoho', 'orders-from-zoho', 'invoices-from-zoho', 'items-from-zoho','purchaseOrders-from-zoho'],
  },
  syncedForUser: {
    type: String,
    label: 'The user for whom this was synced',
  },
});

export const syncUpConstants = {
  products: 'products',
  users: 'users',
  ordersToZoho: 'orders-to-zoho',
  ordersFromZoho: 'orders-from-zoho',
  invoicesFromZoho: 'invoices-from-zoho',
  itemsFromZoho: 'items-from-zoho',
  purchaseOrdersFromZoho: 'purchaseOrders-from-zoho',
};

ZohoSyncUps.attachSchema(ZohoSyncUps.schema);
