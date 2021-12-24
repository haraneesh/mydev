import React from 'react';
import RecipeEditor from '../../components/Recipes/RecipeEditor';

const NewRecipe = ({ history }) => (
  <div className="NewRecipe">
    <h2 className="page-header">New Recipe</h2>
    <RecipeEditor history={history} />
  </div>
);

export default NewRecipe;
