import React from 'react';
import {
  Col, FormGroup, ControlLabel, Button,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';

// import OAuthLoginButtons from '../../../components/OAuthLoginButtons/OAuthLoginButtons';
import AccountPageFooter from '../../../components/AccountPageFooter/AccountPageFooter';
import { getLoggedInUserDisplayUserName } from '../../../../modules/helpers';
import { formValid, formValChange } from '../../../../modules/validate';

const showPasswordButtonPositions = {
  position: 'absolute',
  top: '31px',
  padding: '5px',
  right: '5px',
  float: 'right',
};

const defaultState = {
  isError: {
    whMobilePhone: '',
    password: '',
  },
  showPassword: false,
};

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...defaultState };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.switchPasswordBox = this.switchPasswordBox.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
  }

  onValueChange(e) {
    e.preventDefault();
    const { isError } = this.state;
    const newState = formValChange(e, { ...isError });
    this.setState(newState);
  }

  handleSubmit() {
    const username = { username: this.whMobilePhone.value };
    const password = this.password.value;

    Meteor.loginWithPassword(username, password, (error) => {
      if (error) {
        toast.warn(error.reason);
      } else {
        toast.success(`Welcome ${getLoggedInUserDisplayUserName()}`);
      }
    });
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

  switchPasswordBox() {
    this.setState({ showPassword: !this.state.showPassword });
  }

  render() {
    const { isError } = this.state;
    return (
      <div className="Login Absolute-Center is-Responsive">
        <Col xs={12} sm={6} md={5} lg={4}>
          <h3 className="page-header">Log In</h3>
          <form onSubmit={this.validateForm}>
            <FormGroup validationState={isError.whMobilePhone.length > 0 ? 'error' : ''}>
              <ControlLabel>Mobile Number</ControlLabel>
              <input
                type="text"
                name="whMobilePhone"
                ref={(whMobilePhone) => (this.whMobilePhone = whMobilePhone)}
                className="form-control"
                placeholder="10 digit number example, 8787989897"
                onBlur={this.onValueChange}
              />
              {isError.whMobilePhone.length > 0 && (
              <span className="control-label">{isError.whMobilePhone}</span>
              )}
            </FormGroup>
            <FormGroup validationState={isError.password.length > 0 ? 'error' : ''} style={{ position: 'relative' }}>
              <ControlLabel className="clearfix">
                <span className="pull-left">Password</span>
                <Link className="pull-right" to="/recover-password">Forgot password?</Link>
              </ControlLabel>
              <input
                type={(this.state.showPassword ? 'text' : 'password')}
                name="password"
                ref={(password) => (this.password = password)}
                className="form-control"
                placeholder="Password"
                onBlur={this.onValueChange}
              />
              <Button className="btn-xs btn-info" onClick={this.switchPasswordBox} style={showPasswordButtonPositions}>
                {this.state.showPassword ? 'Hide' : 'Show'}
              </Button>
              {isError.password.length > 0 && (
              <span className="control-label">{isError.password}</span>
              )}
            </FormGroup>
            <Button type="submit" bsStyle="primary" className="loginBtn">Log In</Button>
            <AccountPageFooter>
              <div className="panel text-center" style={{ marginBottom: '0px', padding: '12.5px' }}>
                <span>
                  {'Not a member yet? '}
                  <a href="/signup" className="login-singup">Join</a>
                </span>
              </div>
            </AccountPageFooter>
          </form>
          {/* } <Row>
            <p>- Or - </p>
          </Row>
          <Row>
            <Col xs={12}>
              <OAuthLoginButtons
                services={['facebook' , 'github', 'google']}
              />
            </Col>
          </Row> */}
        </Col>
      </div>
    );
  }
}

export default Login;
