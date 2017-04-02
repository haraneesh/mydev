import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Recipes from './recipes';
import rateLimit from '../../modules/rate-limit.js';

export const upsertRecipe = new ValidatedMethod({
  name: 'recipes.upsert',
  validate: new SimpleSchema({
    _id: { type: String, optional: true },
    title: { type: String, optional: true },
    description: { type: Object, optional: true, blackbox: true },
    ingredients:{ type:[String], optional: true },
    owner:{ type:String, optional: true},
    imageUrl:{ type:String, optional: true}
  }).validator(),
  run(recipe) {
    //Check if recipe creator is the one who is updating
    if ( Roles.userIsInRole(this.userId, ['admin']) || (recipe._id === "")) {
      return Recipes.upsert({ _id: recipe._id }, { $set: recipe });
    }
    else{
      return Recipes.upsert(
        {  $and: [
              { owner: this.userId },
              {  _id: recipe._id },
            ]
        }, 
        { $set: recipe });
    }
  },
});

export const removeRecipe = new ValidatedMethod({
  name: 'recipes.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    Recipes.remove(_id);
  },
});

rateLimit({
  methods: [
    upsertRecipe,
    removeRecipe,
  ],
  limit: 5,
  timeRange: 1000,
});
