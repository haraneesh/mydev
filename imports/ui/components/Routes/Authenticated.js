import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import Loading from '/imports/ui/components/Loading/Loading';

/*
const Authenticated = ({ layout: Layout, roles, authenticated, component, ...rest }) => (
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
        {(React.createElement(component, { ...props, authenticated, ...rest }))}
      </Layout>)
      :
      (<Redirect to="/login" />)
    )}
  />
);
*/

const Authenticated = ({
  layout: Layout,
  roles,
  authenticated,
  component: Component,
  ...rest
}) => {
  if (!authenticated) {
    return <Navigate to="/login" replace={true} />;
  }

  const location = useLocation();
  const params = useParams();
  const match = { url: location.pathname, params: params };

  return (
    <Layout
      isAdmin={roles.indexOf('admin') !== -1}
      authenticated
      {...rest}
      match={match}
    >
      <Suspense fallback={<Loading />}>
        <Component authenticated {...rest} roles={roles} match={match} />
      </Suspense>
    </Layout>
  );
};

Authenticated.propTypes = {
  routeName: PropTypes.string.isRequired,
  roles: PropTypes.array.isRequired,
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.oneOfType([
    PropTypes.object.isRequired,
    PropTypes.func.isRequired,
  ]),
  layout: PropTypes.func.isRequired,
};

export default Authenticated;
