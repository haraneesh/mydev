import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import Recipes from '../../../api/Recipes/Recipes';
import RecipeEditor from '../../components/Recipes/RecipeEditor';
import Loading from '../../components/Loading/Loading';

const EditRecipe = ({ loading, recipe, history }) => (!loading ? (
  <div className="EditRecipe px-2 py-4">
    <h2>{`Editing ${recipe.title}`}</h2>
    <RecipeEditor recipe={recipe} history={history} />
  </div>
) : <Loading />);

EditRecipe.propTypes = {
  recipe: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default withTracker((args) => {
  // const subscription = Meteor.subscribe('orders.orderDetails', args.match.params._id);
  const subscription = Meteor.subscribe('recipes.view', args.match.params._id);

  const recipe = Recipes.findOne({ _id: args.match.params._id });

  return {
    loading: !subscription.ready(),
    recipe,
    history: args.history,
    loggedInUserId: args.loggedInUserId,
    loggedInUser: args.loggedInUser,
  };
})(EditRecipe);

/*
import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Recipes from '../../../api/Recipes/Recipes';
import EditRecipe from '../../pages/Recipes/EditRecipe';
import Loading from '../../components/Loading/Loading';

const composer = (args, onData) => {
  const subscription = Meteor.subscribe('recipes.view', args.match.params._id);

  if (subscription.ready()) {
    const recipe = Recipes.findOne();
    onData(null, { recipe, history: args.history });
  }
};

export default composeWithTracker(composer, Loading)(EditRecipe);
*/
