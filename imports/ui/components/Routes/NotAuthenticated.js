import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import Loading from '/imports/ui/components/Loading/Loading';

/*
const NotAuthenticated = ({ layout: Layout, authenticated, component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      !authenticated ?
      (<Layout {...props} authenticated={false} {...rest} > {(React.createElement(component, { ...props, authenticated, ...rest }))} </Layout>)
      :
      (<Redirect to="/" />)
    )}
  />
); */

const NotAuthenticated = ({
  layout: Layout,
  authenticated,
  component: Component,
  ...rest
}) => {
  if (authenticated) {
    return <Navigate to="/" replace={true} />;
  }

  const location = useLocation();
  const params = useParams();
  const match = { url: location.pathname, params: params };

  return (
    <Layout authenticated={false} {...rest} match={match}>
      <Suspense fallback={<Loading />}>
        <Component authenticated={false} {...rest} match={match} />
      </Suspense>
    </Layout>
  );
};

NotAuthenticated.propTypes = {
  routeName: PropTypes.string.isRequired,
  loggingIn: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.oneOfType([
    PropTypes.object.isRequired,
    PropTypes.func.isRequired,
  ]),
  layout: PropTypes.func.isRequired,
};

export default NotAuthenticated;
