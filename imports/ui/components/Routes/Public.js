import React from 'react';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

const Public = (args) => {
  const { layout: Layout, component, ...rest } = args;
  return (
    <Route
      {...rest}
      render={props => (
        <Layout {...props} {...rest} > {(React.createElement(component, { ...props, ...rest }))} </Layout>)
      }
    />
  );
};

Public.propTypes = {
  routeName: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired,
};

export default Public;
