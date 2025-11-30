import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { isVersionOutdated } from '../../utils/versionUtils';

Meteor.methods({
  /**
   * Checks if the app version is outdated.
   * @param {string} clientVersion - The current version of the client app
   * @param {string} platform - The platform (android/ios)
   */
  checkAppVersion(clientVersion, platform) {
    check(clientVersion, String);
    check(platform, String);

    const minVersion = Meteor.settings.public.minRequiredAppVersion || '1.0.0';
    const updateRequired = isVersionOutdated(clientVersion, minVersion);
    
    // Get store URL based on platform
    const appStoreUrls = Meteor.settings.public.appStoreUrls || {};
    const storeUrl = appStoreUrls[platform.toLowerCase()] || '';

    return {
      updateRequired,
      minVersion,
      currentVersion: clientVersion,
      storeUrl
    };
  }
});
