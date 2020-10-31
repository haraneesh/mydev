import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Alert } from 'react-bootstrap';
import { Accounts } from 'meteor/accounts-base';
import { toast } from 'react-toastify';

class VerifyEmail extends React.Component {
  state = { error: null };

  componentDidMount() {
    const { match, history } = this.props;
    Accounts.verifyEmail(match.params.token, (error) => {
      if (error) {
        // toast.error(error.reason);
        this.setState({ error: `${error.reason}.` });
        setTimeout(() => {
          history.push('/profile');
        }, 5500);
      } else {
        setTimeout(() => {
          toast.success('All set, thanks!');
          history.push('/profile');
        }, 1500);
      }
    });
  }

  render() {
    const { error } = this.state;
    return (
      <div className="verifyEmail">
        <Row>
          <Col xs={12} sm={6} md={4}>
            <h3 className="page-header">Verifying Email Address</h3>
            <div className="VerifyEmail">
              <Alert bsStyle={!error ? 'info' : 'danger'}>
                {!error
                  ? 'Verifying...'
                  : (
                    <div>
                      {' '}
                      {`${error} You will be redirected automatically.`}
                      <br />
                      {' '}
                      <p> Please try again. </p>
                    </div>
                  )}
              </Alert>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

VerifyEmail.propTypes = {
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default VerifyEmail;
