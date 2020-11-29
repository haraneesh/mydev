import React from 'react';
import {
  Row, Col, Alert, FormGroup, ControlLabel, Button,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Accounts } from 'meteor/accounts-base';
import { toast } from 'react-toastify';
import AccountPageFooter from '../../../components/AccountPageFooter/AccountPageFooter';
import { formValChange, formValid } from '../../../../modules/validate';

class RecoverPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isError: { emailAddress: '' },
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onValueChange = this.onValueChange.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  onValueChange(e) {
    e.preventDefault();
    const { isError } = this.state;
    const newState = formValChange(e,
      { ...isError });
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
    const email = this.emailAddress.value;

    Accounts.forgotPassword({ email }, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success(`Check ${email} for a reset link!`);
        history.push('/login');
      }
    });
  }

  render() {
    const { isError } = this.state;
    return (
      <div className="RecoverPassword">
        <Row>
          <Col xs={12} sm={6} md={5} lg={4}>
            <h3 className="page-header">Recover Password</h3>
            <Alert bsStyle="info">
              Enter your email address below to receive a link to reset your password.
            </Alert>
            <form ref={(form) => (this.form = form)} onSubmit={this.validateForm}>
              <FormGroup validationState={isError.emailAddress.length > 0 ? 'error' : ''}>
                <ControlLabel>Email Address</ControlLabel>
                <input
                  type="email"
                  name="emailAddress"
                  ref={(emailAddress) => (this.emailAddress = emailAddress)}
                  className="form-control"
                  onBlur={this.onValueChange}
                />
              </FormGroup>
              <Button type="submit" bsStyle="primary">Recover Password</Button>
              <AccountPageFooter>
                <p>
                  Remember your password?
                  <Link to="/login">Log In</Link>
                  .
                </p>
              </AccountPageFooter>
            </form>
          </Col>
        </Row>
      </div>
    );
  }
}

RecoverPassword.propTypes = {
  history: PropTypes.object.isRequired,
};

export default RecoverPassword;
