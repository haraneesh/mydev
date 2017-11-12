import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import AddIngredient from './AddIngredient';
import IngredientItem from './IngredientItem';

export default class IngredientSelector extends React.Component {
  constructor(props, context) {
    super(props, context);
    const ingredientList = {};

    const { ingredients } = this.props;
    if (ingredients) {
      this.props.ingredients.forEach((ingredient) => {
        ingredientList[ingredient._id] = ingredient;
      });
    }

    this.state = {
      ingredients: {
        ingredientList,
      },
    };

    this.handleAddIngredient = this.handleAddIngredient.bind(this);
    this.handleMinusIngredient = this.handleMinusIngredient.bind(this);
    this.handleWeightChange = this.handleWeightChange.bind(this);
  }

  componentDidMount() {
    const ingredientList = this.state.ingredients.ingredientList;
    if (this.props.onChange) {
      this.props.onChange(Object.assign({}, ingredientList));
    }
  }

  updateRecipeIngredientList(ingredientList) {
    this.setState(
      {
        ingredients: {
          ingredientList: Object.assign({}, ingredientList),
        },
      },
        );
    this.props.onChange(Object.assign({}, ingredientList));
  }

  handleMinusIngredient(ingredient /* ingredient */) {
    const ingredientList = this.state.ingredients.ingredientList;
    delete ingredientList[ingredient._id];
    this.updateRecipeIngredientList(ingredientList);
  }

  handleAddIngredient(ingredient /* ingredient */) {
    const ingredientList = this.state.ingredients.ingredientList;
    ingredientList[ingredient._id] = ingredient;
    this.updateRecipeIngredientList(ingredientList);
  }

  handleWeightChange(ingredientId, selectedWeight) {
    const ingredientList = this.state.ingredients.ingredientList;
    ingredientList[ingredientId].selectedWeight = selectedWeight;
    this.updateRecipeIngredientList(ingredientList);
  }

  render() {
    const controlName = this.props.controlName;
    const { ingredients } = this.state;
    return (
      <Panel name={controlName}>
        <AddIngredient
          addIngredient={this.handleAddIngredient}
        />
        {
              _.map(ingredients.ingredientList, (value, index) =>
                (<IngredientItem
                  ingredient={value}
                  key={index}
                  removeIngredient={this.handleMinusIngredient}
                  onWeightChange={this.handleWeightChange}
                />), this)
        }
      </Panel>
    );
  }
}

IngredientSelector.defaultProps = {
  ingredients: [],
  onChange: null,
};

IngredientSelector.propTypes = {
  ingredients: PropTypes.array,
  onChange: PropTypes.func,
  controlName: PropTypes.string.isRequired,
};
