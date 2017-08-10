import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Route, Redirect } from 'react-router-dom';
import DocumentTitle from 'react-document-title';

const AdminAuthenticated = ({ routeName, loggingIn, authenticated, roles, component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      authenticated && roles.indexOf('admin') !== -1 ?
      (<DocumentTitle title={`${routeName} | ${Meteor.settings.public.App_Name}`}>{
      (React.createElement(component, { ...props, loggingIn, authenticated, ...rest }))
      }
      </DocumentTitle>) :
      (<Redirect to="/about" />)
    )}
  />
);

AdminAuthenticated.propTypes = {
  routeName: PropTypes.string.isRequired,
  loggingIn: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
  roles: PropTypes.array.isRequired,
};

export default AdminAuthenticated;
