/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { Accounts } from 'meteor/accounts-base';
import {
  Row, FormControl, ControlLabel, Button,
} from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import { formValChange, formValid } from '../../../modules/validate';

const defaultState = {
  user: {},
  isError: {
    name: '',
    description: '',
    firstName: '',
    lastName: '',
    password: '',
    emailAddress: '',
    whMobilePhone: '',
    deliveryAddress: '',
  },
};

class SupplierEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...defaultState };
    this.onValueChange = this.onValueChange.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  onValueChange(e) {
    e.preventDefault();
    const { isError } = this.state;
    const newState = formValChange(e, { ...isError });
    this.setState(newState);
  }

  validateForm(e) {
    e.preventDefault();
    const { isError } = this.state;
    if (formValid({ isError })) {
      this.handleSubmit();
    } else {
      this.setState({ isError });
    }
  }

  handleSubmit() {
    const { history, supp } = this.props;
    const existingSupplier = supp && supp._id;
    const password = document.querySelector('[name="password"]').value;
    const methodToCall = existingSupplier ? 'suppliers.update' : 'suppliers.insert';
    const supplier = {
      name: this.name.value.trim(),
      description: this.description.value.trim(),
      marginPercentage: parseFloat(this.marginPercentage.value),
      zohoAuthtoken: this.zohoAuthtoken.value.trim(),
      zohoOrganizationId: this.zohoOrganizationId.value.trim(),
      // user details
      userId: supp.userId,
      user: {
        username: document.querySelector('input[name="whMobilePhone"]').value,
        email: document.querySelector('[name="emailAddress"]').value,
        password: (password) ? Accounts._hashPassword(password) : {},
        profile: {
          name: {
            first: document.querySelector('[name="firstName"]').value,
            last: document.querySelector('[name="lastName"]').value,
          },
          whMobilePhone: document.querySelector('input[name="whMobilePhone"]').value,
          deliveryAddress: document.querySelector('[name="deliveryAddress"]').value,
          salutation: document.querySelector('[name="salutation"]').selectedOptions[0].value,
        },
      },
    };

    if (existingSupplier) supplier._id = existingSupplier;

    Meteor.call(methodToCall, supplier, (error, supplierId) => {
      if (error) {
        toast.error(error.reason);
      } else {
        const confirmation = existingSupplier ? 'Supplier updated!' : 'Supplier added!';
        this.form.reset();
        toast.success(confirmation);
        history.push(`/suppliers/${supplierId}`);
      }
    });
  }

  render() {
    const { supp } = this.props;
    const { isError } = this.state;
    const user = (supp.userId) ? supp.user : null;
    return (
      <form ref={(form) => (this.form = form)} onSubmit={this.validateForm}>
        <Row>
          <label>Salutation</label>
          <select
            name="salutation"
            ref={(salutation) => (this.salutation = salutation)}
            className="form-select"
            defaultValue={(user && user.profile && user.profile.salutation) ? user.profile.salutation : ''}
          >
            <option value="Mrs.">Mrs</option>
            <option value="Mr.">Mr</option>
            <option value="Miss"> Miss</option>
          </select>
        </Row>
        <Row validationState={isError.firstName.length > 0 ? 'error' : ''}>
          <label>First Name</label>
          <FormControl
            type="text"
            name="firstName"
            placeholder="First Name"
            onBlur={this.onValueChange}
            defaultValue={(user) ? user.profile.name.first : ''}
          />
          {isError.firstName.length > 0 && (
          <span className="small text-info">{isError.firstName}</span>
          )}
        </Row>
        <Row validationState={isError.lastName.length > 0 ? 'error' : ''}>
          <label>Last Name</label>
          <FormControl
            type="text"
            name="lastName"
            placeholder="Last Name"
            onBlur={this.onValueChange}
            defaultValue={(user) ? user.profile.name.last : ''}
          />
          {isError.lastName.length > 0 && (
          <span className="small text-info">{isError.lastName}</span>
          )}
        </Row>
        <Row validationState={isError.emailAddress.length > 0 ? 'error' : ''}>
          <label>Email Address</label>
          <FormControl
            type="text"
            name="emailAddress"
            placeholder="Email Address"
            onBlur={this.onValueChange}
            defaultValue={(user) ? user.email : ''}
          />
          {isError.emailAddress.length > 0 && (
          <span className="small text-info">{isError.emailAddress}</span>
          )}
        </Row>
        <Row validationState={isError.whMobilePhone.length > 0 ? 'error' : ''}>
          <label>Mobile Number</label>
          <FormControl
            type="text"
            name="whMobilePhone"
            onBlur={this.onValueChange}
            placeholder="10 digit number example, 8787989897"
            defaultValue={(user) ? user.profile.whMobilePhone : ''}
          />
          {isError.whMobilePhone.length > 0 && (
          <span className="small text-info">{isError.whMobilePhone}</span>
          )}
        </Row>
        <Row validationState={isError.deliveryAddress.length > 0 ? 'error' : ''}>
          <label>Address</label>
          <FormControl
            componentClass="textarea"
            name="deliveryAddress"
            onBlur={this.onValueChange}
            placeholder="Complete address to deliver at, including Landmark, Pincode."
            rows={6}
            defaultValue={(user && user.profile.deliveryAddress) ? user.profile.deliveryAddress : ''}
          />
          {isError.deliveryAddress.length > 0 && (
          <span className="small text-info">{isError.deliveryAddress}</span>
          )}
        </Row>
        <Row validationState={isError.password.length > 0 ? 'error' : ''}>
          <label>Password</label>
          <FormControl
            type="password"
            name="password"
            placeholder="Password"
            onBlur={this.onValueChange}
          />
          {isError.password.length > 0 && (
          <span className="small text-info">{isError.password}</span>
          )}
        </Row>
        <hr />
        <Row validationState={isError.name.length > 0 ? 'error' : ''}>
          <label>Supplier Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            onBlur={this.onValueChange}
            ref={(name) => (this.name = name)}
            defaultValue={supp && supp.name}
            placeholder="Name of the supplier."
          />
          {isError.name.length > 0 && (
          <span className="small text-info">{isError.name}</span>
          )}
        </Row>
        <Row>
          <label>Margin ( % )</label>
          <input
            type="text"
            className="form-control"
            name="marginPercentage"
            ref={(marginPercentage) => (this.marginPercentage = marginPercentage)}
            defaultValue={supp && supp.marginPercentage}
            placeholder="margin percentage"
          />
        </Row>
        <Row>
          <label>Zoho Auth Token</label>
          <input
            type="text"
            className="form-control"
            name="zohoAuthtoken"
            ref={(zohoAuthtoken) => (this.zohoAuthtoken = zohoAuthtoken)}
            defaultValue={supp && supp.zohoAuthtoken}
            placeholder="Zoho Auth Token"
          />
        </Row>
        <Row>
          <label>Zoho Organization Id</label>
          <input
            type="text"
            className="form-control"
            name="zohoOrganizationId"
            ref={(zohoOrganizationId) => (this.zohoOrganizationId = zohoOrganizationId)}
            defaultValue={supp && supp.zohoOrganizationId}
            placeholder="Write a  note about the supplier."
          />
        </Row>
        <Row>
          <label>Description</label>
          <textarea
            className="form-control"
            name="description"
            ref={(description) => (this.description = description)}
            defaultValue={supp && supp.description}
            placeholder="Write a  note about the supplier."
          />
        </Row>
        <Button type="submit" variant="secondary">
          {supp && supp._id ? 'Save Changes' : 'Add Supplier'}
        </Button>
      </form>
    );
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
