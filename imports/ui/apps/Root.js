import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';
import { BrowserRouter } from 'react-router-dom';

import { Roles } from 'meteor/alanning:roles';
import { withTracker } from 'meteor/react-meteor-data';
import Loading from '../components/Loading/Loading';
import App from './App';

const getUserName = (name) =>
  ({
    string: name,
    object: `${name.first} ${name.last}`,
  })[typeof name];

function RootWithRouter(props) {
  // Scroll to top if path changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <App {...props} />;
}

RootWithRouter.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
};

function Root(props) {
  if (props.loading) {
    return <Loading />;
  }

  return (
    <React.StrictMode>
      <BrowserRouter>
        <RootWithRouter {...props} />
      </BrowserRouter>
    </React.StrictMode>
  );
}

export default withTracker(() => {
  const loggingIn = Meteor.loggingIn();
  const userSubscription = Meteor.subscribe('users.userData'); // Meteor.user();
  const rolesSubscription = Meteor.subscribe('users.getRoles');
  const loading = !rolesSubscription.ready() || !userSubscription.ready();

  const user = Meteor.user();
  const userId = Meteor.userId();

  const name =
    user && user.profile && user.profile.name && getUserName(user.profile.name);
  const emailAddress = user && user.emails && user.emails[0].address;
  const emailVerified = user && user.emails && user.emails[0].verified;
  const productReturnables = user && user.productReturnables;
  const userSettings = user && user.settings;
  const globalStatuses = user && user.globalStatuses;

  return {
    loading,
    loggingIn,
    authenticated: !loggingIn && !!userId,
    productReturnables,
    name,
    emailAddress,
    emailVerified,
    date: new Date(),
    loggedInUserId: userId,
    loggedInUser: user,
    roles: !loading && Roles.getRolesForUser(userId),
    userSettings,
    globalStatuses,
  };
})(Root);
