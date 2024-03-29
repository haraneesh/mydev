import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { toast } from 'react-toastify';
import Icon from '../Icon/Icon';

import './OAuthLoginButton.scss';

const handleLogin = (service, callback) => {
  const options = {
    facebook: {
      requestPermissions: ['email'],
      loginStyle: 'popup',
    },
    github: {
      requestPermissions: ['user:email'],
      loginStyle: 'popup',
    },
    google: {
      requestPermissions: ['email'],
      requestOfflineToken: true,
      loginStyle: 'popup',
    },
  }[service];

  return {
    facebook: Meteor.loginWithFacebook,
    github: Meteor.loginWithGithub,
    google: Meteor.loginWithGoogle,
  }[service](options, callback);
};

const serviceLabel = {
  facebook: <span>
    <Icon icon="facebook-official" />
    {' '}
    Sign in with Facebook
  </span>,
  // github: <span><Icon icon="github" /> Sign in with GitHub</span>,
  // google: <span><Icon icon="google" /> Sign in with Google</span>,
};

const OAuthLoginButton = ({ service, callback }) => (
  <button
    className={`OAuthLoginButton OAuthLoginButton-${service}`}
    type="button"
    onClick={() => handleLogin(service, callback)}
  >
    {serviceLabel[service]}
  </button>
);

OAuthLoginButton.defaultProps = {
  callback: (error) => {
    if (error) {
      toast.error(error.message);
    }
  },
};

OAuthLoginButton.propTypes = {
  service: PropTypes.string.isRequired,
  callback: PropTypes.func,
};

export default OAuthLoginButton;
