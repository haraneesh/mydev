import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

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
);

NotAuthenticated.propTypes = {
  routeName: PropTypes.string.isRequired,
  loggingIn: PropTypes.bool.isRequired,
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
  layout: PropTypes.node.isRequired,
};

export default NotAuthenticated;
