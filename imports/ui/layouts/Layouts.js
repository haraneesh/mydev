import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Helmet } from 'react-helmet';
import { ThemeProvider } from 'styled-components';
import { Grid } from 'react-bootstrap';
import Navigation from '../components/Navigation/Navigation';
import ToolBar from '../components/ToolBar/ToolBar';
import SuvaiAnalytics from '../components/Analytics/SuvaiAnalytics';
import GlobalStyle from './GlobalStyle';

const trackPageViews = ({ loggedInUser, loggedInUserId, routeName }) => {
  if (Meteor.isProduction && loggedInUserId) {
    SuvaiAnalytics.analyticsFunctions.initialize(loggedInUser, loggedInUserId);
    SuvaiAnalytics.analyticsFunctions.logEvent(
      {
        event: SuvaiAnalytics.Events.NAVIGATE_PAGE,
        eventProperties: {
          routeName,
        },
      },
    );
  }
};

export const OrderLayout = (props) => {
  trackPageViews(props);
  return (
    <div>
      <Helmet>
        <title>{`${props.routeName} | ${Meteor.settings.public.App_Name}`}</title>
      </Helmet>
      <Navigation showEasyNav={false} {...props} />
      <Grid>{props.children}</Grid>
      <ToolBar {...props} />
    </div>
  );
};

export const RecipeLayout = (props) => {
  trackPageViews(props.loggedInUserId, props.routeName);
  return (
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
};

export const MainLayout = (props) => {
  trackPageViews(props);
  return (
    <div>
      <Helmet>
        <title>{`${props.routeName} | ${Meteor.settings.public.App_Name}`}</title>
      </Helmet>
      <Navigation showEasyNav {...props} />
      <Grid>{props.children}</Grid>
      <ToolBar {...props} />
    </div>
  );
};

export const SupplierLayout = (props) => {
  trackPageViews(props);
  return (
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
};
