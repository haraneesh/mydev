/* eslint-disable no-underscore-dangle */

import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { toast } from 'react-toastify';
import { withTracker } from 'meteor/react-meteor-data';
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
    deliveryPincode: '',
    newPassword: '',
    confirmPassword: '',
    dietPreference: '',
    packingPreference: '',
    productUpdatePreferences: '',
    productUpdatePreference: '',
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
      toast.error('Please address errors in form');
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
        deliveryPincode: this.deliveryPincode.value,
      },
      settings: {
        dietPreference: this.dietPreference.selectedOptions[0].value,
        packingPreference: this.packingPreference.selectedOptions[0].value,
        productUpdatePreference: this.productUpdatePreference.selectedOptions[0].value,
        clearCartAfterOrder: this.clearCartAfterOrder.value === 'true',
      },
      /* status: {
        accountStatus: this.accountStatus.selectedOptions[0].value,
      }, */
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
        <Row className="my-3">
          <label>Salutation</label>
          <select
            name="salutation"
            ref={(salutation) => (this.salutation = salutation)}
            className="form-select"
            defaultValue={(user.profile.salutation) ? user.profile.salutation : ''}
          >
            <option value="Mrs.">Mrs</option>
            <option value="Mr.">Mr</option>
            <option value="Miss"> Miss</option>
          </select>
        </Row>
        <Row className="my-3">
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
          <span className="small text-danger">{isError.firstName}</span>
          )}
        </Row>
        <Row className="my-3">
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
          <span className="small text-danger">{isError.lastName}</span>
          )}
        </Row>
        <Row className="my-3">
          <Row>
            <Col xs={6}>
              <label>Email Address</label>
            </Col>
            <Col xs={6} className="text-right" style={{ top: '-0.5rem' }}>
              {!user.emails[0].verified
                ? (<Button variant="secondary" className="btn-sm" onClick={this.handleVerifyEmail}>Verify Email</Button>)
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
          <span className="small text-danger">{isError.emailAddress}</span>
          )}
        </Row>
        <Row className="my-3">
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
          <span className="small text-danger">{isError.whMobilePhone}</span>
          )}
        </Row>
        <Row className="my-3">
          <label>Packing Preference</label>
          <select
            name="packingPreference"
            onChange={this.onValueChange}
            ref={(packingPreference) => (this.packingPreference = packingPreference)}
            className="form-select"
            defaultValue={(user.settings && user.settings.packingPreference) ? user.settings.packingPreference : ''}
          >
            {constants.PackingPreferences.names.map((name) => (
              <option value={name} key={name}>
                {constants.PackingPreferences[name].displayName}
              </option>
            ))}
          </select>
          {isError.packingPreference.length > 0 && (
          <span className="small text-danger">{isError.packingPreference}</span>
          )}
        </Row>
        <Row className="my-3">
          <label>Product Update Preference</label>
          <select
            name="packingPreference"
            onChange={this.onValueChange}
            ref={(productUpdatePreference) => (this.productUpdatePreference = productUpdatePreference)}
            className="form-select"
            defaultValue={(user.settings && user.settings.productUpdatePreference) ? user.settings.productUpdatePreference : ''}
          >
            {constants.ProductUpdatePreferences.names.map((name) => (
              <option value={name} key={name}>
                {constants.ProductUpdatePreferences[name].displayName}
              </option>
            ))}
          </select>
          {isError.packingPreference.length > 0 && (
          <span className="small text-danger">{isError.productUpdatePreference}</span>
          )}
        </Row>
        <Row className="my-3">
          <label>Clear cart after placing an order</label>
          <select
            name="clearCartAfterOrder"
            className="form-select"
            ref={(clearCartAfterOrder) => (this.clearCartAfterOrder = clearCartAfterOrder)}
            defaultValue={(user.settings && user.settings.clearCartAfterOrder !== undefined) ? user.settings.clearCartAfterOrder : true}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </Row>
        <Row className="my-3">
          <label>Dietary Preference</label>
          <select
            name="dietPreference"
            onChange={this.onValueChange}
            ref={(dietPreference) => (this.dietPreference = dietPreference)}
            className="form-select"
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
          <span className="small text-danger">{isError.dietPreference}</span>
          )}
        </Row>
        <Row className="my-3">
          <label>Delivery Address</label>
          <textarea
            ref={(deliveryAddress) => (this.deliveryAddress = deliveryAddress)}
            name="deliveryAddress"
            placeholder="Complete address to deliver at, including Landmark."
            rows={6}
            defaultValue={user.profile.deliveryAddress}
            className="form-control"
            onBlur={this.onValueChange}
          />
          {isError.deliveryAddress.length > 0 && (
          <span className="small text-danger">{isError.deliveryAddress}</span>
          )}
        </Row>

        <Row className="my-3">
          <label>Delivery Address Pincode</label>
          <input
            type="text"
            maxLength={6}
            ref={(deliveryPincode) => (this.deliveryPincode = deliveryPincode)}
            name="deliveryPincode"
            placeholder="Pincode of the delivery address."
            defaultValue={user.profile.deliveryPincode}
            className="form-control"
            onBlur={this.onValueChange}
          />
          {isError.deliveryPincode.length > 0 && (
          <span className="small text-danger">{isError.deliveryPincode}</span>
          )}
        </Row>

        <Row className="my-3">
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
          <span className="small text-danger">{isError.newPassword}</span>
          )}
        </Row>
        <Row className="my-3">
          <Col xs={12}>
            <Row>
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                ref={(confirmPassword) => (this.confirmPassword = confirmPassword)}
                className="form-control"
                onChange={this.onValueChange}
              />
              {isError.confirmPassword.length > 0 && (
              <span className="small text-danger">{isError.confirmPassword}</span>
              )}
            </Row>
          </Col>
        </Row>
        <div>
          <Button
            type="submit" className="btn btn-primary"
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
        <Row className="my-3 pb-5">
          <Col xs={12} sm={9} md={6}>
            <h2 className="py-4 text-center">Edit Profile</h2>
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

export default withTracker(() => {
  const subscription = Meteor.subscribe('users.editProfile');

  return {
    loading: !subscription.ready(),
    user: Meteor.user(),
  };
})(Profile);
