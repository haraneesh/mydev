import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import Recipes from '../../../api/Recipes/Recipes';
import RecipesList from '../../components/Recipes/RecipesList';
import Loading from '../../components/Loading/Loading';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('recipes.list');
  if (subscription.ready()) {
    const recipes = Recipes.find().fetch();
    onData(null, { recipes, history: params.history });
  }
};

export default composeWithTracker(composer, Loading)(RecipesList);
