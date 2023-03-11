import React from 'react';
import { Meteor } from 'meteor/meteor';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { acceptInvitation } from '../../../../api/Invitations/methods';
// import OAuthLoginButtons from '../../../components/OAuthLoginButtons/OAuthLoginButtons';
import InputHint from '../../../components/InputHint/InputHint';
import { formValChange, formValid } from '../../../../modules/validate';

const defaultState = {
  signUpRequestSent: false,
  isError: {
    emailAddress: '',
    password: '',
    firstName: '',
    lastName: '',
    whMobilePhone: '',
    confirmWhMobileNumber: '',
    deliveryAddress: '',
    deliveryPincode: '',
    confirmPassword: '',
    eatingHealthyMeaning: '',
  },
};

class SignUp extends React.Component {
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
        whMobilePhone: this.whMobilePhone.value,
        confirmWhMobileNumber: this.confirmWhMobileNumber.value,
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
      password: document.querySelector('[name="password"]').value,
      profile: {
        name: {
          first: this.firstName.value,
          last: this.lastName.value,
        },
        whMobilePhone: this.whMobilePhone.value,
        deliveryAddress: this.deliveryAddress.value,
        deliveryPincode: this.deliveryPincode.value,
        eatingHealthyMeaning: this.eatingHealthyMeaning.value,
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
          /* toast.success(`Welcome ${this.firstName.value} ${this.lastName.value}!`);
          this.setState({
            signUpRequestSent: true,
          }); */

          // Log In
          Meteor.loginWithPassword(user.username, user.password, (error) => {
            if (error) {
              toast.warn(error.reason);
            } else {
              toast.success(`Welcome ${getLoggedInUserDisplayUserName()}`);
              history.push('/cart');
            }
          });
        }
      });
      /*
      Meteor.call('users.signUp', user, (error) => {
        if (error) {
          toast.error(error.reason);
        } else {
          toast.success(`Welcome ${this.firstName.value} ${this.lastName.value}!`);
          this.setState({
            signUpRequestSent: true,
          });
        }
      }); */
    }
  }

  render() {
    const { signUpRequestSent } = this.state;
    const { isError } = this.state;
    return (!signUpRequestSent ? (
      <div className="Signup offset-sm-1 p-2">
        <div>
          <Col xs={12} sm={10}>
            <h2 className="py-4 text-center">Sign Up</h2>
            <div className="text-center">
              <Card className="p-3">
                <h2 className="text-secondary"> Welcome to Suvai </h2>
                <br />
                <p>
                  Suvai is a community of like minded families who have been together for more than
                  {' '}
                  <b className="text-info h4">5 years</b>
                  .
                </p>
                <p>
                  We are committed to eating healthy and leaving behind a small ecological footprint.
                </p>
                <p>
                  We are happy to Welcome you, Please introduce yourself.
                </p>
              </Card>
            </div>

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
              <Row className="pt-3">
                <Col xs={6}>
                  <Row
                    validationState={isError.firstName.length > 0 ? 'error' : ''}
                    style={{ paddingRight: '1px' }}
                  >
                    <label>First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      ref={(firstName) => (this.firstName = firstName)}
                      onBlur={this.onValueChange}
                      className="form-control"
                    />
                  </Row>
                  {isError.firstName.length > 0 && (
                  <span className="small text-danger">{isError.firstName}</span>
                  )}
                </Col>
                <Col xs={6}>
                  <Row
                    validationState={isError.lastName.length > 0 ? 'error' : ''}
                    style={{ paddingLeft: '1px' }}
                  >
                    <label>Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      ref={(lastName) => (this.lastName = lastName)}
                      onBlur={this.onValueChange}
                      className="form-control"
                    />
                  </Row>
                  {isError.lastName.length > 0 && (
                  <span className="small text-danger">{isError.lastName}</span>
                  )}
                </Col>
              </Row>
              <Row className="pt-3" validationState={isError.emailAddress.length > 0 ? 'error' : ''}>
                <label>Email Address</label>
                <input
                  type="email"
                  name="emailAddress"
                  ref={(emailAddress) => (this.emailAddress = emailAddress)}
                  onBlur={this.onValueChange}
                  className="form-control"
                />
                {isError.emailAddress.length > 0 && (
                <span className="small text-danger">{isError.emailAddress}</span>
                )}
              </Row>
              <Row className="pt-3" validationState={isError.whMobilePhone.length > 0 ? 'error' : ''}>
                <label>Whats App Mobile Number</label>
                <input
                  type="text"
                  ref={(whMobilePhone) => (this.whMobilePhone = whMobilePhone)}
                  name="whMobilePhone"
                  placeholder="10 digit number example, 8787989897"
                  className="form-control"
                  onBlur={this.onValueChange}
                />
                {isError.whMobilePhone.length > 0 && (
                <span className="small text-danger">{isError.whMobilePhone}</span>
                )}
              </Row>
              <Row className="pt-2" validationState={isError.confirmWhMobileNumber.length > 0 ? 'error' : ''}>
                <label>Confirm Mobile Number</label>
                <input
                  type="password"
                  ref={(confirmWhMobileNumber) => (this.confirmWhMobileNumber = confirmWhMobileNumber)}
                  name="confirmWhMobileNumber"
                  placeholder="10 digit number example, 8787989897"
                  onBlur={this.onValueChange}
                  onPaste={(e) => { e.preventDefault(); }}
                  className="form-control"
                />
                {isError.confirmWhMobileNumber.length > 0 && (
                <span className="small text-danger">{isError.confirmWhMobileNumber}</span>
                )}
              </Row>
              <Row className="pt-3" validationState={isError.deliveryAddress.length > 0 ? 'error' : ''}>
                <label>Delivery Address</label>
                <textarea
                  ref={(deliveryAddress) => (this.deliveryAddress = deliveryAddress)}
                  name="deliveryAddress"
                  placeholder="Complete address to deliver at, including Landmark, Pincode."
                  rows={6}
                  className="form-control"
                  onBlur={this.onValueChange}
                />
                {isError.deliveryAddress.length > 0 && (
                <span className="small text-danger">{isError.deliveryAddress}</span>
                )}
              </Row>
              <Row validationState={isError.deliveryPincode.length > 0 ? 'error' : ''}>
                <Row>Delivery Address Pincode</Row>
                <input
                  type="text"
                  ref={(deliveryPincode) => (this.deliveryPincode = deliveryPincode)}
                  name="deliveryPincode"
                  placeholder="Enter Pincode of the delivery address"
                  className="form-control"
                  onBlur={this.onValueChange}
                />
                {isError.deliveryPincode.length > 0 && (
                <span className="small text-danger">{isError.deliveryPincode}</span>
                )}
              </Row>
              <Row className="pt-3" validationState={isError.eatingHealthyMeaning.length > 0 ? 'error' : ''}>
                <label>What does eating healthy mean to you?</label>
                <textarea
                  ref={(eatingHealthyMeaning) => (this.eatingHealthyMeaning = eatingHealthyMeaning)}
                  name="eatingHealthyMeaning"
                  placeholder="You are never wrong, tell us what is in your mind."
                  rows={6}
                  className="form-control"
                  onBlur={this.onValueChange}
                />
                {isError.eatingHealthyMeaning.length > 0 && (
                <span className="small text-info">{isError.eatingHealthyMeaning}</span>
                )}
              </Row>
              <Row className="pt-3" validationState={isError.password.length > 0 ? 'error' : ''}>
                <label>Password</label>
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
                <span className="small text-info">{isError.password}</span>
                )}
              </Row>
              <Row className="pt-3" validationState={isError.confirmPassword.length > 0 ? 'error' : ''}>
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  ref={(confirmPassword) => (this.confirmPassword = confirmPassword)}
                  className="form-control"
                  onBlur={this.onValueChange}
                />
                {isError.confirmPassword.length > 0 && (
                <span className="small text-info">{isError.confirmPassword}</span>
                )}
              </Row>
              <p>
                <small>
                  By Signing up you are sharing your commitment towards healthy and sustainable lifestyle.
                </small>
              </p>
              <Button type="submit" variant="secondary">Sign Up</Button>

              <div className="alert alert-info text-center p-3 mt-3">
                <span>
                  {'Already have an account? '}
                  <a href="/login" className="login-signup text-secondary">Log In</a>
                </span>
              </div>

            </form>
          </Col>
        </div>
      </div>
    ) : (
      <Card className="text-center mt-3 p-4">
        <Col xs={12} className="mt-3">
          <h3>Thanks for your interest in Suvai!</h3>
          <br />
          <p>
            Please give us a few days for our admins to review the
            request and send an invite to join our community.
          </p>
        </Col>
        <Col xs={12} className="mt-2">
          <p>
            While you are waiting, here is our manifesto on Healthy Living.
          </p>
          <h4>
            <a className="text-secondary" href="/healthprinciples"> Suvai's Health Principles</a>
          </h4>
        </Col>
      </Card>
    )
    );
  }
}

SignUp.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default SignUp;
