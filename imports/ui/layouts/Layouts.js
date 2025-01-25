import { Meteor } from 'meteor/meteor';
import React from 'react';
import Container from 'react-bootstrap/Container';
import { Helmet } from 'react-helmet';
import { ThemeProvider } from 'styled-components';
import RouteNames from '../apps/RouteNames';
import SuvaiAnalytics from '../components/Analytics/SuvaiAnalytics';
import Navigation from '../components/Navigation/Navigation';
import ToolBar from '../components/ToolBar/ToolBar';
import useFacebookPixel from './facebookPixelHook';

const trackPageViews = ({ loggedInUser, routeName, match }) => {
  if (Meteor.isProduction) {
    //Add facebook pixel tracker
    useFacebookPixel(Meteor.settings.public.analyticsSettings.facebookPixel.pixelId);
    switch (true) {
      case !!loggedInUser:
        SuvaiAnalytics.analyticsFunctions.initialize(loggedInUser);

        SuvaiAnalytics.analyticsFunctions.logEvent({
          event: routeName,
          eventProperties: {
            routeName,
          },
        });
        break;
      case !loggedInUser && routeName === RouteNames.ADINTEREST: {
        const adType = match.params.adType ? match.params.adType : null;
        const eventName =
          adType && SuvaiAnalytics.Events[adType]
            ? SuvaiAnalytics.Events[adType]
            : SuvaiAnalytics.Events.ADREFERRAL_PAGE;

        SuvaiAnalytics.analyticsFunctions.initializeNotLoggedIn();
        SuvaiAnalytics.analyticsFunctions.logEventNotLoggedIn({
          event: eventName,
          eventProperties: {
            routeName,
            params: match.params,
          },
        });
        break;
      }
      case !loggedInUser && routeName === RouteNames.SIGNUP: {
        SuvaiAnalytics.analyticsFunctions.initializeNotLoggedIn();
        SuvaiAnalytics.analyticsFunctions.logEventNotLoggedIn({
          event: routeName,
          eventProperties: {
            routeName,
            params: match.params,
          },
        });
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
        <title>{`${props.routeName.replace(/_/g, ' ')} | ${Meteor.settings.public.App_Name}`}</title>
      </Helmet>
      <Navigation showEasyNav={false} {...props} />
      <Container fluid="true">{props.children}</Container>
      <ToolBar {...props} />
    </div>
  );
};

export const RecipeLayout = (props) => {
  trackPageViews(props.loggedInUserId, props.routeName);
  return (
    <div>
      <Helmet>
        <title>{`${props.routeName.replace(/_/g, ' ')} | ${Meteor.settings.public.App_Name}`}</title>
      </Helmet>
      <ThemeProvider theme={{}}>
        <Navigation showEasyNav={false} {...props} />
        <Container fluid="true" className="recipesApp">
          {props.children}
        </Container>
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
        <title>{`${props.routeName.replace(/_/g, ' ')} | ${Meteor.settings.public.App_Name}`}</title>
      </Helmet>
      <Navigation showEasyNav {...props} />
      <Container fluid="true">{props.children}</Container>
      <ToolBar {...props} />
    </div>
  );
};

export const SupplierLayout = (props) => {
  trackPageViews(props);
  return (
    <div>
      <Helmet>
        <title>{`${props.routeName.replace(/_/g, ' ')} | ${Meteor.settings.public.App_Name}`}</title>
      </Helmet>
      <ThemeProvider theme={{}}>
        <Navigation showEasyNav={false} {...props} />
        <Container className="supplierApp">{props.children}</Container>
      </ThemeProvider>
    </div>
  );
};
