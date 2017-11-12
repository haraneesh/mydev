import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Grid } from 'react-bootstrap';
import DocumentTitle from 'react-document-title';
import Navigation from '../components/Navigation/Navigation';

export const OrderLayout = props => (
  <div>
    <Navigation showEasyNav={false} {...props} />
    <DocumentTitle title={`${props.routeName} | ${Meteor.settings.public.App_Name}`}>
      <Grid>{props.children}</Grid>
    </DocumentTitle>
  </div>
);

export const MainLayout = props => (
  <div>
    <Navigation showEasyNav {...props} />
    <DocumentTitle title={`${props.routeName} | ${Meteor.settings.public.App_Name}`}>
      <Grid>{props.children}</Grid>
    </DocumentTitle>
  </div>
);

