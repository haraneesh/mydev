import React from 'react';
import {
  Panel, Col, FormGroup, ControlLabel, Button,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
// import OAuthLoginButtons from '../../../components/OAuthLoginButtons/OAuthLoginButtons';
import AccountPageFooter from '../../../components/AccountPageFooter/AccountPageFooter';
import { getLoggedInUserDisplayUserName } from '../../../../modules/helpers';
import validate from '../../../../modules/validate';

const showPasswordButtonPositions = {
  position: 'absolute',
  top: '31px',
  padding: '5px',
  right: '5px',
  float: 'right',
};

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.switchPasswordBox = this.switchPasswordBox.bind(this);
  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
      rules: {
        mobilePhone: {
          required: true,
          indiaMobilePhone: true,
        },
        password: {
          required: true,
        },
      },
      messages: {
        mobilePhone: {
          required: 'Need your mobile number.',
          indiaMobilePhone: 'Is this a valid India mobile number?',
        },
        password: {
          required: 'Need a password here.',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  handleSubmit() {
    const username = { username: this.mobilePhone.value };
    const password = this.password.value;

    Meteor.loginWithPassword(username, password, (error) => {
      if (error) {
        Bert.alert(error.reason, 'warning');
      } else {
        Bert.alert(`Welcome ${getLoggedInUserDisplayUserName()}`, 'success');
        this.setState({
          loggedIn: true,
        });
      }
    });
  }

  switchPasswordBox() {
    this.setState({ showPassword: !this.state.showPassword });
  }

  render() {
    return (
      <div className="Login Absolute-Center is-Responsive">
        <Col xs={12} sm={6} md={5} lg={4}>
          <h3 className="page-header">Log In</h3>
          <form ref={(form) => (this.form = form)} onSubmit={(event) => event.preventDefault()}>
            <FormGroup>
              <ControlLabel>Mobile Number</ControlLabel>
              <input
                type="text"
                name="mobilePhone"
                ref={(mobilePhone) => (this.mobilePhone = mobilePhone)}
                className="form-control"
                placeholder="10 digit number example, 8787989897"
              />
            </FormGroup>
            <FormGroup style={{ position: 'relative' }}>
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
              />
              <Button className="btn-xs btn-info" onClick={this.switchPasswordBox} style={showPasswordButtonPositions}>
                {this.state.showPassword ? 'Hide' : 'Show'}
              </Button>
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
