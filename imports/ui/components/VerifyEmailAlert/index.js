import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Button } from 'react-bootstrap';
import { withRouter } from 'react-router';

const handleResendVerificationEmail = (history) => {
  // sendVerificationEmail();
  // toast.success(`Check ${emailAddress} for a verification link!`);
  history.push('/profile');
};

const VerifyEmailAlert = ({
  loggedInUserId, emailVerified, emailAddress, history,
}) => (loggedInUserId && !emailVerified ? (

  <Alert
    className="verify-email text-center"
    style={{
      color: '#3a2d29', margin: '0px', padding: '10px 5px', borderBottom: '5px solid #FF6D00', borderLeftWidth: '0px', textAlign: 'center',
    }}
  >
    <p>
      {'Hey! Is this '}
      <strong>your email address</strong>
      {` (${emailAddress}) `}
      ? &nbsp;
      <Button
        className="btn-sm btn-primary"
        onClick={() => handleResendVerificationEmail(history)}
        href="#"
      >
        Verify Now
      </Button>
    </p>
  </Alert>

) : null);

VerifyEmailAlert.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  emailVerified: PropTypes.bool.isRequired,
  emailAddress: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(VerifyEmailAlert);
