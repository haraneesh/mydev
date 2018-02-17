import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Grid } from 'react-bootstrap';
import DocumentTitle from 'react-document-title';
import Navigation from '../components/Navigation/Navigation';

const trackPageViews = (analytics, userId, pageName) => {
  if (Meteor.isProduction && analytics && userId) {
    analytics.page({
      type: 'page',
      userId,
      name: pageName,
      properties: {
        title: pageName,
      },
    });
  }
};

export const OrderLayout = (props) => {
  trackPageViews(props.analytics, props.loggedInUserId, props.routeName);
  return (
    <div>
      <Navigation showEasyNav={false} {...props} />
      <DocumentTitle title={`${props.routeName} | ${Meteor.settings.public.App_Name}`}>
        <Grid>{props.children}</Grid>
      </DocumentTitle>
    </div>
  );
};

export const MainLayout = (props) => {
  trackPageViews(props.analytics, props.loggedInUserId, props.routeName);
  return (
    <div>
      <Navigation showEasyNav {...props} />
      <DocumentTitle title={`${props.routeName} | ${Meteor.settings.public.App_Name}`}>
        <Grid>{props.children}</Grid>
      </DocumentTitle>
    </div>
  );
};

