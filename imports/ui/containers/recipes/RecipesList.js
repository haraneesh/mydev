import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import Recipes from '../../../api/recipes/recipes.js';
import RecipesList from '../../components/recipes/RecipesList.js';
import Loading from '../../components/Loading.js';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('recipes.list');
  if (subscription.ready()) {
    const recipes = Recipes.find().fetch();
    onData(null, { recipes });
  }
};

export default composeWithTracker(composer, Loading)(RecipesList);
