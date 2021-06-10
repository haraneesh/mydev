/* eslint-disable no-underscore-dangle */

import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, FormGroup, label, Button,
} from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { toast } from 'react-toastify';
import { createContainer } from 'meteor/react-meteor-data';
import { formValChange, formValid } from '../../../../modules/validate';
import constants from '../../../../modules/constants';

import './Profile.scss';

const defaultState = {
  user: {},
  isError: {
    emailAddress: '',
    password: '',
    firstName: '',
    lastName: '',
    whMobilePhone: '',
    deliveryAddress: '',
    newPassword: '',
    confirmPassword: '',
    dietPreference: '',
  },
};

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.state = { ...defaultState };

    this.getUserType = this.getUserType.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.renderOAuthUser = this.renderOAuthUser.bind(this);
    this.renderPasswordUser = this.renderPasswordUser.bind(this);
    this.renderProfileForm = this.renderProfileForm.bind(this);
    this.handleVerifyEmail = this.handleVerifyEmail.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
  }

  onValueChange(e) {
    e.preventDefault();
    const { isError } = this.state;
    const newState = formValChange(e,
      { ...isError },
      {
        newPassword: document.querySelector('[name="newPassword"]').value,
        confirmPassword: document.querySelector('[name="confirmPassword"]').value,
      });
    this.setState(newState);
  }

  getUserType(user) {
    const userToCheck = user;
    delete userToCheck.services.resume;
    const service = Object.keys(userToCheck.services)[0];
    return service === 'password' ? 'password' : 'oauth';
  }

  handleVerifyEmail() {
    const emailAddress = this.emailAddress.value;
    Meteor.call('users.sendVerificationEmail', emailAddress, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('A verification email has been sent. Please check your email.');
      }
    });
  }

  validateForm(e) {
    e.preventDefault();

    const { isError } = this.state;

    if (this.dietPreference.selectedOptions[0].value === '') {
      isError.dietPreference = 'dietary preference is mandatory';
    }

    if (this.confirmPassword.value !== this.newPassword.value) {
      isError.confirmPassword = 'two passwords do not match, please check';
    }

    if (formValid({ isError })) {
      this.handleSubmit();
    } else {
      this.setState({ isError });
    }
  }

  handleSubmit() {
    const profile = {
      emailAddress: this.emailAddress.value,
      profile: {
        name: {
          first: this.firstName.value,
          last: this.lastName.value,
        },
        salutation: this.salutation.selectedOptions[0].value,
        whMobilePhone: this.whMobilePhone.value,
        deliveryAddress: this.deliveryAddress.value,
      },
      settings: {
        dietPreference: this.dietPreference.selectedOptions[0].value,
      },
    };

    if (this.confirmPassword.value) {
      profile.password = Accounts._hashPassword(this.confirmPassword.value);
    }

    Meteor.call('users.editUserProfile', profile, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Profile updated!');
      }
    });
  }

  renderOAuthUser(loading, user) {
    return !loading ? (
      <div className="OAuthProfile">
        {Object.keys(user.services).map((service) => (
          <div key={service} className={`LoggedInWith ${service}`}>
            <div className="ServiceIcon"><i className={`fa fa-${service === 'facebook' ? 'facebook-official' : service}`} /></div>
            <p>{`You're logged in with ${service} using the email address ${user.services[service].email}.`}</p>
          </div>
        ))}
      </div>
    ) : <div />;
  }

  renderPasswordUser(loading, user) {
    const { isError } = this.state;
    return !loading ? (
      <div>
        <FormGroup>
          <label>Salutation</label>
          <select
            name="salutation"
            ref={(salutation) => (this.salutation = salutation)}
            className="form-control"
            defaultValue={(user.profile.salutation) ? user.profile.salutation : ''}
          >
            <option value="Mrs.">Mrs</option>
            <option value="Mr.">Mr</option>
            <option value="Miss"> Miss</option>
          </select>
        </FormGroup>
        <FormGroup validationState={isError.firstName.length > 0 ? 'error' : ''}>
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            onBlur={this.onValueChange}
            defaultValue={user.profile.name.first}
            ref={(firstName) => (this.firstName = firstName)}
            className="form-control"
          />
          {isError.firstName.length > 0 && (
          <span className="control-label">{isError.firstName}</span>
          )}
        </FormGroup>
        <FormGroup validationState={isError.lastName.length > 0 ? 'error' : ''}>
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            defaultValue={user.profile.name.last}
            onBlur={this.onValueChange}
            ref={(lastName) => (this.lastName = lastName)}
            className="form-control"
          />
          {isError.lastName.length > 0 && (
          <span className="control-label">{isError.lastName}</span>
          )}
        </FormGroup>
        <FormGroup validationState={isError.emailAddress.length > 0 ? 'error' : ''}>
          <Row>
            <Col xs={6}>
              <label>Email Address</label>
            </Col>
            <Col xs={6} className="text-right" style={{ top: '-0.5rem' }}>
              {!user.emails[0].verified
                ? (<Button className="btn-warning btn-sm" onClick={this.handleVerifyEmail}>Verify Email</Button>)
                : (<span className="text-default">Verified</span>)}
            </Col>
          </Row>
          <input
            type="email"
            name="emailAddress"
            defaultValue={user.emails[0].address}
            onBlur={this.onValueChange}
            ref={(emailAddress) => (this.emailAddress = emailAddress)}
            className="form-control"
          />
          {isError.emailAddress.length > 0 && (
          <span className="control-label">{isError.emailAddress}</span>
          )}
        </FormGroup>
        <FormGroup validationState={isError.whMobilePhone.length > 0 ? 'error' : ''}>
          <label>Mobile Number</label>
          <input
            type="text"
            ref={(whMobilePhone) => (this.whMobilePhone = whMobilePhone)}
            name="whMobilePhone"
            onBlur={this.onValueChange}
            placeholder="10 digit number example, 8787989897"
            defaultValue={user.profile.whMobilePhone}
            className="form-control"
          />
          {isError.whMobilePhone.length > 0 && (
          <span className="control-label">{isError.whMobilePhone}</span>
          )}
        </FormGroup>
        <FormGroup validationState={isError.dietPreference.length > 0 ? 'error' : ''}>
          <label>Dietary Preference</label>
          <select
            name="dietPreference"
            onChange={this.onValueChange}
            ref={(dietPreference) => (this.dietPreference = dietPreference)}
            className="form-control"
            defaultValue={(user.settings && user.settings.dietPreference) ? user.settings.dietPreference : ''}
          >
            <option value="" key="notselected" />
            {constants.DietaryPreferences.names.map((name) => (
              <option value={name} key={name}>
                {constants.DietaryPreferences[name].display_value}
              </option>
            ))}
          </select>
          {isError.dietPreference.length > 0 && (
          <span className="control-label">{isError.dietPreference}</span>
          )}
        </FormGroup>
        <FormGroup validationState={isError.deliveryAddress.length > 0 ? 'error' : ''}>
          <label>Delivery Address</label>
          <textarea
            ref={(deliveryAddress) => (this.deliveryAddress = deliveryAddress)}
            name="deliveryAddress"
            placeholder="Complete address to deliver at, including Landmark, Pincode."
            rows="6"
            defaultValue={user.profile.deliveryAddress}
            className="form-control"
            onBlur={this.onValueChange}
          />
          {isError.deliveryAddress.length > 0 && (
          <span className="control-label">{isError.deliveryAddress}</span>
          )}
        </FormGroup>
        <FormGroup validationState={isError.newPassword.length > 0 ? 'error' : ''}>
          <label>New Password</label>
          <input
            id="newPassword"
            type="password"
            name="newPassword"
            ref={(newPassword) => (this.newPassword = newPassword)}
            className="form-control"
            onChange={this.onValueChange}
          />
          {isError.newPassword.length > 0 && (
          <span className="control-label">{isError.newPassword}</span>
          )}
        </FormGroup>
        <Row>
          <Col xs={12}>
            <FormGroup validationState={isError.confirmPassword.length > 0 ? 'error' : ''}>
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                ref={(confirmPassword) => (this.confirmPassword = confirmPassword)}
                className="form-control"
                onChange={this.onValueChange}
              />
              {isError.confirmPassword.length > 0 && (
              <span className="control-label">{isError.confirmPassword}</span>
              )}
            </FormGroup>
          </Col>
        </Row>
        <div>
          <Button
            type="submit"
            bsStyle="primary"
          >
            Save Profile
          </Button>
        </div>
      </div>
    ) : <div />;
  }

  renderProfileForm(loading, user) {
    return !loading ? ({
      password: this.renderPasswordUser,
      oauth: this.renderOAuthUser,
    }[this.getUserType(user)])(loading, user) : <div />;
  }

  render() {
    const { loading, user } = this.props;
    return (
      <div className="Profile offset-sm-1">
        <Row>
          <Col xs={12} sm={9} md={6}>
            <h3 className="page-header">Edit Profile</h3>
            <form onSubmit={this.validateForm}>
              {this.renderProfileForm(loading, user)}
            </form>
          </Col>
        </Row>
      </div>
    );
  }
}

Profile.propTypes = {
  loading: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('users.editProfile');

  return {
    loading: !subscription.ready(),
    user: Meteor.user(),
  };
}, Profile);
