/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import validate from '../../../modules/validate';

class SupplierEditor extends React.Component {
  componentDidMount() {
    const component = this;
    validate(component.form, {
      rules: {
        name: {
          required: true,
        },
        description: {
          required: true,
        },
      },
      messages: {
        name: {
          required: 'Need a title in here, Seuss.',
        },
        description: {
          required: 'This thneeds a body, please.',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  handleSubmit() {
    const { history } = this.props;
    const existingSupplier = this.props.supp && this.props.supp._id;
    const methodToCall = existingSupplier ? 'suppliers.update' : 'suppliers.insert';
    const supp = {
      name: this.name.value.trim(),
      description: this.description.value.trim(),
    };

    if (existingSupplier) supp._id = existingSupplier;

    Meteor.call(methodToCall, supp, (error, supplierId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation = existingSupplier ? 'Supplier updated!' : 'Supplier added!';
        this.form.reset();
        Bert.alert(confirmation, 'success');
        history.push(`/suppliers/${supplierId}`);
      }
    });
  }

  render() {
    const { supp } = this.props;
    return (<form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
      <FormGroup>
        <ControlLabel>Name</ControlLabel>
        <input
          type="text"
          className="form-control"
          name="name"
          ref={name => (this.name = name)}
          defaultValue={supp && supp.name}
          placeholder="Name of the supplier."
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Description</ControlLabel>
        <textarea
          className="form-control"
          name="description"
          ref={description => (this.description = description)}
          defaultValue={supp && supp.description}
          placeholder="Write a  note about the supplier."
        />
      </FormGroup>
      <Button type="submit" bsStyle="primary">
        {supp && supp._id ? 'Save Changes' : 'Add Supplier'}
      </Button>
    </form>);
  }
}

SupplierEditor.defaultProps = {
  supp: { name: '', description: '' },
};

SupplierEditor.propTypes = {
  supp: PropTypes.object,
  history: PropTypes.object.isRequired,
};

export default SupplierEditor;
