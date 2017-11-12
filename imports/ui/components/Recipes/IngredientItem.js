import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, Row, Col, Glyphicon, Button } from 'react-bootstrap';

import './IngredientItem.scss';

export default class IngredientItem extends React.Component {

  constructor(props, context) {
    super(props, context);
    const { ingredient } = this.props;
    this.defaultSelectedWeight = {
        Amount: 0,
        Msre_Desc: 'g',
        Gm_Wgt: 1,
    }
    
    this.state = {
      weights: ingredient.Weights,
      selectedWeight: (ingredient.selectedWeight) ? ingredient.selectedWeight : this.defaultSelectedWeight,
    };

    this.removeIngredient = this.removeIngredient.bind(this);
  }

  onMsreChange = () => {
    const {ingredient} = this.props;
    
    const weight = ingredient.Weights.find(function(o){
       return o.Msre_Desc === this.msreSelected.value.trim()
    }, this);

    this.setState ({
      selectedWeight: weight ? weight : this.defaultSelectedWeight, 
    })
  }

  onAmtChange = () => {
    const {onWeightChange} = this.props;
    const {ingredient} = this.props;
    const {selectedWeight} = this.state;

    selectedWeight.Amount = this.amountSelected.value.trim()

    this.setState ({
      selectedWeight, 
    });

    onWeightChange(ingredient._id, selectedWeight) 
  }

 adjustNutrientsByWeightsSelected = (nutrientName) => {
    const nutrition = this.props.ingredient.Nutrition;
    const {selectedWeight} = this.state;
    return Math.round(nutrition[nutrientName] * this.state.selectedWeight.Amount * this.state.selectedWeight.Gm_Wgt) / 100;
    // data in the database for nutrition[nutrientName] is for 100 grams
 }

  getDisplayMeasures() {
    const { ingredient } = this.props;
    const { selectedWeight } = this.state;
    return (
      <FormGroup controlId={`"weights-${ingredient._id}"`} className="ingMeasures">
        <Col sm={6}>
          <Row>
            <ControlLabel>Measure</ControlLabel>
            <select
              className="form-control input-sm"
              name={`"measure-${ingredient._id}"`}
              value={selectedWeight.Msre_Desc}
              onChange={this.onMsreChange}
              ref={msre => (this.msreSelected = msre)}
            >
              {
                  _.map(ingredient.Weights, weight => (
                    <option value={`${weight.Msre_Desc}`}>
                      { weight.Msre_Desc }
                    </option>
                    ))
              }
            </select>
          </Row>
        </Col>
        <Col sm={6}>
          <Row>
            <ControlLabel>Amount</ControlLabel>
            <input
              className="form-control input-sm"
              type="number"
              name={`"amount-${ingredient._id}"`}
              value={selectedWeight.Amount}
              onChange={this.onAmtChange}
              ref={amount => (this.amountSelected = amount)}
            />
          </Row>
        </Col>
      </FormGroup>
    );
  }

  removeIngredient = (ingredient) => {
    // remove ingredient
    if (confirm('Are you sure, you want to delete the ingredient?')) {
      this.props.removeIngredient(ingredient);
    }
  }

  render() {
    const { ingredient } = this.props;
    return (<Row className="ingredient-item panel-body">
      <Col xs={12}>
        <Row>
            <h4>
              { ingredient.Long_Desc }
            </h4>
        </Row>
      </Col>
      <Col xs={12}>
        <Col sm={4}>
          <Row>
            { this.getDisplayMeasures() }
          </Row>
        </Col>
        <Col sm={7} xs={12}>
          {ingredient.Nutrition.Energ_Kcal && (<Row> <Col xs={6}>Calories: </Col> <Col xs={6}> {this.adjustNutrientsByWeightsSelected('Energ_Kcal')} kcal </Col> </Row>)}
          {ingredient.Nutrition.Lipid_Tot_g && (<Row> <Col xs={6}>Total Fat: </Col> <Col xs={6}> {this.adjustNutrientsByWeightsSelected('Lipid_Tot_g')} g</Col> </Row>)}
          {ingredient.Nutrition.Protein_g && (<Row> <Col xs={6}>Protein: </Col> <Col xs={6}> {this.adjustNutrientsByWeightsSelected('Protein_g')} g</Col> </Row>)}
          {ingredient.Nutrition.Carbohydrt_g && (<Row> <Col xs={6}>Total Carbs: </Col> <Col xs={6}> {this.adjustNutrientsByWeightsSelected('Carbohydrt_g')} g</Col> </Row>)}
        </Col>
        <Col sm={1} xs={12}>
          <Button bsSize="xsmall" onClick={() => this.removeIngredient(ingredient)}>
            <Glyphicon glyph="minus" />
          </Button>
        </Col>
      </Col>
    </Row>);
  }
}

IngredientItem.propTypes = {
  ingredient: PropTypes.string.isRequired,
  removeIngredient: PropTypes.func.isRequired,
  onWeightChange: PropTypes.func.isRequired,
};
