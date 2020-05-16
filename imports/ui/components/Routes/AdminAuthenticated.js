import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

/*
const AdminAuthenticated = ({ layout: Layout, authenticated, roles, component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      authenticated && roles.indexOf('admin') !== -1 ?
      (<Layout
        {...props}
        isAdmin
        authenticated
        {...rest}
        >
        {(React.createElement(component, { ...props, authenticated, ...rest }))}
        </Layout>)
      :
      (<Redirect to="/about" />)
    )}
  />
);
*/

const AdminAuthenticated = ({ layout: Layout, authenticated, roles, component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      authenticated && roles.indexOf('admin') !== -1 ?
        (<Layout
          {...props}
          isAdmin
          authenticated
          {...rest}
        >
          <Component {...props} authenticated {...rest} roles={roles} />
        </Layout>)
        :
        (<Redirect to="/about" />)
    )}
  />
);

AdminAuthenticated.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
  roles: PropTypes.array.isRequired,
  layout: PropTypes.node.isRequired,
};

export default AdminAuthenticated;
