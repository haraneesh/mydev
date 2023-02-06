import React from 'react';
import { Meteor } from 'meteor/meteor';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
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
    deliveryAddress: '',
    confirmPassword: '',
    eatingHealthyMeaning: '',
  },
};

class SelfSignUp extends React.Component {
  constructor(props) {
    super(props);
    this.onValueChange = this.onValueChange.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = { ...defaultState };
  }

  componentDidMount() {
    this.validateToken();
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

  validateToken() {
    // validate token
    const { history } = this.props;
    const { match } = this.props;

    Meteor.call('invitations.confirmToken', match.params.token, (error, whMobileNumber) => {
      if (error) {
        toast.error(error.reason);
        history.push('/signup');
      } else {
        document.querySelector('[name="whMobilePhone"]').value = whMobileNumber;
      }
    });
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
        // whMobilePhone: this.whMobilePhone.value,
        deliveryAddress: this.deliveryAddress.value,
        eatingHealthyMeaning: this.eatingHealthyMeaning.value,
      },
    };

    if (match.params.token) {
      acceptInvitation.call({ user, token: match.params.token }, (error) => {
        if (error) {
          history.push('/signup');
          toast.error(error.reason);
        } else {
          toast.success(`Welcome ${this.firstName.value} ${this.lastName.value}!`);
          setTimeout(() => {
            history.push('/login');
          }, 3000);
        }
      });
    } else {
      history.push('/signup');

      /* Meteor.call('users.signUp', user, (error) => {
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
      <div className="Signup offset-sm-1">
        <div>
          <Col xs={12} sm={10}>
            <h2 className="py-4">Sign Up</h2>
            <div className="card text-center">
              <div className="card-body">
                <h2 className="text-primary"> Welcome to Suvai </h2>
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
              </div>
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
              <Row>
                <Col xs={6}>
                  <Row
                    validationState={isError.firstName.length > 0 ? 'error' : ''}
                    style={{ paddingRight: '1px' }}
                  >
                    <Row>First Name</Row>
                    <input
                      type="text"
                      name="firstName"
                      ref={(firstName) => (this.firstName = firstName)}
                      onBlur={this.onValueChange}
                      className="form-control"
                    />
                  </Row>
                </Col>
                <Col xs={6}>
                  <Row
                    validationState={isError.lastName.length > 0 ? 'error' : ''}
                    style={{ paddingLeft: '1px' }}
                  >
                    <Row>Last Name</Row>
                    <input
                      type="text"
                      name="lastName"
                      ref={(lastName) => (this.lastName = lastName)}
                      onBlur={this.onValueChange}
                      className="form-control"
                    />
                  </Row>
                </Col>
              </Row>
              <Row validationState={isError.emailAddress.length > 0 ? 'error' : ''}>
                <Row>Email Address</Row>
                <input
                  type="email"
                  name="emailAddress"
                  ref={(emailAddress) => (this.emailAddress = emailAddress)}
                  onBlur={this.onValueChange}
                  className="form-control"
                />
              </Row>

              <Row validationState={isError.whMobilePhone.length > 0 ? 'error' : ''}>
                <Row>Whatsapp Mobile Number</Row>
                <input
                  type="text"
                  ref={(whMobilePhone) => (this.whMobilePhone = whMobilePhone)}
                  name="whMobilePhone"
                  placeholder="10 digit number example, 8787989897"
                  className="form-control"
                  disabled
                />

                <Button style={{ marginTop: '0.5em' }} onClick={() => { this.props.history.push('/signup'); }}> Change Phone Number </Button>

              </Row>
              <Row validationState={isError.deliveryAddress.length > 0 ? 'error' : ''}>
                <Row>Delivery Address</Row>
                <textarea
                  ref={(deliveryAddress) => (this.deliveryAddress = deliveryAddress)}
                  name="deliveryAddress"
                  placeholder="Complete address to deliver at, including Landmark, Pincode."
                  rows={6}
                  className="form-control"
                  onBlur={this.onValueChange}
                />
              </Row>
              <Row validationState={isError.eatingHealthyMeaning.length > 0 ? 'error' : ''}>
                <Row>What does eating healthy mean to you?</Row>
                <textarea
                  ref={(eatingHealthyMeaning) => (this.eatingHealthyMeaning = eatingHealthyMeaning)}
                  name="eatingHealthyMeaning"
                  placeholder="You are never wrong, tell us what is in your mind."
                  rows={6}
                  className="form-control"
                  onBlur={this.onValueChange}
                />
              </Row>
              <Row validationState={isError.password.length > 0 ? 'error' : ''}>
                <Row>Password</Row>
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
              <Row validationState={isError.confirmPassword.length > 0 ? 'error' : ''}>
                <Row>Confirm Password</Row>
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
      <Card style={{ marginTop: '1.5em' }}>
        <Row className="text-center">
          <Col xs={12}>
            <h2>Thanks for your interest in Suvai!</h2>
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
      </Card>
    )
    );
  }
}

SelfSignUp.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default SelfSignUp;
