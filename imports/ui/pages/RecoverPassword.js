import React from 'react';
import { Row, Col, Alert, FormGroup, FormControl, Button } from 'react-bootstrap';
import handleRecoverPassword from '../../modules/recover-password';

export default class RecoverPassword extends React.Component {
  componentDidMount() {
    handleRecoverPassword({ component: this });
  }

  handleSubmit(event) {
    event.preventDefault();
  }

  render() {
    return (
      <div className="RecoverPassword">
        <Row>
          <Col xs={ 12 } sm={ 6 } md={ 4 }>
            <h3 className="page-header">Update Password</h3>
            <Alert bsStyle="info">
              Enter your email address below to receive a link to reset your password.
            </Alert>
            <form
              ref={ form => (this.recoverPasswordForm = form) }
              className="recover-password"
              onSubmit={ this.handleSubmit }
            >
              <FormGroup>
                <FormControl
                  type="email"
                  ref="emailAddress"
                  name="emailAddress"
                  placeholder="Email Address"
                />
              </FormGroup>
              <Button type="submit" bsStyle="primary">Send Me</Button>
            </form>
          </Col>
        </Row>
      </div>
    );
  }
}
