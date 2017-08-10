import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Recipes from './Recipes';
import Media from '../Media/Media';
import rateLimit from '../../modules/rate-limit.js';
import constants from '../../modules/constants';

const _upsertRecipe = (recipe) => {
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
  validate: new SimpleSchema({
    _id: { type: String, optional: true },
    title: { type: String },
    description: { type: Object, optional: true, blackbox: true },
    ingredients: { type: Array, optional: true },
    'ingredients.$':{ type: String },
    imageUrl: { type: String, optional: true },
  }).validator(),
  run(recipe) {
    // Check if recipe creator is the one who is updating
    recipe.publishStatus = constants.PublishStatus.Draft.name;
    return _upsertRecipe(recipe);
  },
});

const recipePublishSchema = new SimpleSchema({
  _id: { type: String },
  title: { type: String },
  description: {
    type: Object,
    blackbox: true,
    custom() {
      const { convertFromRaw } = require('draft-js');
      if (!convertFromRaw(this.value).hasText()) {
        return 'emptyRecipeDescription';
      }
    },
  },
  ingredients: { type: Array, minCount: 1 },
  'ingredients.$': { type: String },
  imageUrl: { type: String, optional: true },
});

recipePublishSchema.messageBox.messages({
  en: {
    'minCount ingredients': 'You must specify at least [minCount] ingredient',
    emptyRecipeDescription: "To publish the recipe, recipe's description is mandatory. To save recipe and edit it later, click on save recipe instead.",
  },
});

export const upsertRecipePublish = new ValidatedMethod({
  name: 'recipes.upsertPublish',
  validate: recipePublishSchema.validator(),
  run(recipe) {
    // Check if recipe creator is the one who is updating
    recipe.publishStatus = constants.PublishStatus.Published.name;
    return _upsertRecipe(recipe);
  },
});

export const removeRecipe = new ValidatedMethod({
  name: 'recipes.remove',
  validate: new SimpleSchema({
    recipeId: { type: String },
  }).validator(),
  run({ recipeId }) {
    const recipe = Recipes.findOne({ _id: recipeId });
    Media.remove({ _id: recipe.mediaId });
    Recipes.remove({
      $and: [{ owner: Meteor.userId() }, { _id: recipe._id }],
    });
  },
});

export const updateRecipePhoto = (mediaId, recipeId) => {
  const recipe = Recipes.findOne({ _id: recipeId });
  const media = Media.findOne({ _id: mediaId });
  const fsObj = new FS.File(media);
  recipe.thumbnailUrl = fsObj.url({ store: constants.MediaStores.Thumbnails.name });
  recipe.imageUrl = fsObj.url({ store: constants.MediaStores.Originals.name });
  recipe.mediaId = mediaId;
  Recipes.upsert({ _id: recipe._id }, { $set: recipe });
};

export const updateRecipePhoto1 = new ValidatedMethod({
  name: 'recipes.updateRecipePhoto',
  validate: new SimpleSchema({
    recipeId: { type: String },
    mediaId: { type: String },
  }).validator(),
  run({ mediaId, recipeId }) {
    const recipe = Recipes.findOne({ _id: recipeId });

    if (Meteor.isServer) {
      const media = Media.findOne({ _id: mediaId });
      const fsObj = new FS.File(media);
      //  media.on('stored', Meteor.bindEnvironment((fileObj, storename) => {
      //  if (storename === constants.MediaStores.Originals.name) {
      recipe.thumbnailUrl = fsObj.url({ store: constants.MediaStores.Thumbnails.name });
      recipe.imageUrl = fsObj.url({ store: constants.MediaStores.Originals.name }); // brokenIsFine: true
      recipe.mediaId = mediaId;
      _upsertRecipe(recipe);
      // }
      // }));
    }
  },
});

export const removeRecipePhoto = new ValidatedMethod({
  name: 'recipes.removeRecipePhoto',
  validate: new SimpleSchema({
    recipeId: { type: String },
  }).validator(),
  run({ recipeId }) {
    const recipe = Recipes.findOne({ _id: recipeId });
    if (Meteor.isServer) {
      Media.findOne({ _id: recipe.mediaId }).remove();
    }
    recipe.thumbnailUrl = null;
    recipe.imageUrl = null;
    recipe.mediaId = null;
    _upsertRecipe(recipe);
    // this._awsRemoveFile(recipe);
  },
});

rateLimit({
  methods: [
    upsertRecipeDraft,
    upsertRecipePublish,
    removeRecipe,
    removeRecipePhoto,
  ],
  limit: 5,
  timeRange: 1000,
});
