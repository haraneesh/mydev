import PropTypes from 'prop-types';
import React, { Suspense } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import Loading from '/imports/ui/components/Loading/Loading';

const Public = (args) => {
  const { layout: Layout, component: Component, roles } = args;

  const isAdmin = roles.indexOf('admin') !== -1;

  const location = useLocation();
  const params = useParams();
  const match = { url: location.pathname, params: params };

  return (
    <Layout isAdmin={isAdmin} {...args} match={match}>
      <Suspense fallback={<Loading />}>
        <Component {...args} match={match} />
      </Suspense>
    </Layout>
  );
};

Public.propTypes = {
  routeName: PropTypes.string.isRequired,
  component: PropTypes.oneOfType([
    PropTypes.object.isRequired,
    PropTypes.func.isRequired,
  ]),
  layout: PropTypes.func.isRequired,
};

export default Public;
