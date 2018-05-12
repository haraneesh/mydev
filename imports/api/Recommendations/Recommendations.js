/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Recommendations = new Mongo.Collection('Recommendations');

Recommendations.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Recommendations.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});


const PreviousOrderedProductsSchema = new SimpleSchema({
  prevOrderedProducts: { type: Object, blackbox: true },
  prevOrdersConsidered: { type: Array },
  'prevOrdersConsidered.$': { type: String, label: 'Order Ids of the orders considered' },
});

Recommendations.schema = new SimpleSchema({
  _id: { type: String, label: 'The default _id of the product', optional: true },
  customerId: { type: String, label: 'The _id field of the user for whom this recommendation is created for' },
  recPrevOrderedProducts: { type: PreviousOrderedProductsSchema },
  createdAt: {
    type: Date,
    label: 'The date this user recommendation was created.',
    optional: true,
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
    label: 'The date this user recommendation was last updated.',
    optional: true,
    autoValue() {
      if (this.isInsert || this.isUpdate || this.isUpsert) return (new Date());
    },
  },
});

if (Meteor.isServer) {
  Recommendations._ensureIndex({ customerId: 1 }, { unique: true });
}

Recommendations.attachSchema(Recommendations.schema);
export default Recommendations;

