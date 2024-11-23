import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import Loading from '/imports/ui/components/Loading/Loading';

const AdminAuthenticated = ({
  layout: Layout,
  authenticated,
  roles,
  component: Component,
  ...rest
}) => {
  if (!(authenticated && roles.indexOf('admin') !== -1)) {
    return <Navigate to="/login" replace={true} />;
  }

  const location = useLocation();
  const params = useParams();
  const match = { url: location.pathname, params: params };

  return (
    <Layout isAdmin authenticated {...rest} match={match}>
      <Suspense fallback={<Loading />}>
        <Component authenticated {...rest} roles={roles} match={match} />
      </Suspense>
    </Layout>
  );
};

AdminAuthenticated.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.oneOfType([
    PropTypes.object.isRequired,
    PropTypes.func.isRequired,
  ]),
  roles: PropTypes.array.isRequired,
  layout: PropTypes.func.isRequired,
};

export default AdminAuthenticated;
