/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

const Ingredients = new Mongo.Collection('Ingredients');

if (Meteor.isServer) {
  Ingredients._ensureIndex({ Long_Desc: 'text' });
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

export default Ingredients;
