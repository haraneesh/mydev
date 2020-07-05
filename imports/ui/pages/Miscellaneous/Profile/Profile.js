/* eslint-disable no-underscore-dangle */

import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';
import { createContainer } from 'meteor/react-meteor-data';
import InputHint from '../../../components/InputHint/InputHint';
import validate from '../../../../modules/validate';

import './Profile.scss';

class Profile extends React.Component {
  constructor(props) {
    super(props);

    this.getUserType = this.getUserType.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.renderOAuthUser = this.renderOAuthUser.bind(this);
    this.renderPasswordUser = this.renderPasswordUser.bind(this);
    this.renderProfileForm = this.renderProfileForm.bind(this);
    this.handleVerifyEmail = this.handleVerifyEmail.bind(this);
  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
      rules: {
        salutation: {
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
        whMobilePhone: {
          required: true,
          indiaMobilePhone: true,
        },
        deliveryAddress: {
          required: true,
        },
        newPassword: {
          required() {
            // Only required if newPassword field has a value.
            return component.confirmPassword.value.length > 0;
          },
          minlength: 6,
        },
        confirmPassword: {
          required() {
            return (component.newPassword.value.length > 0);
          },
          minlength: 6,
          equalTo: '#newPassword',
        },
      },
      messages: {
        salutation: {
          required: 'How would you like us to address you (Miss, Mrs or Mr)?',
        },
        firstName: {
          required: 'What\'s your first name?',
        },
        lastName: {
          required: 'What\'s your last name?',
        },
        emailAddress: {
          required: 'Need an email address here.',
          email: 'Is this email address correct?',
        },
        newPassword: {
          required: 'Need your new password if changing.',
        },
        confirmPassword: {
          required: 'The new password and confirm password are not matching, please try again.',
          equalTo: 'The new password and confirm password are not matching, please try again.',
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
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('A verification email has been sent. Please check your email.', 'success');
      }
    });
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
    };

    if (this.confirmPassword.value) profile.password = Accounts._hashPassword(this.confirmPassword.value);

    Meteor.call('users.editUserProfile', profile, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Profile updated!', 'success');
      }
    });
  }

  renderOAuthUser(loading, user) {
    return !loading ? (<div className="OAuthProfile">
      {Object.keys(user.services).map(service => (
        <div key={service} className={`LoggedInWith ${service}`}>
          <div className="ServiceIcon"><i className={`fa fa-${service === 'facebook' ? 'facebook-official' : service}`} /></div>
          <p>{`You're logged in with ${service} using the email address ${user.services[service].email}.`}</p>
        </div>
      ))}
    </div>) : <div />;
  }

  renderPasswordUser(loading, user) {
    return !loading ? (<div>
      <FormGroup>
        <ControlLabel>Salutation</ControlLabel>
        <select
          name="salutation"
          ref={salutation => (this.salutation = salutation)}
          className="form-control"
          defaultValue={(user.profile.salutation) ? user.profile.salutation : ''}
        >
          <option value="Mrs.">Mrs</option>
          <option value="Mr.">Mr</option>
          <option value="Miss"> Miss</option>
        </select>
      </FormGroup>
      <FormGroup>
        <ControlLabel>First Name</ControlLabel>
        <input
          type="text"
          name="firstName"
          defaultValue={user.profile.name.first}
          ref={firstName => (this.firstName = firstName)}
          className="form-control"
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Last Name</ControlLabel>
        <input
          type="text"
          name="lastName"
          defaultValue={user.profile.name.last}
          ref={lastName => (this.lastName = lastName)}
          className="form-control"
        />
      </FormGroup>

      <FormGroup>
        <Row>
          <Col xs={6}>
            <ControlLabel>Email Address</ControlLabel>
          </Col>
          <Col xs={6} className="text-right" style={{ top: '-0.5rem' }}>
            {!user.emails[0].verified ?
              (<Button className="btn-warning btn-sm" onClick={this.handleVerifyEmail}>Verify Email</Button>) :
              (<span className="text-default">Verified</span>)
            }
          </Col>
        </Row>
        <input
          type="email"
          name="emailAddress"
          defaultValue={user.emails[0].address}
          ref={emailAddress => (this.emailAddress = emailAddress)}
          className="form-control"
        />

      </FormGroup>
      <FormGroup>
        <ControlLabel>Mobile Number</ControlLabel>
        <input
          type="text"
          ref={whMobilePhone => (this.whMobilePhone = whMobilePhone)}
          name="whMobilePhone"
          placeholder="10 digit number example, 8787989897"
          defaultValue={user.profile.whMobilePhone}
          className="form-control"
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>Delivery Address</ControlLabel>
        <textarea
          ref={deliveryAddress => (this.deliveryAddress = deliveryAddress)}
          name="deliveryAddress"
          placeholder="Complete address to deliver at, including Landmark, Pincode."
          rows="6"
          defaultValue={user.profile.deliveryAddress}
          className="form-control"
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>New Password</ControlLabel>
        <input
          id="newPassword"
          type="password"
          name="newPassword"
          ref={newPassword => (this.newPassword = newPassword)}
          className="form-control"
        />
      </FormGroup>
      <InputHint>
        <ul className="col-xs-6">
          <li>One Lowercase character</li>
          <li>One Uppercase character</li>
          <li>One Number</li>
        </ul>
        <ul className="col-xs-6">
          <li>One Special character</li>
          <li>6 characters minimum</li>
        </ul>
      </InputHint>
      <Row>
        <Col xs={12}>
          <FormGroup>
            <ControlLabel>Confirm New Password</ControlLabel>
            <input
              type="password"
              name="confirmPassword"
              ref={confirmPassword => (this.confirmPassword = confirmPassword)}
              className="form-control"
            />
          </FormGroup>
        </Col>
      </Row>
      <div>
        <Button type="submit" bsStyle="primary">Save Profile</Button>
      </div>
    </div>) : <div />;
  }

  renderProfileForm(loading, user) {
    return !loading ? ({
      password: this.renderPasswordUser,
      oauth: this.renderOAuthUser,
    }[this.getUserType(user)])(loading, user) : <div />;
  }

  render() {
    const { loading, user } = this.props;
    return (<div className="Profile">
      <Row>
        <Col xs={12} sm={9} md={6}>
          <h3 className="page-header">Edit Profile</h3>
          <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
            {this.renderProfileForm(loading, user)}
          </form>
        </Col>
      </Row>
    </div>);
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
