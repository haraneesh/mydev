import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';
import constants from '../../../modules/constants';

const SupplierAuthenticated = ({
  layout: Layout, authenticated, roles, component: Component, ...rest
}) => (
  <Route
    {...rest}
    render={(props) => (
      authenticated && roles.indexOf(constants.Roles.supplier.name) !== -1
        ? (
          <Layout
            {...props}
            isSupplier
            authenticated
            {...rest}
          >
            <Component {...props} authenticated {...rest} roles={roles} />
          </Layout>
        )
        : (<Redirect to="/about" />)
    )}
  />
);

SupplierAuthenticated.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
  roles: PropTypes.array.isRequired,
  layout: PropTypes.node.isRequired,
};

export default SupplierAuthenticated;
