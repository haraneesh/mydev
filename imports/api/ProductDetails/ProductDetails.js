/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const ProductDetails = new Mongo.Collection('ProductDetails');
export default ProductDetails;

ProductDetails.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

ProductDetails.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

ProductDetails.schema = new SimpleSchema({
  _id: { type: String, label: 'The default _id of the supplier', optional: true },
  title: {
    type: String,
    label: 'The title of the special announcement.',
    optional: true,
  },
  productId: { type: String, label: 'The id of the product whose details are saved here' },
  description: {
    type: String,
    label: 'The recipe goes here.',
    optional: true,
  },
  imageUrl: {
    type: String,
    label: 'The url of the image of the special announcement',
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
});

if (Meteor.isServer) {
  ProductDetails._ensureIndex({ productId: 1 });
}

ProductDetails.attachSchema(ProductDetails.schema);
