import React from 'react';
import RecipeEditor from '../../components/Recipes/RecipeEditor';

const NewRecipe = ({ history }) => (
  <div className="NewRecipe">
    <h3 className="page-header">New Recipe</h3>
    <RecipeEditor history={history} />
  </div>
);

export default NewRecipe;
