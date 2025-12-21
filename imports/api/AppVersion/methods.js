import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { isVersionOutdated } from '../../utils/versionUtils';

Meteor.methods({
  /**
   * Checks if the app version is outdated.
   * @param {string} clientVersion - The current version of the client app
   * @param {string} platform - The platform (android/ios)
   */
  checkAppVersion(clientVersion, platform, nativeVersion) {
    check(clientVersion, String);
    check(platform, String);
    check(nativeVersion, Match.Maybe(String));

    const minVersion = (Meteor.settings && Meteor.settings.public && Meteor.settings.public.minRequiredAppVersion) || '1.0.0';
    const minNativeVersion = (Meteor.settings && Meteor.settings.public && Meteor.settings.public.minRequiredNativeVersion) || '0.0.0';
    
    // Check Native Version (Store Update)
    let nativeUpdateRequired = false;
    if (nativeVersion) {
      nativeUpdateRequired = isVersionOutdated(nativeVersion, minNativeVersion);
    }

    // Check Code Version (Hot Code Push)
    // Only require code update if native update is NOT required (priority to native)
    let codeUpdateRequired = false;
    if (!nativeUpdateRequired) {
      codeUpdateRequired = isVersionOutdated(clientVersion, minVersion);
    }
    
    // Get store URL based on platform
    const appStoreUrls = (Meteor.settings && Meteor.settings.public && Meteor.settings.public.appStoreUrls) || {};
    const storeUrl = appStoreUrls[platform.toLowerCase()] || '';

    return {
      updateRequired: nativeUpdateRequired || codeUpdateRequired, // General flag for backward compatibility
      nativeUpdateRequired,
      codeUpdateRequired,
      minVersion,
      minNativeVersion,
      currentVersion: clientVersion,
      currentNativeVersion: nativeVersion,
      storeUrl
    };
  }
});
