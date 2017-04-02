import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Recipes from '../../../api/recipes/recipes.js';
import ViewRecipe from '../../pages/recipes/ViewRecipe.js';
import Loading from '../../components/Loading.js';

const composer = ({ params }, onData) => {
  const subscription = Meteor.subscribe('recipes.view', params._id);

  if (subscription.ready()) {
    const recipe = Recipes.findOne();
    onData(null, { recipe });
  }
};

export default composeWithTracker(composer, Loading)(ViewRecipe);
