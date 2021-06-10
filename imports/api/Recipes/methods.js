import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Recipes from './Recipes';
import rateLimit from '../../modules/rate-limit.js';
import constants from '../../modules/constants';
import handleMethodException from '../../modules/handle-method-exception';

const upsertRecipe = (recipe) => {
  recipe.owner = Meteor.userId();
  if (Roles.userIsInRole(recipe.owner, ['admin']) || !recipe._id) {
    return Recipes.upsert({ _id: recipe._id }, { $set: recipe });
  }

  return Recipes.upsert(
    {
      $and: [{ owner: recipe.owner }, { _id: recipe._id }],
    },
    { $set: recipe },
  );
};

export const upsertRecipeDraft = new ValidatedMethod({
  name: 'recipes.upsertDraft',
  validate: Recipes.schema.omit('publishStatus').validator(),
  run(recipe) {
    // Check if recipe creator is the one who is updating
    recipe.publishStatus = constants.PublishStatus.Draft.name;
    return upsertRecipe(recipe);
  },
});

/* custom() {
      const { convertFromRaw } = require('draft-js');
      if (!convertFromRaw(this.value).hasText()) {
        return 'emptyRecipeDescription';
      }
    }, */

const recipePublishSchema = new SimpleSchema({
  _id: { type: String },
  title: { type: String },
  description: { type: String, label: 'Recipe description' },
  ingredients: { type: Array, minCount: 1 },
  'ingredients.$': { type: Object },
  'ingredients.$._id': {
    type: String,
    label: 'Ingredient Id',
  },
  'ingredients.$.measure': {
    type: String,
    label: 'Ingredient Measure',
  },
  'ingredients.$.displayOrder': {
    type: Number,
    label: 'Ingredient Display Order',
  },
  'ingredients.$.name': {
    type: String,
    label: 'Ingredient Name',
  },
  'ingredients.$.unit': {
    type: String,
    label: 'Ingredient Unit',
  },
  imageUrl: { type: String, label: 'Image URL' },
  imageId: { type: String, label: 'Image Id' },
  commentIds: {
    type: Array,
    label: 'The list of comments attached to the recipe.',
    optional: true,
  },
  'commentIds.$': {
    type: String,
  },
  serves: {
    type: Number,
    label: 'Serves how many people',
  },
  prepTimeInMins: {
    type: Number,
    label: 'Time to prepare this recipe',
  },
  cookingTimeInMins: {
    type: Number,
    label: 'Time to cook this recipe',
  },
  recipeCategory: {
    type: Array,
    label: 'The type of Food',
  },
  'recipeCategory.$': {
    type: String,
    allowedValues: constants.RecipeCat.names,
  },
  cookingLevel: {
    type: String,
    label: 'Cooking Level',
    allowedValues: constants.DifficultyLevels,
  },
});

recipePublishSchema.messageBox.messages({
  en: {
    minCount: 'You must specify at least {{minCount}} ingredient',
    emptyRecipeDescription: "To publish the recipe, recipe's description is mandatory. To save recipe and edit it later, click on save recipe instead.",
  },
});

export const upsertRecipePublish = new ValidatedMethod({
  name: 'recipes.upsertPublish',
  validate: recipePublishSchema.validator(),
  run(recipe) {
    // Check if recipe creator is the one who is updating
    recipe.publishStatus = constants.PublishStatus.Published.name;
    return upsertRecipe(recipe);
  },
});

export const removeRecipe = new ValidatedMethod({
  name: 'recipes.remove',
  validate: new SimpleSchema({
    recipeId: { type: String },
  }).validator(),
  run({ recipeId }) {
    const recipe = Recipes.findOne({ _id: recipeId });
    // Media.remove({ _id: recipe.mediaId });
    Recipes.remove({
      $and: [{ owner: Meteor.userId() }, { _id: recipe._id }],
    });
  },
});

Meteor.methods({
  'recipes.updateImageUrl': function updateImageUrl(params) {
    check(params, {
      recipeId: String, imageUrl: String, thumbNailUrl: String, imageId: String,
    });
    const {
      recipeId, imageUrl, thumbNailUrl, imageId,
    } = params;
    return Recipes.update({ _id: recipeId }, { $set: { imageUrl, imageId, thumbNailUrl } });
  },
  'recipes.byCategoryTag': function getRecipesByCat(params) {
    check(params,
      {
        catName: String, pageNumber: Number, pageCount: Number, isCategory: Boolean,
      });

    const selectQuery = (params.catName === 'All')
      ? { publishStatus: constants.PublishStatus.Published.name }
      : {
        $and: [{ recipeCategory: params.catName },
          { publishStatus: constants.PublishStatus.Published.name }],
      };

    return Recipes.find(selectQuery, {
      sort: { updatedAt: -1 },
      skip: params.pageNumber * params.pageCount,
      limit: params.pageCount,
    }).fetch();
  },
  'recipes.countByCategory': function countByCategory() {
    try {
      if (Meteor.isServer) {
        return Recipes.aggregate([{
          $unwind: '$recipeCategory',
        },
        {
          $group: {
            _id: {
              recipeCategory: '$recipeCategory',
            },
            count: { $sum: 1 },
          },
        },
        ]);
      }
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    upsertRecipeDraft,
    upsertRecipePublish,
    removeRecipe,
    'recipes.countByCategory',
    'recipes.updateImageUrl',
    'recipes.byCategoryTag',
  ],
  limit: 5,
  timeRange: 1000,
});
