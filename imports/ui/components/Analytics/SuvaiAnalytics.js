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

    static logEvent({ event, eventProperties }) {
      const userId = Meteor.userId();
      if (!Security.checkBoolUserIsAdmin(userId)) {
        if (eventProperties) {
          amplitude.getInstance().logEvent(event, eventProperties);
          console.log(this.analyticsApiKey);
        } else {
          amplitude.getInstance().logEvent(event);
        }
      }
    }
}

const SuvaiAnalytics = {
  analyticsFunctions,
  Events,
};

export default SuvaiAnalytics;
