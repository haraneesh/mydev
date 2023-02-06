import React from 'react';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
import AddIngredient from '../Ingredients/AddIngredient/AddIngredient';
import { IngredientItemDisplay } from './IngredientItemDisplay';

export default class AttachIngredient extends React.Component {
  constructor(props, context) {
    super(props, context);
    const { ingredient } = this.props;

    this.state = {
      ingredient,
    };

    this.handleSelectIngredient = this.handleSelectIngredient.bind(this);
    this.handleRemoveIngredient = this.handleRemoveIngredient.bind(this);
  }

  handleRemoveIngredient() {
    this.setState(
      {
        ingredient: null,
      },
    );
    this.props.onChange(null);
  }

  handleSelectIngredient(ingredient /* ingredient */) {
    this.setState(
      {
        ingredient,
      },
    );
    this.props.onChange(ingredient);
  }

  render() {
    const { ingredient } = this.state;
    return (
      <Card>
        {!ingredient && (<AddIngredient addIngredient={this.handleSelectIngredient} />)}
        {ingredient && (<IngredientItemDisplay ingredient={ingredient} removeIngredient={this.handleRemoveIngredient} />)}
      </Card>
    );
  }
}

AttachIngredient.defaultProps = {
  ingredient: null,
  onChange: null,
};

AttachIngredient.propTypes = {
  ingredient: PropTypes.object,
  onChange: PropTypes.func,
};
