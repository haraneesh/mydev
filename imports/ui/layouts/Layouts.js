import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Helmet } from 'react-helmet';
import { Grid } from 'react-bootstrap';
// import DocumentTitle from 'react-document-title';
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

export const OrderLayout = props =>
  // trackPageViews(props.analytics, props.loggedInUserId, props.routeName);
  (
    <div>
      <Helmet>
        <title>{`${props.routeName} | ${Meteor.settings.public.App_Name}`}</title>
      </Helmet>
      <Navigation showEasyNav={false} {...props} />
      <Grid>{props.children}</Grid>
    </div>
  )
;

export const RecipeLayout = props =>
  // trackPageViews(props.analytics, props.loggedInUserId, props.routeName);
  (
    <div>
      <Helmet>
        <style>{'body { background-color: red; }'}</style>
        <title>{`${props.routeName} | ${Meteor.settings.public.App_Name}`}</title>
      </Helmet>
      <Navigation showEasyNav={false} {...props} />
      <Grid>{props.children}</Grid>
    </div>
  )
;

export const MainLayout = props =>
  // trackPageViews(props.analytics, props.loggedInUserId, props.routeName);
  (
    <div>
      <Helmet>
        <title>{`${props.routeName} | ${Meteor.settings.public.App_Name}`}</title>
      </Helmet>
      <Navigation showEasyNav {...props} />
      <Grid>{props.children}</Grid>
    </div>
  )
;

