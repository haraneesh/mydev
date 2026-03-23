import { Meteor } from 'meteor/meteor';

/**
 * OneSignal integration is disabled, so we no longer request permissions from the SDK.
 * Return true immediately to keep the checkout flow unblocked.
 */
export const requestNotificationPermission = async () => {
  console.log('OneSignal disabled; skipping OS-level notification permission request');
  return true;
};

/**
 * With OneSignal disabled, treat notifications as enabled (especially on web) to avoid blocking users.
 */
export const hasNotificationPermission = () => {
  if (!Meteor.isCordova) {
    return true;
  }

  console.log('OneSignal disabled; assuming notification permissions granted on Cordova');
  return true;
};

/*
// Previous OneSignal-based implementation kept for reference while the integration is turned off.
export const requestNotificationPermission = () => {
  return new Promise((resolve, reject) => {
    if (!Meteor.isCordova) {
      console.log('Not a Cordova app, skipping notification permission request');
      resolve(false);
      return;
    }

    if (!window.plugins?.OneSignal) {
      console.error('OneSignal not available');
      reject(new Error('OneSignal not initialized'));
      return;
    }

    window.plugins.OneSignal.Notifications.requestPermission(true)
      .then((accepted) => {
        console.log('Notification permission request result:', accepted);
        if (accepted) {
          console.log('Notification permissions granted!');
          resolve(true);
        } else {
          console.warn('Notification permissions denied');
          resolve(false);
        }
      })
      .catch((error) => {
        console.error('Error requesting notification permission:', error);
        reject(error);
      });
  });
};

export const hasNotificationPermission = () => {
  if (!Meteor.isCordova) {
    return true; // Web users don't need this
  }

  if (!window.plugins?.OneSignal) {
    return false;
  }

  try {
    return window.plugins.OneSignal.Notifications.hasPermission();
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
};
*/
