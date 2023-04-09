import React from 'react';

import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';

// import OAuthLoginButtons from '../../../components/OAuthLoginButtons/OAuthLoginButtons';
import { getLoggedInUserDisplayUserName } from '../../../../modules/helpers';
import { formValid, formValChange } from '../../../../modules/validate';
import { clearEntireLocalStore } from '../../../stores/localStorage';

const showPasswordButtonPositions = {
  position: 'relative',
  top: '-45px',
  padding: '10px',
  fontSize: '76%',
  width: '75px',
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
      <div className="Login Absolute-Center is-Responsive offset-sm-1 p-3">
        <Col xs={12} sm={6} md={5} lg={4}>
          <h2 className="py-4">Sign in</h2>
          <form onSubmit={this.validateForm}>
            <Row className="py-2" validationState={isError.whMobilePhone.length > 0 ? 'error' : null}>
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
                <span className="small text-info">{isError.whMobilePhone}</span>
              )}
            </Row>
            <Row className="py-2" validationState={isError.password.length > 0 ? 'error' : null} style={{ position: 'relative' }}>
              <label className="clearfix control-label">
                <span>Password</span>
                <Link className="float-end" to="/recover-password">Forgot password?</Link>
              </label>
              <input
                type={(this.state.showPassword ? 'text' : 'password')}
                name="password"
                className="form-control"
                placeholder="Password"
                onBlur={this.onValueChange}
              />

              <div className="col-12">
                <Button
                  className="text-center btn-block float-end"
                  variant="link"
                  onClick={this.switchPasswordBox}
                  style={showPasswordButtonPositions}
                >
                  {this.state.showPassword ? 'Hide' : 'Show'}
                </Button>

                {isError.password.length > 0 && (
                <span className="small text-info">{isError.password}</span>
                )}

                <Button
                  type="submit"
                  variant="secondary"
                  className="my-2 mb-4 loginBtn d-block"
                >
                  Sign in

                </Button>
              </div>
            </Row>
            <div className="text-center alert bg-body py-3">
              <span>
                {'New to Suvai? '}
                <a href="/signup" className="login-signup text-secondary h4 ps-1">Create an account</a>
              </span>
            </div>

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
