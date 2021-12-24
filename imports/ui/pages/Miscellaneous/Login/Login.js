import React from 'react';
import {
  Col, FormGroup, Button, Panel,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';

// import OAuthLoginButtons from '../../../components/OAuthLoginButtons/OAuthLoginButtons';
import AccountPageFooter from '../../../components/AccountPageFooter/AccountPageFooter';
import { getLoggedInUserDisplayUserName } from '../../../../modules/helpers';
import { formValid, formValChange } from '../../../../modules/validate';

const showPasswordButtonPositions = {
  position: 'relative',
  top: '-41px',
  padding: '10px',
  right: '6px',
  float: 'right',
  fontSize: '75%',
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
    const username = { username: this.whMobilePhone.value.trim() };
    const password = document.getElementsByName('password')[0].value.trim();

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
      <div className="Login Absolute-Center is-Responsive offset-sm-1">
        <Col xs={12} sm={6} md={5} lg={4}>
          <h2 className="page-header">Log In</h2>
          <form onSubmit={this.validateForm}>
            <FormGroup validationState={isError.whMobilePhone.length > 0 ? 'error' : null}>
              <label className="control-label">Mobile Number</label>
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
            <FormGroup validationState={isError.password.length > 0 ? 'error' : null} style={{ position: 'relative' }}>
              <label className="clearfix control-label">
                <span className="pull-left">Password</span>
                <Link className="pull-right" to="/recover-password">Forgot password?</Link>
              </label>
              <input
                type={(this.state.showPassword ? 'text' : 'password')}
                name="password"
                className="form-control"
                placeholder="Password"
                onBlur={this.onValueChange}
              />
              <Button
                className="btn-xs btn-info"
                onClick={this.switchPasswordBox}
                style={showPasswordButtonPositions}
              >
                {this.state.showPassword ? 'Hide' : 'Show'}
              </Button>
              {isError.password.length > 0 && (
                <span className="control-label">{isError.password}</span>
              )}
            </FormGroup>
            <Button type="submit" bsStyle="primary" className="loginBtn">Log In</Button>
            <AccountPageFooter>
              <div className="panel text-center" style={{ marginBottom: '0px', padding: '6px' }}>
                <span>
                  {'Not a member yet? '}
                  <a href="/signup" className="login-signup">Join</a>
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
