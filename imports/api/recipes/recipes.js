import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/dburles:factory';

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
  title: {
    type: String,
    label: 'The title of the recipe.',
  },
  ingredients: {
    type: [String],
    label: 'The list of ingredients in the recipe.',
    optional: true,
  },
  commentIds: {
    type: [String],
    label: 'The list of comments attached to the recipe.',
    optional: true,
  },
  description: {
    type: Object,
    label: 'The recipe goes here.',
    blackbox: true,
    optional: true,
  },
  imageUrl: {
    type: String,
    label: 'The url of the image of the recipe',
    optional: true,
  },
  thumbnailUrl: {
    type: String,
    label: 'The url of the thumbnail image of the recipe',
    optional: true,
  },
  mediaId: {
    type: String,
    label: 'Saves Id of the image/media',
    optional: true,
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
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert: true,
    optional: true,
  },
  publishStatus: {
    type: String,
    label: 'Publish Status',
  },
});

if (Meteor.isServer) {
  Recipes._ensureIndex({ owner: 1 });
}

Recipes.attachSchema(Recipes.schema);

Factory.define('recipe', Recipes, {
  title: () => 'Factory Title',
  recipe: () => 'Factory Body',
});
