import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import autoBind from 'react-autobind';
import Autosuggest from 'react-autosuggest';
import { toast } from 'react-toastify';

// import './AddIngredient.scss';

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion.name}</span>
  );
}

export default class AddIngredient extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      value: '',
      suggestions: [],
    };

    this.lastRequestId = null;

    autoBind(this);
  }

  onChange(event, { newValue }) {
    this.setState({
      value: newValue,
    });
  }

  onSuggestionsFetchRequested({ value }) {
    this.loadSuggestions(value);
  }

  onSuggestionsClearRequested() {
    this.setState({
      suggestions: [],
    });
  }

  getSuggestionValue(ingredient) {
    this.setState({
      value: ingredient.name,
    });
    this.props.addIngredient(ingredient);
    return '';
  }

  loadSuggestions(value) {
    // Cancel the previous request
    if (this.lastRequestId !== null) {
      clearTimeout(this.lastRequestId);
    }

    this.lastRequestId = setTimeout(() => {
      Meteor.call('ingredients.find', { searchString: value }, (error, result) => {
        if (error) {
          // toast.error(error.reason);
          toast.error(error.reason);
        } else {
          this.setState({
            suggestions: result,
          });
        }
      });
    }, 250);
  }

  addIngredient() {
    Meteor.call('ingredients.add', { ingredientName: this.state.value }, (error, result) => {
      if (error) {
        // toast.error(error.reason);
        toast.error(error.reason);
      } else {
        this.setState({
          value: '',
        });
        this.props.addIngredient(result);
      }
    });
  }

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Start typing an ingredient name example 'lime'",
      value,
      onChange: this.onChange,
      style: { width: '100%', borderWidth: '0px' },
    };

    return (
      <Row>
        <Col>
          <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
            onSuggestionsClearRequested={this.onSuggestionsClearRequested}
            getSuggestionValue={this.getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
          />
        </Col>
        <Col xs={1} className="text-center">
          <Button size="sm" onClick={this.addIngredient}>
            +
          </Button>
        </Col>
      </Row>
    );
  }
}

AddIngredient.propTypes = {
  addIngredient: PropTypes.func.isRequired,
};

/*
const  = ({ ingredient, controlName, valueChange, removeValue }) => (
  <Row>
    <Col xs={9}>
      <FormControl
        type="text"
        defaultValue={ingredient}
        value={ingredient}
        onChange={valueChange}
        name={controlName}
      />
    </Col>
  </Row>
);
} */
