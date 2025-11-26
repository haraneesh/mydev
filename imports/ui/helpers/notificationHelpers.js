import { Meteor } from 'meteor/meteor';

/**
 * Request notification permission from OneSignal
 * This should be called after showing the pre-permission modal
 * @returns {Promise<boolean>} - True if permission granted, false otherwise
 */
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

/**
 * Check if notification permission has already been granted
 * @returns {boolean}
 */
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
