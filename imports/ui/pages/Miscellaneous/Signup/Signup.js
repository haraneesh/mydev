import React from 'react';
import { Meteor } from 'meteor/meteor';
import {
  Panel, Row, Col, FormGroup, ControlLabel, Button,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { acceptInvitation } from '../../../../api/Invitations/methods';
// import OAuthLoginButtons from '../../../components/OAuthLoginButtons/OAuthLoginButtons';
import InputHint from '../../../components/InputHint/InputHint';
import { formValChange, formValid } from '../../../../modules/validate';
import AccountPageFooter from '../../../components/AccountPageFooter/AccountPageFooter';

const defaultState = {
  signUpRequestSent: false,
  isError: {
    emailAddress: '',
    password: '',
    firstName: '',
    lastName: '',
    whMobilePhone: '',
    deliveryAddress: '',
    confirmPassword: '',
  },
};

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.onValueChange = this.onValueChange.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { ...defaultState };
  }

  onValueChange(e) {
    e.preventDefault();
    const { isError } = this.state;
    const newState = formValChange(e,
      { ...isError },
      {
        password: document.querySelector('[name="password"]').value,
        confirmPassword: document.querySelector('[name="confirmPassword"]').value,
      });
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
    const { history } = this.props;
    const { match } = this.props;

    const user = {
      username: this.whMobilePhone.value,
      email: this.emailAddress.value,
      password: document.querySelector('[name="password"]').value, // this.password.value,
      profile: {
        name: {
          first: this.firstName.value,
          last: this.lastName.value,
        },
        whMobilePhone: this.whMobilePhone.value,
        deliveryAddress: this.deliveryAddress.value,
      },
    };

    if (match.params.token) {
      acceptInvitation.call({ user, token: match.params.token }, (error) => {
        if (error) {
          toast.error(error.reason);
        } else {
          toast.success(`Welcome ${this.firstName.value} ${this.lastName.value}!`);
          history.push('/');
        }
      });
    } else {
      Meteor.call('users.signUp', user, (error) => {
        if (error) {
          toast.error(error.reason);
        } else {
          toast.success(`Welcome ${this.firstName.value} ${this.lastName.value}!`);
          this.setState({
            signUpRequestSent: true,
          });
        }
      });
    }
  }

  render() {
    const { signUpRequestSent } = this.state;
    const { isError } = this.state;
    return (!signUpRequestSent ? (
      <div className="Signup offset-sm-1">
        <div>
          <Col xs={12} sm={6} md={5} lg={4}>
            <h3 className="page-header">Sign Up</h3>
            { /* <Row>
            <Col xs={12}>
              <OAuthLoginButtons
                services={['facebook']}
                emailMessage={{
                  offset: 0,
                  text: '- OR -',
                }}
              />
            </Col>
          </Row> */ }
            <form ref={(form) => (this.form = form)} onSubmit={this.validateForm}>
              <Row>
                <Col xs={6}>
                  <FormGroup
                    validationState={isError.firstName.length > 0 ? 'error' : ''}
                    style={{ paddingRight: '1px' }}
                  >
                    <ControlLabel>First Name</ControlLabel>
                    <input
                      type="text"
                      name="firstName"
                      ref={(firstName) => (this.firstName = firstName)}
                      onBlur={this.onValueChange}
                      className="form-control"
                    />
                  </FormGroup>
                </Col>
                <Col xs={6}>
                  <FormGroup
                    validationState={isError.lastName.length > 0 ? 'error' : ''}
                    style={{ paddingLeft: '1px' }}
                  >
                    <ControlLabel>Last Name</ControlLabel>
                    <input
                      type="text"
                      name="lastName"
                      ref={(lastName) => (this.lastName = lastName)}
                      onBlur={this.onValueChange}
                      className="form-control"
                    />
                  </FormGroup>
                </Col>
              </Row>
              <FormGroup validationState={isError.emailAddress.length > 0 ? 'error' : ''}>
                <ControlLabel>Email Address</ControlLabel>
                <input
                  type="email"
                  name="emailAddress"
                  ref={(emailAddress) => (this.emailAddress = emailAddress)}
                  onBlur={this.onValueChange}
                  className="form-control"
                />
              </FormGroup>

              <FormGroup validationState={isError.whMobilePhone.length > 0 ? 'error' : ''}>
                <ControlLabel>Mobile Number</ControlLabel>
                <input
                  type="text"
                  ref={(whMobilePhone) => (this.whMobilePhone = whMobilePhone)}
                  name="whMobilePhone"
                  placeholder="10 digit number example, 8787989897"
                  className="form-control"
                  onBlur={this.onValueChange}
                />
              </FormGroup>
              <FormGroup validationState={isError.deliveryAddress.length > 0 ? 'error' : ''}>
                <ControlLabel>Delivery Address</ControlLabel>
                <textarea
                  ref={(deliveryAddress) => (this.deliveryAddress = deliveryAddress)}
                  name="deliveryAddress"
                  placeholder="Complete address to deliver at, including Landmark, Pincode."
                  rows="6"
                  className="form-control"
                  onBlur={this.onValueChange}
                />
              </FormGroup>
              <FormGroup validationState={isError.password.length > 0 ? 'error' : ''}>
                <ControlLabel>Password</ControlLabel>
                <input
                  id="password"
                  type="password"
                  name="password"
                  // ref={(password) => (this.password = password)}
                  className="form-control"
                  onBlur={this.onValueChange}
                />
                <InputHint>Use at least six characters.</InputHint>
                {isError.password.length > 0 && (
                <span className="control-label">{isError.password}</span>
                )}
              </FormGroup>
              <FormGroup validationState={isError.confirmPassword.length > 0 ? 'error' : ''}>
                <ControlLabel>Confirm Password</ControlLabel>
                <input
                  type="password"
                  name="confirmPassword"
                  ref={(confirmPassword) => (this.confirmPassword = confirmPassword)}
                  className="form-control"
                  onBlur={this.onValueChange}
                />
                {isError.confirmPassword.length > 0 && (
                <span className="control-label">{isError.confirmPassword}</span>
                )}
              </FormGroup>
              <Button type="submit" bsStyle="primary">Sign Up</Button>
              <AccountPageFooter>
                <div className="panel text-center" style={{ marginBottom: '0px', padding: '6px' }}>
                  <span>
                    {'Already have an account? '}
                    <a href="/login" className="login-signup">Log In</a>
                  </span>
                </div>

              </AccountPageFooter>
            </form>
          </Col>
        </div>
      </div>
    ) : (
      <Panel style={{ marginTop: '1.5em' }}>
        <Row className="text-center">
          <Col xs={12}>
            <h3>Thanks for your interest in Suvai!</h3>
            <br />
            <p>
              Please give us a few days for our admins to review the
              request and send an invite to join our community.
            </p>
          </Col>
          <Col xs={12} style={{ marginTop: '2rem' }}>
            <p>
              While you are waiting, here is our manifesto on Healthy Living.
            </p>
            <h4>
              <a className="text-primary" href="/healthprinciples"> Suvai's Health Principles</a>
            </h4>
          </Col>
        </Row>
      </Panel>
    )
    );
  }
}

Signup.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default Signup;
