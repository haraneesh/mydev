/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import { ProductSchemaDefObject } from '../Products/Products';

const ProductLists = new Mongo.Collection('ProductLists');
export default ProductLists;

ProductLists.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

ProductLists.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

const productsSchemaDefObject = _.clone(ProductSchemaDefObject);
productsSchemaDefObject.totQuantityOrdered = {
  type: Number,
  label: 'The total quantity of this product that was ordered',
};

const ProductSchema = new SimpleSchema(productsSchemaDefObject);

ProductLists.schema = new SimpleSchema({
  _id: { type: String, label: 'The default _id of the Product List', optional: true },
  activeStartDateTime: { type: Date, label: 'DateTime from which Product List is available to order' },
  activeEndDateTime: { type: Date, label: 'DateTime up to which Product List is available to order' },
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
  products: { type: Array },
  'products.$': ProductSchema.omit('createdAt', 'updatedAt'),
  order_ids: { type: Array, optional: true },
  'order_ids.$': { type: String },
});

if (Meteor.isServer) {
  ProductLists.rawCollection().createIndex({ activeStartDateTime: 1, activeEndDateTime: 1 });
}

ProductLists.attachSchema(ProductLists.schema);
