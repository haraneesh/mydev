import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Alert, FormGroup, ControlLabel, Button,
} from 'react-bootstrap';
import { Accounts } from 'meteor/accounts-base';
import { toast } from 'react-toastify';
import validate from '../../../../modules/validate';

class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    const component = this;

    validate(component.form, {
      rules: {
        newPassword: {
          required: true,
          minlength: 6,
        },
        repeatNewPassword: {
          required: true,
          minlength: 6,
          equalTo: '[name="newPassword"]',
        },
      },
      messages: {
        newPassword: {
          required: 'Enter a new password, please.',
          minlength: 'Use at least six characters, please.',
        },
        repeatNewPassword: {
          required: 'Repeat your new password, please.',
          equalTo: 'The password and confirm password are not matching, please try again.',
        },
      },
      submitHandler() { component.handleSubmit(); },
    });
  }

  handleSubmit() {
    const { match, history } = this.props;
    const { token } = match.params;

    Accounts.resetPassword(token, this.newPassword.value, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        history.push('/order');
      }
    });
  }

  render() {
    return (
      <div className="ResetPassword">
        <Row>
          <Col xs={12} sm={6} md={4}>
            <h3 className="page-header">Reset Password</h3>
            <Alert bsStyle="info">
              To reset your password, enter a new one below. You will be logged in
              with your new password.
            </Alert>
            <form ref={(form) => (this.form = form)} onSubmit={(event) => event.preventDefault()}>
              <FormGroup>
                <ControlLabel>New Password</ControlLabel>
                <input
                  type="password"
                  className="form-control"
                  ref={(newPassword) => (this.newPassword = newPassword)}
                  name="newPassword"
                  placeholder="New Password"
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Repeat New Password</ControlLabel>
                <input
                  type="password"
                  className="form-control"
                  ref={(repeatNewPassword) => (this.repeatNewPassword = repeatNewPassword)}
                  name="repeatNewPassword"
                  placeholder="Repeat New Password"
                />
              </FormGroup>
              <Button type="submit" bsStyle="primary">Reset Password &amp; Login</Button>
            </form>
          </Col>
        </Row>
      </div>
    );
  }
}

ResetPassword.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default ResetPassword;
