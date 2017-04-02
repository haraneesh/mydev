import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Recipes from '../../../api/recipes/recipes.js';
import EditRecipe from '../../pages/recipes/EditRecipe.js';
import Loading from '../../components/Loading.js';

const composer = ({ params }, onData) => {
  const subscription = Meteor.subscribe('recipes.view', params._id);

  if (subscription.ready()) {
    const recipe = Recipes.findOne();
    onData(null, { recipe });
  }
};

export default composeWithTracker(composer, Loading)(EditRecipe);
