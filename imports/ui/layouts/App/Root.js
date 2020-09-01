import { Meteor } from 'meteor/meteor';
import React, { useEffect, useRef } from 'react';
import {
  BrowserRouter as Router, useHistory,
} from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { Roles } from 'meteor/alanning:roles';
import Analytics from 'analytics-node';
import App from './App';

const analytics = new Analytics(Meteor.settings.public.analyticsSettings.segmentIo.writeKey);

const getUserName = (name) => ({
  string: name,
  object: `${name.first} ${name.last}`,
}[typeof name]);

const RootWithRouter = (props) => {
  const history = useHistory();
  const currentRoute = useRef();

  useEffect(() => {
    history.listen((location) => {
      if (location.pathname === '/messages'
      || currentRoute.current === '/messages'
      || location.pathname === '/messagesadmin'
      || currentRoute.current === '/messagesadmin'
      ) {
        Meteor.call('messages.updateLastVisitedDate');
      }
      currentRoute.current = location.pathname;
    });
  }, [history]);

  return (<App {...props} />);
};

const Root = (props) => (
  <Router>
    <RootWithRouter {...props} />
  </Router>
);

export default withTracker(() => {
  const loggingIn = Meteor.loggingIn();
  const userSubscription = Meteor.subscribe('users.userData'); // Meteor.user();
  const loading = !Roles.subscription.ready() || !userSubscription.ready();

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
    roles: !loading && Roles.getRolesForUser(userId),
    loggedInUserId: userId,
    loggedInUser: user,
    userSettings,
    globalStatuses,
    analytics,
  };
})(Root);
