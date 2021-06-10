/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import constants from '../../modules/constants';

const Recipes = new Mongo.Collection('Recipes');
export default Recipes;

Recipes.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Recipes.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Recipes.schema = new SimpleSchema({
  _id: { type: String, label: 'The default _id of the recipe', optional: true },
  title: {
    type: String,
    label: 'The title of the recipe.',
  },
  ingredients: {
    type: Array,
    label: 'The list of ingredients attached to the recipe.',
    optional: true,
  },
  'ingredients.$': {
    type: Object,
    label: 'An ingredient',
    optional: true,
  },
  'ingredients.$._id': {
    type: String,
    label: 'Ingredient Id',
  },
  'ingredients.$.measure': {
    type: String,
    label: 'Ingredient Measure',
  },
  'ingredients.$.name': {
    type: String,
    label: 'Ingredient Name',
  },
  'ingredients.$.unit': {
    type: String,
    label: 'Ingredient Unit',
  },
  'ingredients.$.displayOrder': {
    type: Number,
    label: 'Ingredient Display Order',
  },
  commentIds: {
    type: Array,
    label: 'The list of comments attached to the recipe.',
    optional: true,
  },
  'commentIds.$': {
    type: String,
  },
  description: {
    type: String,
    label: 'The recipe goes here.',
    blackbox: true,
    optional: true,
  },
  serves: {
    type: Number,
    label: 'Serves how many people',
    optional: true,
  },
  prepTimeInMins: {
    type: Number,
    label: 'Time to prepare this recipe',
    optional: true,
  },
  cookingTimeInMins: {
    type: Number,
    label: 'Time to cook this recipe',
    optional: true,
  },
  cookingLevel: {
    type: String,
    label: 'Cooking Level',
    allowedValues: constants.DifficultyLevels,
    optional: true,
  },
  imageUrl: {
    type: String,
    label: 'The url of the image of the recipe',
    optional: true,
  },
  imageId: { type: String, label: 'The id of the image', optional: true },
  thumbNailUrl: {
    type: String,
    label: 'The url of the thumbnail image of the recipe',
    optional: true,
  },
  recipeCategory: {
    type: Array,
    label: 'The type of Food',
    optional: true,
  },
  'recipeCategory.$': {
    type: String,
    allowedValues: constants.RecipeCat.names,
  },
  owner: {
    type: String,
    label: 'The person who created the post',
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
  viewCount: {
    type: Number,
    autoValue() {
      if (this.isInsert) {
        return 0;
      }
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
  publishStatus: {
    type: String,
    label: 'Publish Status',
  },
});

if (Meteor.isServer) {
  Recipes.rawCollection().createIndex({ owner: 1 });
  Recipes.rawCollection().createIndex({ recipeCategory: 1, publishStatus: 1 });
}

Recipes.attachSchema(Recipes.schema);
