import { Meteor } from 'meteor/meteor';
import amplitude from 'amplitude-js';
import Security from '../../../modules/both/security';
import Events from './Events';

class analyticsFunctions {
    static analyticsApiKey = Meteor.settings.public.analyticsSettings.amplitude.apiKey;

    static initialize(loggedInUser) {
      if (!Security.checkBoolUserIsAdmin(Meteor.userId())) {
        const userName = loggedInUser.username;
        amplitude.getInstance().init(this.analyticsApiKey, userName);
        amplitude.getInstance().setUserProperties({
          instance: (Meteor.isProduction) ? 'P' : 'D',
        });
      }
    }

    static initializeNotLoggedIn() {
      amplitude.getInstance().init(this.analyticsApiKey, null, { includeReferrer: true });
      amplitude.getInstance().setUserProperties({
        instance: (Meteor.isProduction) ? 'P' : 'D',
      });
    }

    static logEventNotLoggedIn({ event, eventProperties }) {
      const eventName = (Meteor.isProduction) ? event : `Dev_${event}`;
      if (eventProperties) {
        amplitude.getInstance().logEvent(eventName, eventProperties);
      } else {
        amplitude.getInstance().logEvent(eventName);
      }
    }

    static logEvent({ event, eventProperties }) {
      const userId = Meteor.userId();
      const eventName = (Meteor.isProduction) ? event : `Dev_${event}`;
      if (!Security.checkBoolUserIsAdmin(userId)) {
        if (eventProperties) {
          amplitude.getInstance().logEvent(eventName, eventProperties);
        } else {
          amplitude.getInstance().logEvent(eventName);
        }
      }
    }
}

const SuvaiAnalytics = {
  analyticsFunctions,
  Events,
};

export default SuvaiAnalytics;
