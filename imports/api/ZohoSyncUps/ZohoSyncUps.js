/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const ZohoSyncUps = new Mongo.Collection('ZohoSyncUps');
export default ZohoSyncUps;

if (Meteor.isServer) {
  ZohoSyncUps.rawCollection().createIndex({ syncEntity: 1, syncedForUser: 1 });
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

export const syncUpConstants = {
  products: 'products',
  users: 'users',
  ordersToZoho: 'orders-to-zoho',
  ordersFromZoho: 'orders-from-zoho',
  invoicesFromZoho: 'invoices-from-zoho',
  invoicesLastModifiedTimeFromZoho: 'invoices-last-modified-time-from-zoho',
  invoiceDetailsFromZoho: 'invoice-details-from-zoho',
  itemsFromZoho: 'items-from-zoho',
  salesDetailsByItemFromZoho: 'sales-details-by-item-from-zoho',
  purchaseOrdersFromZoho: 'purchaseOrders-from-zoho',
};

syncUpConstants.allowedValues = Object.keys(syncUpConstants).map((key) => syncUpConstants[key]);

ZohoSyncUps.schema = new SimpleSchema({
  syncDateTime: {
    type: Date,
    label: 'The time when the sync up happened',
  },
  noErrorSyncDate: {
    type: Date,
    label: 'The time when the sync up happened without error',
    optional: true,
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
    allowedValues: syncUpConstants.allowedValues,
  },
  syncedForUser: {
    type: String,
    label: 'The user for whom this was synced',
  },
});

ZohoSyncUps.attachSchema(ZohoSyncUps.schema);
