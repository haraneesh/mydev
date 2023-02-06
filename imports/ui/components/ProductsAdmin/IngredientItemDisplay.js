import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

export const IngredientItemDisplay = ({ ingredient, removeIngredient }) => (
  <Col xs={12}>
    <Col xs={10}>
      {ingredient.Nutrition.Energ_Kcal && (
      <Row>
        {' '}
        <Col xs={6}>Calories: </Col>
        {' '}
        <Col xs={6}>
          {' '}
          {ingredient.Nutrition.Energ_Kcal}
          {' '}
          kcal
          {' '}
        </Col>
        {' '}
      </Row>
      )}
      {ingredient.Nutrition.Lipid_Tot_g && (
      <Row>
        {' '}
        <Col xs={6}>Total Fat: </Col>
        {' '}
        <Col xs={6}>
          {' '}
          {ingredient.Nutrition.Lipid_Tot_g}
          {' '}
          g
        </Col>
        {' '}
      </Row>
      )}
      {ingredient.Nutrition.Protein_g && (
      <Row>
        {' '}
        <Col xs={6}>Protein: </Col>
        {' '}
        <Col xs={6}>
          {' '}
          {ingredient.Nutrition.Protein_g}
          {' '}
          g
        </Col>
        {' '}
      </Row>
      )}
      {ingredient.Nutrition.Carbohydrt_g && (
      <Row>
        {' '}
        <Col xs={6}>Total Carbs: </Col>
        {' '}
        <Col xs={6}>
          {' '}
          {ingredient.Nutrition.Carbohydrt_g}
          {' '}
          g
        </Col>
        {' '}
      </Row>
      )}
    </Col>
    <Col xs={2}>
      <Button size="sm" onClick={() => removeIngredient()}>
        &#45;
      </Button>
    </Col>
  </Col>
);

IngredientItemDisplay.defaultProps = {
  ingredient: null,
  removeIngredient: null,
};

IngredientItemDisplay.propTypes = {
  ingredient: PropTypes.object,
  removeIngredient: PropTypes.func,
};
