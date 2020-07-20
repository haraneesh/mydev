import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import AddIngredient from '../../Ingredients/AddIngredient/AddIngredient';
import IngredientItem from '../IngredientItem/index';

const IngredientSelector = ({ ingredients, controlName, onChange }) => {
  const [ingredientList, setIngredientList] = useState({});

  useEffect(() => {
    const ingredientListTemp = {};
    ingredients.forEach((ingredient) => {
      ingredientListTemp[ingredient._id] = ingredient;
    });

    setIngredientList(ingredientListTemp);
  }, []);

  const removeIngredient = (ingredient /* ingredient */) => {
    const ingredientListTemp = { ...ingredientList };
    delete ingredientListTemp[ingredient._id];
    setIngredientList(ingredientListTemp);
  };

  const addIngredient = (ingredient /* ingredient */) => {
    const ingredientListTemp = { ...ingredientList };
    ingredientListTemp[ingredient._id] = ingredient;
    setIngredientList(ingredientListTemp);
  };

  const displayNameChange = (ingredientId, displayName) => {
    const ingredientListTemp = { ...ingredientList };
    ingredientList[ingredientId].displayName = displayName;
    setIngredientList(ingredientListTemp);
  };

  return (
    <Panel name={controlName}>
      <AddIngredient
        addIngredient={addIngredient}
      />
      {
        Object.keys(ingredientList).map((value, index) =>
          (<IngredientItem
            ingredient={ingredientList[value]}
            key={index}
            removeIngredient={removeIngredient}
            onChange={onChange}
          />))
      }
    </Panel>
  );
};

IngredientSelector.defaultProps = {
  ingredients: [],
  onChange: null,
};

IngredientSelector.propTypes = {
  ingredients: PropTypes.array,
  onChange: PropTypes.func,
  controlName: PropTypes.string.isRequired,
};

export default IngredientSelector;
