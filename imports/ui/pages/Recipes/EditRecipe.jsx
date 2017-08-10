import React from 'react';
import RecipeEditor from '../../components/Recipes/RecipeEditor';
import PropTypes from 'prop-types';

const EditRecipe = ({ recipe, history }) => (
  <div className="EditRecipe">
    <h3 className="page-header">Editing "{ recipe.title }"</h3>
    <RecipeEditor recipe={recipe} history={history} />
  </div>
);

EditRecipe.propTypes = {
  recipe: PropTypes.object,
  history: PropTypes.object,
};

export default EditRecipe;
