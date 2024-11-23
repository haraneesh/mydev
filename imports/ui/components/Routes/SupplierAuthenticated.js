import PropTypes from 'prop-types';
import React from 'react';
import { Navigate } from 'react-router-dom';
import constants from '../../../modules/constants';

const SupplierAuthenticated = ({
  layout: Layout,
  authenticated,
  roles,
  component: Component,
  ...rest
}) => {
  if (!(authenticated && roles.indexOf(constants.Roles.supplier.name) !== -1)) {
    return <Navigate to="/login" replace={true} />;
  }

  return (
    <Layout isSupplier authenticated {...rest}>
      <Component authenticated {...rest} roles={roles} />
    </Layout>
  );
};

SupplierAuthenticated.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.oneOfType([
    PropTypes.object.isRequired,
    PropTypes.func.isRequired,
  ]),
  roles: PropTypes.array.isRequired,
  layout: PropTypes.func.isRequired,
};

export default SupplierAuthenticated;
