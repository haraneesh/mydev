/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { Accounts } from 'meteor/accounts-base';
import {
  FormGroup, FormControl, ControlLabel, Button,
} from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
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
        firstName: {
          required: true,
        },
        lastName: {
          required: true,
        },
        emailAddress: {
          required: true,
          email: true,
        },
        password: {
          required: false,
          minlength: 6,
        },
        whMobilePhone: {
          required: true,
          indiaMobilePhone: true,
        },
        deliveryAddress: {
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
        firstName: {
          required: 'First name?',
        },
        lastName: {
          required: 'Last name?',
        },
        emailAddress: {
          required: 'Need an email address here.',
          email: 'Is this email address legit?',
        },
        password: {
          required: 'Need a password here.',
          minlength: 'Use at least six characters, please.',
        },
        whMobilePhone: {
          required: 'Need your mobile number.',
          indiaMobilePhone: 'Is this a valid India mobile number?',
        },
        deliveryAddress: {
          required: 'Need your delivery address.',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  handleSubmit() {
    const { history } = this.props;
    const existingSupplier = this.props.supp && this.props.supp._id;
    const password = document.querySelector('[name="password"]').value;
    const methodToCall = existingSupplier ? 'suppliers.update' : 'suppliers.insert';
    const supp = {
      name: this.name.value.trim(),
      description: this.description.value.trim(),
      marginPercentage: parseFloat(this.marginPercentage.value),
      zohoAuthtoken: this.zohoAuthtoken.value.trim(),
      zohoOrganizationId: this.zohoOrganizationId.value.trim(),
      // user details
      userId: this.props.supp.userId,
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

    if (existingSupplier) supp._id = existingSupplier;

    Meteor.call(methodToCall, supp, (error, supplierId) => {
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
    const user = (supp.userId) ? supp.user : null;
    return (
      <form ref={(form) => (this.form = form)} onSubmit={(event) => event.preventDefault()}>
        <FormGroup>
          <ControlLabel>Salutation</ControlLabel>
          <select
            name="salutation"
            ref={(salutation) => (this.salutation = salutation)}
            className="form-control"
            defaultValue={(user && user.profile && user.profile.salutation) ? user.profile.salutation : ''}
          >
            <option value="Mrs.">Mrs</option>
            <option value="Mr.">Mr</option>
            <option value="Miss"> Miss</option>
          </select>
        </FormGroup>
        <FormGroup>
          <ControlLabel>First Name</ControlLabel>
          <FormControl
            type="text"
            name="firstName"
            placeholder="First Name"
            defaultValue={(user) ? user.profile.name.first : ''}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Last Name</ControlLabel>
          <FormControl
            type="text"
            name="lastName"
            placeholder="Last Name"
            defaultValue={(user) ? user.profile.name.last : ''}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Email Address</ControlLabel>
          <FormControl
            type="text"
            name="emailAddress"
            placeholder="Email Address"
            defaultValue={(user) ? user.email : ''}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Mobile Number</ControlLabel>
          <FormControl
            type="text"
            name="whMobilePhone"
            placeholder="10 digit number example, 8787989897"
            defaultValue={(user) ? user.profile.whMobilePhone : ''}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Address</ControlLabel>
          <FormControl
            componentClass="textarea"
            name="deliveryAddress"
            placeholder="Complete address to deliver at, including Landmark, Pincode."
            rows="6"
            defaultValue={(user && user.profile.deliveryAddress) ? user.profile.deliveryAddress : ''}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Password</ControlLabel>
          <FormControl
            type="password"
            name="password"
            placeholder="Password"
          />
        </FormGroup>
        <hr />
        <FormGroup>
          <ControlLabel>Supplier Name</ControlLabel>
          <input
            type="text"
            className="form-control"
            name="name"
            ref={(name) => (this.name = name)}
            defaultValue={supp && supp.name}
            placeholder="Name of the supplier."
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Margin ( % )</ControlLabel>
          <input
            type="text"
            className="form-control"
            name="name"
            ref={(marginPercentage) => (this.marginPercentage = marginPercentage)}
            defaultValue={supp && supp.marginPercentage}
            placeholder="margin percentage"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Zoho Auth Token</ControlLabel>
          <input
            type="text"
            className="form-control"
            name="zohoAuthtoken"
            ref={(zohoAuthtoken) => (this.zohoAuthtoken = zohoAuthtoken)}
            defaultValue={supp && supp.zohoAuthtoken}
            placeholder="Zoho Auth Token"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Zoho Organization Id</ControlLabel>
          <input
            type="text"
            className="form-control"
            name="zohoOrganizationId"
            ref={(zohoOrganizationId) => (this.zohoOrganizationId = zohoOrganizationId)}
            defaultValue={supp && supp.zohoOrganizationId}
            placeholder="Write a  note about the supplier."
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <textarea
            className="form-control"
            name="description"
            ref={(description) => (this.description = description)}
            defaultValue={supp && supp.description}
            placeholder="Write a  note about the supplier."
          />
        </FormGroup>
        <Button type="submit" bsStyle="primary">
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
