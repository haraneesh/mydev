import PropTypes from 'prop-types';
import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';

function VerifyEmailAlert({ loggedInUserId, emailVerified, emailAddress }) {
  const navigate = useNavigate();

  return loggedInUserId && !emailVerified ? (
    <Alert
      className="verify-email text-center"
      style={{
        color: '#3a2d29',
        margin: '0px',
        padding: '10px 5px',
        borderBottom: '5px solid #FF6D00',
        borderLeftWidth: '0px',
        textAlign: 'center',
      }}
    >
      <p>
        {'Hey! Is this '}
        <strong>your email address</strong>
        {` (${emailAddress}) `}? &nbsp;
        <Button
          className="btn-sm btn-primary"
          onClick={() => navigate('/profile')}
          href="#"
        >
          Verify Now
        </Button>
      </p>
    </Alert>
  ) : null;
}

VerifyEmailAlert.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
  emailVerified: PropTypes.bool.isRequired,
  emailAddress: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default VerifyEmailAlert;
