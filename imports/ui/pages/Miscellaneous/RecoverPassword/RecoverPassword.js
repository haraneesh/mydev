import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Accounts } from 'meteor/accounts-base';
import { toast } from 'react-toastify';
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
      <div className="RecoverPassword offset-sm-1">
        <Row>
          <Col xs={12} sm={6} md={5} lg={4}>
            <h2 className="py-4">Recover Password</h2>
            <Alert variant="info">
              Enter your email address below to receive a link to reset your password.
            </Alert>
            <form ref={(form) => (this.form = form)} onSubmit={this.validateForm}>
              <Row validationState={isError.emailAddress.length > 0 ? 'error' : ''}>
                <label>Email Address</label>
                <input
                  type="email"
                  name="emailAddress"
                  ref={(emailAddress) => (this.emailAddress = emailAddress)}
                  className="form-control"
                  onBlur={this.onValueChange}
                />
              </Row>
              <Button type="submit" className="my-3" variant="secondary">Recover Password</Button>

              <div className="text-center alert alert-info py-3">
                <span>
                  {'Remember your password? '}
                  <Link to="/login" className="login-signup">Log In</Link>
                  .
                </span>
              </div>

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
