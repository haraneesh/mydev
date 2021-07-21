import { Meteor } from 'meteor/meteor';
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  BrowserRouter, useHistory,
} from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import Security from '../../modules/both/security';
import App from './App';
import SupplierApp from './SupplierApp';
import Loading from '../components/Loading/Loading';

const getUserName = (name) => ({
  string: name,
  object: `${name.first} ${name.last}`,
}[typeof name]);

const RootWithRouter = (props) => {
  const history = useHistory();
  const currentRoute = useRef();
  const { loggedInUserId } = props;

  useEffect(() => {
    history.listen((location) => {
      if (location.pathname === '/messages'
      || currentRoute.current === '/messages'
      || location.pathname === '/messagesadmin'
      || currentRoute.current === '/messagesadmin'
      ) {
        Meteor.call('messages.updateLastVisitedDate');
      }
    });
  }, [history]);

  switch (true) {
    case loggedInUserId && Security.checkBoolUserIsSupplier(loggedInUserId):
      return (<SupplierApp {...props} />);
    default:
      return (<App {...props} />);
  }
};

RootWithRouter.propTypes = {
  loggedInUserId: PropTypes.string.isRequired,
};

const Root = (props) => {
  if (props.loading) {
    return (<Loading />);
  }

  return (
    <BrowserRouter>
      <RootWithRouter {...props} />
    </BrowserRouter>
  );
};

export default withTracker(() => {
  const loggingIn = Meteor.loggingIn();
  const userSubscription = Meteor.subscribe('users.userData'); // Meteor.user();
  const rolesSubscription = Meteor.subscribe('users.getRoles');
  const loading = !rolesSubscription.ready() || !userSubscription.ready();

  const user = Meteor.user();
  const userId = Meteor.userId();

  const name = user && user.profile && user.profile.name && getUserName(user.profile.name);
  const emailAddress = user && user.emails && user.emails[0].address;
  const emailVerified = user && user.emails && user.emails[0].verified;
  const userSettings = user && user.settings;
  const globalStatuses = user && user.globalStatuses;

  return {
    loading,
    loggingIn,
    authenticated: !loggingIn && !!userId,
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
