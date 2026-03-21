import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Icon from '../Icon/Icon';

import './IngredientItem.scss';

export default class IngredientItem extends React.Component {
  constructor(props, context) {
    super(props, context);
    const { ingredient } = this.props;
    this.defaultSelectedWeight = {
      Amount: 0,
      Msre_Desc: 'g',
      Gm_Wgt: 1,
    };

    this.state = {
      displayName: (ingredient.displayName) ? ingredient.displayName : ingredient.Long_Desc,
      weights: ingredient.Weights,
      selectedWeight: (ingredient.selectedWeight) ? ingredient.selectedWeight : this.defaultSelectedWeight,
    };

    this.removeIngredient = this.removeIngredient.bind(this);
  }

  onMsreChange = () => {
    const { ingredient } = this.props;

    const weight = ingredient.Weights.find(function (o) {
      return o.Msre_Desc === this.msreSelected.value.trim();
    }, this);

    this.setState({
      selectedWeight: weight || this.defaultSelectedWeight,
    });
  }

  displayNameChanged = () => {
    const { ingredient } = this.props;
    const { onDisplayNameChange } = this.props;
    const displayName = this.displayName.value;

    this.setState({
      displayName,
    });

    onDisplayNameChange(ingredient._id, displayName.trim());
  }

  onAmtChange = () => {
    const { onWeightChange } = this.props;
    const { ingredient } = this.props;
    const { selectedWeight } = this.state;

    selectedWeight.Amount = this.amountSelected.value.trim();

    this.setState({
      selectedWeight,
    });

    onWeightChange(ingredient._id, selectedWeight);
  }

 adjustNutrientsByWeightsSelected = (nutrientName) => {
   const nutrition = this.props.ingredient.Nutrition;
   const { selectedWeight } = this.state;
   return Math.round(nutrition[nutrientName] * this.state.selectedWeight.Amount * this.state.selectedWeight.Gm_Wgt) / 100;
   // data in the database for nutrition[nutrientName] is for 100 grams
 }

 getDisplayMeasures() {
   const { ingredient } = this.props;
   const { selectedWeight } = this.state;
   return (
     <Row controlId={`"weights-${ingredient._id}"`} className="ingMeasures">
       <Col sm={6}>
         <Row>
           <label>Measure</label>
           <select
             className="form-select input-sm"
             name={`"measure-${ingredient._id}"`}
             value={selectedWeight.Msre_Desc}
             onChange={this.onMsreChange}
             ref={(msre) => (this.msreSelected = msre)}
           >
             {
                  _.map(ingredient.Weights, (weight) => (
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
           <label>Amount</label>
           <input
             className="form-control input-sm"
             type="number"
             name={`"amount-${ingredient._id}"`}
             value={selectedWeight.Amount}
             onChange={this.onAmtChange}
             ref={(amount) => (this.amountSelected = amount)}
           />
         </Row>
       </Col>
     </Row>
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
    return (
      <Row className="ingredient-item card-body">
        <Col xs={12}>
          <Row>
            <h4>
              { ingredient.Long_Desc }
            </h4>
          </Row>
          <Row>
            <label>Display Name</label>
            <input
              className="form-control input-sm"
              name={`"displayName-${ingredient._id}"`}
              value={this.state.displayName}
              onChange={this.displayNameChanged}
              ref={(displayName) => (this.displayName = displayName)}
            />
          </Row>
        </Col>
        <Col xs={12}>
          <Col sm={4}>
            <Row>
              { this.getDisplayMeasures() }
            </Row>
          </Col>
          <Col sm={7} xs={12}>
            {ingredient.Nutrition.Energ_Kcal && (
            <Row>
              {' '}
              <Col xs={6}>Calories: </Col>
              {' '}
              <Col xs={6}>
                {' '}
                {this.adjustNutrientsByWeightsSelected('Energ_Kcal')}
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
                {this.adjustNutrientsByWeightsSelected('Lipid_Tot_g')}
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
                {this.adjustNutrientsByWeightsSelected('Protein_g')}
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
                {this.adjustNutrientsByWeightsSelected('Carbohydrt_g')}
                {' '}
                g
              </Col>
              {' '}
            </Row>
            )}
          </Col>
          <Col sm={1} xs={12}>
            <Button size="sm" onClick={() => this.removeIngredient(ingredient)}>
              <Icon icon="minus" type="mt" />
            </Button>
          </Col>
        </Col>
      </Row>
    );
  }
}

IngredientItem.propTypes = {
  ingredient: PropTypes.string.isRequired,
  removeIngredient: PropTypes.func.isRequired,
  onWeightChange: PropTypes.func.isRequired,
  onDisplayNameChange: PropTypes.func.isRequired,
};
