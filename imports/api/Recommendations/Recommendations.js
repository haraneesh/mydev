/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { ProductSchemaDefObject } from '../Products/Products';

const Recommendations = new Mongo.Collection('Recommendations');
export default Recommendations;

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

const productsSchemaDefObject = _.clone(ProductSchemaDefObject);
productsSchemaDefObject.quantity = { type: Number, label: 'The quantity of a particular product that was ordered', defaultValue: 0 };

const ProductSchema = new SimpleSchema(productsSchemaDefObject);

export const RecommendationsSchemaDefObject = {
  _id: { type: String, label: 'The default _id of the product', optional: true },
  customerId: { type: String, label: 'The _id field of the user for whom this recommendation is created' },
  prevOrderedProducts: { type: Array },
  'prevOrderedProducts.$': ProductSchema.omit('createdAt', 'updatedAt'),
  recommendedProducts: { type: Array },
  'recommendedProducts.$': ProductSchema.omit('createdAt', 'updatedAt'),
  createdAt: {
    type: Date,
    label: 'The date this user recommendation was created.',
    optional: true,
    autoValue() {
      if (this.isInsert) return (new Date());
    },
  },
  updatedAt: {
    type: Date,
    label: 'The date this user recommendation was last updated.',
    optional: true,
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date());
    },
  },
};

Recommendations.schema = new SimpleSchema(RecommendationsSchemaDefObject, {
  clean: {
    autoConvert: true,
  },
});

if (Meteor.isServer) {
  Recommendations._ensureIndex({ customerId: 1 }, { unique: true });
}

Recommendations.attachSchema(Recommendations.schema);

