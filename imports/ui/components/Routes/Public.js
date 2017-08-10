import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Route } from 'react-router-dom';
import DocumentTitle from 'react-document-title';

const Public = (args) =>{
  const { routeName, component, ...rest } = args;
  return (
  <Route
    {...rest}
    render={props => (<DocumentTitle title={`${routeName} | ${Meteor.settings.public.App_Name}`}>{
      (React.createElement(component, { ...props, ...rest }))
      }
    </DocumentTitle>)}
  />
);
}

Public.propTypes = {
  routeName: PropTypes.string.isRequired,
  component: PropTypes.func.isRequired,
};

export default Public;
