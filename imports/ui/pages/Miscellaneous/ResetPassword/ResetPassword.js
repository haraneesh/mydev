import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Alert, FormGroup, ControlLabel, Button,
} from 'react-bootstrap';
import { Accounts } from 'meteor/accounts-base';
import { toast } from 'react-toastify';
import { formValChange, formValid } from '../../../../modules/validate';

const defaultState = {
  isError: {
    newPassword: '',
    confirmPassword: '',
  },
};

class ResetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ...defaultState };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  onValueChange(e) {
    e.preventDefault();
    const { isError } = this.state;
    const newState = formValChange(e,
      { ...isError },
      {
        newPassword: document.querySelector('[name="newPassword"]').value,
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
    const { isError } = this.state;
    return (
      <div className="ResetPassword offset-sm-1">
        <Row>
          <Col xs={12} sm={6} md={4}>
            <h2 className="page-header">Reset Password</h2>
            <Alert bsStyle="info">
              To reset your password, enter a new one below. You will be logged in
              with your new password.
            </Alert>
            <form ref={(form) => (this.form = form)} onSubmit={this.validateForm}>
              <FormGroup validationState={isError.newPassword.length > 0 ? 'error' : ''}>
                <ControlLabel>New Password</ControlLabel>
                <input
                  type="password"
                  className="form-control"
                  ref={(newPassword) => (this.newPassword = newPassword)}
                  name="newPassword"
                  placeholder="New Password"
                  onBlur={this.onValueChange}
                />
                {isError.newPassword.length > 0 && (
                <span className="control-label">{isError.newPassword}</span>
                )}
              </FormGroup>
              <FormGroup validationState={isError.confirmPassword.length > 0 ? 'error' : ''}>
                <ControlLabel>Repeat New Password</ControlLabel>
                <input
                  type="password"
                  className="form-control"
                  ref={(confirmPassword) => (this.confirmPassword = confirmPassword)}
                  name="confirmPassword"
                  placeholder="Repeat New Password"
                  onBlur={this.onValueChange}
                />
                {isError.confirmPassword.length > 0 && (
                <span className="control-label">{isError.confirmPassword}</span>
                )}
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
