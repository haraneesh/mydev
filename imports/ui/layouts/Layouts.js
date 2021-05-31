import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Helmet } from 'react-helmet';
import { ThemeProvider } from 'styled-components';
import { Grid } from 'react-bootstrap';
import Navigation from '../components/Navigation/Navigation';
import ToolBar from '../components/ToolBar/ToolBar';
import SuvaiAnalytics from '../components/Analytics/SuvaiAnalytics';
import RouteNames from '../apps/RouteNames';
import GlobalStyle from './GlobalStyle';

const trackPageViews = ({
  loggedInUser, routeName, match,
}) => {
  if (Meteor.isProduction) {
    switch (true) {
      case !!loggedInUser:
        SuvaiAnalytics.analyticsFunctions.initialize(loggedInUser);
        SuvaiAnalytics.analyticsFunctions.logEvent(
          {
            event: SuvaiAnalytics.Events.NAVIGATE_PAGE,
            eventProperties: {
              routeName,
            },
          },
        );
        break;
      case (!loggedInUser && routeName === RouteNames.ADINTEREST): {
        const adType = (match.params.adType) ? match.params.adType : null;
        const eventName = (adType && SuvaiAnalytics.Events[adType])
          ? SuvaiAnalytics.Events[adType]
          : SuvaiAnalytics.Events.ADREFERRAL_PAGE;

        SuvaiAnalytics.analyticsFunctions.initializeNotLoggedIn();
        SuvaiAnalytics.analyticsFunctions.logEventNotLoggedIn(
          {
            event: eventName,
            eventProperties: {
              routeName,
              params: match.params,
            },
          },
        );
        break;
      }
      case (!loggedInUser && routeName === RouteNames.SIGNUP): {
        SuvaiAnalytics.analyticsFunctions.initializeNotLoggedIn();
        SuvaiAnalytics.analyticsFunctions.logEventNotLoggedIn(
          {
            event: SuvaiAnalytics.Events.NAVIGATE_SIGNUP_PAGE,
            eventProperties: {
              routeName,
              params: match.params,
            },
          },
        );
        break;
      }
      default:
        break;
    }
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
      <Grid fluid="true">{props.children}</Grid>
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
        <Grid fluid="true" className="recipesApp">{props.children}</Grid>
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
      <Grid fluid="true">{props.children}</Grid>
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
