/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Ingredients = new Mongo.Collection('Ingredients');

if (Meteor.isServer) {
  Ingredients.rawCollection().createIndex({ name: 1 }, { unique: true });
  Ingredients.rawCollection().createIndex({ name: 'text', description: 'text' }, { unique: true });
}

Ingredients.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Ingredients.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Ingredients.schema = new SimpleSchema({
  name: {
    type: String,
    label: 'Ingredient Name',
  },
  productId: {
    type: String,
    label: 'Product Id',
  },
  createdAt: { type: Date,
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


export default Ingredients;
