import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import constants from '../../../../modules/constants';

const IngredientItem = ({ ingredient, removeIngredient, onChange }) => {
  // const [localIngredient, setIngredientMeasure] = useState({ ...ingredient }, { unit: '', measure: '' });
  const inputIngUnit = useRef();
  const inputIngMeasure = useRef();
  const inputDisplayOrder = useRef();

  const checkRemoveIngredient = () => {
    // remove ingredient
    if (confirm('Are you sure, you want to delete the ingredient?')) {
      removeIngredient(ingredient);
    }
  };

  const updateIngredientDetails = () => {
    // const ingredientTemp = { ...localIngredient };
    const ingredientTemp = {
      _id: ingredient._id,
      name: ingredient.name,
      unit: ingredient.unit,
      measure: ingredient.measure,
      displayOrder: ingredient.displayOrder,
    };

    const displayOrderEntered = parseFloat(inputDisplayOrder.current.value);

    ingredientTemp.unit = inputIngUnit.current.value;
    // ingredientTemp.measure = parseFloat(inputIngMeasure.current.value);
    ingredientTemp.measure = inputIngMeasure.current.value;
    ingredientTemp.displayOrder = (displayOrderEntered) || 0;

    if (ingredientTemp.unit !== '' && ingredientTemp.measure !== '') {
      onChange(ingredient._id, ingredientTemp);
    }
    // setIngredientMeasure(ingredientTemp);
  };

  return (
    <div>
      <Row className="ingredient-item card-body">
        <Col xs={10}>
          <h4>
            {`${ingredient.name}`}
          </h4>
        </Col>
        <Col
          xs={2}
          className="text-center"
          style={{
            position: 'relative',
            paddingLeft: '5px',
            paddingTop: '1rem',
          }}
        >
          <Button size="sm" onClick={checkRemoveIngredient}>
            <i>-</i>
          </Button>
        </Col>
      </Row>
      <Row>
        <Col xs={5} className="pr-2">
          <label>Quantity</label>
          <input
            className="form-control"
            ref={inputIngMeasure}
          // onClick={amountOfIng}
            onChange={updateIngredientDetails}
            defaultValue={ingredient.measure}
            placeholder="Proportions"
            required
          />
        </Col>
        <Col xs={5} className="pr-2">
          <label>Measure</label>
          <select
            className="form-select"
            name="unit"
            ref={inputIngUnit}
            defaultValue={ingredient.unit}
            onChange={updateIngredientDetails}
          >
            {
            constants.UnitOfRecipes.names.map((name) => (
              <option value={name} key={name}>
                { name }
              </option>
            ))
          }
          </select>
        </Col>
        <Col xs={2}>
          <label>Disp Order</label>
          <input
            type="number"
            className="form-control"
            ref={inputDisplayOrder}
            onChange={updateIngredientDetails}
            defaultValue={ingredient.displayOrder}
            placeholder="Display Order"
          />
        </Col>
      </Row>
    </div>
  );
};

IngredientItem.propTypes = {
  ingredient: PropTypes.string.isRequired,
  removeIngredient: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default IngredientItem;
