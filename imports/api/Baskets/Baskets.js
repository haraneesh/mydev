/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Baskets = new Mongo.Collection('Baskets');
export default Baskets;

Baskets.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Baskets.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Baskets.schema = new SimpleSchema({
  _id: { type: String, label: 'The default _id of the Product List' },
  name: { type: String, label: 'Basket Name' },
  description: { type: String, optional: true, label: 'Basket Description' },
  owner: { type: String },
  isOwnerAdmin: { type: Boolean },
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
  products: { type: Array, minCount: 1 },
  'products.$': { type: Object },
  'products.$._id': { type: String, label: 'The _id of the Product' },
  'products.$.quantity': { type: String, label: 'The unit of sale of the product.', defaultValue: 0 },
  order_ids: { type: Array, optional: true },
  'order_ids.$': { type: String },
});

if (Meteor.isServer) {
  Baskets.rawCollection().createIndex({ owner: 1 }, { name: 'owner_1' });
}

Baskets.attachSchema(Baskets.schema);
