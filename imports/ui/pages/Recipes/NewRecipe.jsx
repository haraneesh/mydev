import React from 'react';
import RecipeEditor from '../../components/Recipes/RecipeEditor';

const NewRecipe = ({ history }) => (
  <div className="NewRecipe p-2 m-2">
    <h2 className="py-4">New Recipe</h2>
    <RecipeEditor history={history} />
  </div>
);

export default NewRecipe;
