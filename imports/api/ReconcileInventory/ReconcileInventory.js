/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const ReconcileInventory = new Mongo.Collection('ReconcileInventory');

ReconcileInventory.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

ReconcileInventory.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

ReconcileInventory.schema = new SimpleSchema({
  updatedBy: {
    type: String,
    label: 'The ID of the user this record was created by.',
  },
  createdOn: {
    type: String,
    label: 'DDMMYYYY this was created on',
  },
  products: {
    type: Array,
    label: 'The list of products that were active.',
    optional: true,
  },
  'products.$': {
    type: Object,
    label: 'Defines Product',
  },
  'products.$.productId': {
    type: String,
    label: 'Product Id of the product',
  },
  'products.$.productName': {
    type: String,
    label: 'Product Name of the product',
  },
  'products.$.zohoProductInventory': {
    type: Number,
    label: 'Zoho stock on hand',
  },
  'products.$.reportedPhysicalInventory': {
    type: Number,
    label: 'Reported as physically available',
  },
  'products.$.unit': {
    type: String,
    label: 'Unit of measurement in zoho',
  },
  'products.$.differenceQty': {
    type: Number,
    label: 'Difference in Reported Quantity and Inventory',
  },
  createdAt: {
    type: Date,
    label: 'The date this document was created.',
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset();  // Prevent user from supplying their own value
    },
  },
  updatedAt: {
    type: Date,
    label: 'The date this document was last updated.',
    autoValue() {
      return (new Date());
    },
  },
});

ReconcileInventory.attachSchema(ReconcileInventory.schema);

export default ReconcileInventory;
