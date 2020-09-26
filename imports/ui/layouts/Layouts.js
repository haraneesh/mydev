import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Helmet } from 'react-helmet';
import { ThemeProvider } from 'styled-components';
import { Grid } from 'react-bootstrap';
// import DocumentTitle from 'react-document-title';
import Navigation from '../components/Navigation/Navigation';
import ToolBar from '../components/ToolBar/ToolBar';
import GlobalStyle from './GlobalStyle';

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

export const OrderLayout = (props) =>
  // trackPageViews(props.analytics, props.loggedInUserId, props.routeName);
  (
    <div>
      <Helmet>
        <title>{`${props.routeName} | ${Meteor.settings.public.App_Name}`}</title>
      </Helmet>
      <Navigation showEasyNav={false} {...props} />
      <Grid>{props.children}</Grid>
      <ToolBar {...props} />
    </div>
  );
export const RecipeLayout = (props) =>
  // trackPageViews(props.analytics, props.loggedInUserId, props.routeName);
  (
    <div>
      <Helmet>
        <title>{`${props.routeName} | ${Meteor.settings.public.App_Name}`}</title>
      </Helmet>
      <ThemeProvider theme={{}}>
        <GlobalStyle />
        <Navigation showEasyNav={false} {...props} />
        <Grid className="recipesApp">{props.children}</Grid>
      </ThemeProvider>
      <ToolBar {...props} />
    </div>
  );

export const MainLayout = (props) =>
  // trackPageViews(props.analytics, props.loggedInUserId, props.routeName);
  (
    <div>
      <Helmet>
        <title>{`${props.routeName} | ${Meteor.settings.public.App_Name}`}</title>
      </Helmet>
      <Navigation showEasyNav {...props} />
      <Grid>{props.children}</Grid>
      <ToolBar {...props} />
    </div>
  );

export const SupplierLayout = (props) => (
  <div>
    <Helmet>
      <title>{`${props.routeName} | ${Meteor.settings.public.App_Name}`}</title>
    </Helmet>
    <ThemeProvider theme={{}}>
      <GlobalStyle />
      <Navigation showEasyNav={false} {...props} />
      <Grid className="supplierApp">{props.children}</Grid>
    </ThemeProvider>
  </div>
);
