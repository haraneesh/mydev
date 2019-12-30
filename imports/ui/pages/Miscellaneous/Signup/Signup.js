import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Panel, Row, Col, FormGroup, ControlLabel, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Bert } from 'meteor/themeteorchef:bert';
import { acceptInvitation } from '../../../../api/Invitations/methods';
// import OAuthLoginButtons from '../../../components/OAuthLoginButtons/OAuthLoginButtons';
import InputHint from '../../../components/InputHint/InputHint';
import AccountPageFooter from '../../../components/AccountPageFooter/AccountPageFooter';
import validate from '../../../../modules/validate';

class Signup extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      signUpRequestSent: false,
    };
  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
      rules: {
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
        password: {
          required() {
            // Only required if password field has a value.
            return component.confirmPassword.value.length > 0;
          },
          minlength: 6,
        },
        confirmPassword: {
          required() {
            return (component.password.value.length > 0);
          },
          minlength: 6,
          equalTo: '#password',
        },
      },
      messages: {
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
        password: {
          required: 'Enter a new password, please.',
          minlength: 'Use at least six characters, please.',
        },
        confirmPassword: {
          required: 'Repeat your new password, please.',
          equalTo: 'The password and confirm password are not matching, please try again.',
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
    const { match } = this.props;

    const user = {
      username: this.whMobilePhone.value,
      email: this.emailAddress.value,
      password: this.password.value,
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
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(`Welcome ${this.firstName.value} ${this.lastName.value}!`, 'success');
          history.push('/');
        }
      });
    } else {
      Meteor.call('users.signUp', user, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(`Welcome ${this.firstName.value} ${this.lastName.value}!`, 'success');
          this.setState({
            signUpRequestSent: true,
          });
        }
      });
    }
  }

  render() {
    const { signUpRequestSent } = this.state;

    return (!signUpRequestSent ? (<div className="Signup">
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
          <form ref={form => (this.form = form)} onSubmit={event => event.preventDefault()}>
            <Row>
              <Col xs={6}>
                <FormGroup>
                  <ControlLabel>First Name</ControlLabel>
                  <input
                    type="text"
                    name="firstName"
                    ref={firstName => (this.firstName = firstName)}
                    className="form-control"
                  />
                </FormGroup>
              </Col>
              <Col xs={6}>
                <FormGroup>
                  <ControlLabel>Last Name</ControlLabel>
                  <input
                    type="text"
                    name="lastName"
                    ref={lastName => (this.lastName = lastName)}
                    className="form-control"
                  />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <ControlLabel>Email Address</ControlLabel>
              <input
                type="email"
                name="emailAddress"
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
                className="form-control"
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Password</ControlLabel>
              <input
                id="password"
                type="password"
                name="password"
                ref={password => (this.password = password)}
                className="form-control"
              />
              <InputHint>Use at least six characters.</InputHint>
            </FormGroup>
            <FormGroup>
              <ControlLabel>Confirm Password</ControlLabel>
              <input
                type="password"
                name="confirmPassword"
                ref={confirmPassword => (this.confirmPassword = confirmPassword)}
                className="form-control"
              />
            </FormGroup>
            <Button type="submit" bsStyle="primary">Sign Up</Button>
            <AccountPageFooter>
              <p>Already have an account? <Link to="/login" className="login-singup">Log In</Link>.</p>
            </AccountPageFooter>
          </form>
        </Col>
      </div>
    </div>) : (
      <Panel style={{ marginTop: '1.5em' }}>
        <Row>
          <Col xs={12}>
            <h3>Thanks for your interest in Suvai!</h3>
            <br />
            <p>
              Please give us a few days for our admins to review the
              request and send an invite to join our community.
            </p>
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
