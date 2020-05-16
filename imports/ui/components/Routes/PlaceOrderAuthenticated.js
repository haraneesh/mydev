import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

const PlaceOrderAuthenticated = ({ layout: Layout, roles, authenticated, component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      authenticated ?
        (<Layout
          {...props}
          isAdmin={roles.indexOf('admin') !== -1}
          authenticated
          {...rest}
        >
          <Component {...props} authenticated {...rest} roles={roles} />
        </Layout>)
        :
        (<Redirect to="/login" />)
    )}
  />
);

PlaceOrderAuthenticated.propTypes = {
  routeName: PropTypes.string.isRequired,
  roles: PropTypes.array.isRequired,
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
  layout: PropTypes.node.isRequired,
};

export default PlaceOrderAuthenticated;
