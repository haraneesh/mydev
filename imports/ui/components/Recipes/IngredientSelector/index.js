import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import AddIngredient from '../../Ingredients/AddIngredient/AddIngredient';
import IngredientItem from '../IngredientItem/index';

const IngredientSelector = ({
  ingredients, controlName, updateIngredientList, onChange,
}) => {
  const [ingredientList, setIngredientList] = useState({ ingListHash: {}, ingListSortedArray: [] });

  const sortAndSetIngredientsByDisplayOrder = (ingListHash) => {
    const ingListArray = Object.keys(ingListHash).map((value) => (ingListHash[value]));

    const ingListSortedArray = ingListArray.sort((a, b) => parseFloat(a.displayOrder) - parseFloat(b.displayOrder));
    setIngredientList({
      ingListHash,
      ingListSortedArray,
    });
  };

  useEffect(() => {
    const ingListHash = {};
    ingredients.forEach((ingredient) => {
      ingListHash[ingredient._id] = ingredient;
    });

    sortAndSetIngredientsByDisplayOrder(ingListHash);
  }, []);

  const removeIngredient = (ingredient /* ingredient */) => {
    const ingListHash = { ...ingredientList.ingListHash };
    delete ingListHash[ingredient._id];
    sortAndSetIngredientsByDisplayOrder(ingListHash);
    updateIngredientList(ingListHash);
  };

  const addIngredient = (ingredient /* ingredient */) => {
    const ingListHash = { ...ingredientList.ingListHash };
    ingListHash[ingredient._id] = ingredient;
    sortAndSetIngredientsByDisplayOrder(ingListHash);
    updateIngredientList(ingListHash);
  };

  return (
    <Panel name={controlName}>
      <AddIngredient
        addIngredient={addIngredient}
      />
      {
        ingredientList.ingListSortedArray.map((value, index) => (
          <IngredientItem
            ingredient={value}
            key={index}
            removeIngredient={removeIngredient}
            onChange={onChange}
          />
        ))
      }
    </Panel>
  );
};

IngredientSelector.defaultProps = {
  ingredients: [],
};

IngredientSelector.propTypes = {
  ingredients: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  updateIngredientList: PropTypes.func.isRequired,
  controlName: PropTypes.string.isRequired,
};

export default IngredientSelector;
