import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';


/*
const AdminAuthenticated = ({ routeName, loggingIn, authenticated, roles, component, ...rest }) => (
  <Route
    {...rest}
    render={props => (
      authenticated && roles.indexOf('admin') !== -1 ?
      (<DocumentTitle title={`${routeName} | ${Meteor.settings.public.App_Name}`}>{
      (React.createElement(component, { ...props, loggingIn, authenticated, ...rest }))
      }
      </DocumentTitle>) :
      (<Redirect to="/about" />)
    )}
  />
); */

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

AdminAuthenticated.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  component: PropTypes.func.isRequired,
  roles: PropTypes.array.isRequired,
  layout: PropTypes.node.isRequired,
};

export default AdminAuthenticated;
