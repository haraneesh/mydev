import React from 'react';
import RecipeEditor from '../../components/recipes/RecipeEditor';
import PropTypes from 'prop-types'

const EditRecipe = ({ recipe }) => (
  <div className="EditRecipe">
    <h3 className="page-header">Editing "{ recipe.title }"</h3>
    <RecipeEditor recipe={ recipe } />
  </div>
);

EditRecipe.propTypes = {
  recipe: PropTypes.object,
};

export default EditRecipe;
