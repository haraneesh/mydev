import React from 'react';
import RecipeEditor from '../../components/recipes/RecipeEditor';

const EditRecipe = ({ recipe }) => (
  <div className="EditRecipe">
    <h3 className="page-header">Editing "{ recipe.title }"</h3>
    <RecipeEditor recipe={ recipe } />
  </div>
);

EditRecipe.propTypes = {
  recipe: React.PropTypes.object,
};

export default EditRecipe;
