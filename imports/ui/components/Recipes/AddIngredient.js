import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';
import { Bert } from 'meteor/themeteorchef:bert';

import './AddIngredient.scss';

function renderSuggestion(suggestion) {
  return (
    <span>{suggestion.Long_Desc}</span>
  );
}

export default class AddIngredient extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      value: '',
      suggestions: [],
      isLoading: false,
    };

    this.lastRequestId = null;

    this.onChange = this.onChange.bind(this);
    this.getSuggestionValue = this.getSuggestionValue.bind(this);
    this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
    this.loadSuggestions = this.loadSuggestions.bind(this);
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
      value: ingredient.Long_Desc,
    });
    this.props.addIngredient(ingredient);
    return '';
  }

  loadSuggestions(value) {
    // Cancel the previous request
    if (this.lastRequestId !== null) {
      clearTimeout(this.lastRequestId);
    }

    this.setState({
      isLoading: true,
    });

    this.lastRequestId = setTimeout(() => {
      Meteor.call('ingredients.find', { searchString: value }, (error, result) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          this.setState({
            isLoading: false,
            suggestions: result,
          });
        }
      });
    }, 250);
  }

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: "Start typing an ingredient name example 'lime'",
      value,
      onChange: this.onChange,
    };

    return (<Row>
      <Col xs={12}>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
      </Col>
    </Row>);
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
