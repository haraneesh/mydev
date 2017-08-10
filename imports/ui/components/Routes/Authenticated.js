import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Route, Redirect } from 'react-router-dom';
import DocumentTitle from 'react-document-title';

const Authenticated = ({ routeName, loggingIn, authenticated, component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      authenticated ?
      (<DocumentTitle title={`${routeName} | ${Meteor.settings.public.App_Name}`}>{
      (React.createElement(component, { ...props, loggingIn, authenticated, ...rest }))
      }
      </DocumentTitle>) :
      (<Redirect to="/about" />)
    )}
  />
);

Authenticated.propTypes = {
  routeName: PropTypes.string.isRequired,
  loggingIn: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
};

export default Authenticated;
