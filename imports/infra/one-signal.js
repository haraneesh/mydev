// TODO mobile add accounts
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

let currentPlayerId = null;

const methodCall = (methodName, ...args) =>
  new Promise((resolve, reject) => {
    Meteor.call(methodName, ...args, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });

export const addPlayerId = (playerId, deviceType = 'unknown') => {
  if (!playerId) {
    console.warn('Cannot add player ID: playerId is empty');
    return;
  }

  methodCall('addPlayerId', {
    playerId,
    deviceType,
  })
    .then(() => {
      console.log(`Player ID ${playerId} registered successfully`);
    })
    .catch((e) => {
      console.error(`Error adding player id ${playerId}`, e);
    });
};

const goTo = (route) => {
  const navigateTo = `${!route.startsWith('/') ? '/' : ''}${route}`;
  console.debug(`navigateTo ${navigateTo}`);
  history.push(navigateTo);
};

Meteor.startup(() => {
  Accounts.onLogin((data) => {
    console.log('onLogin', Meteor.userId(), data);
    if (currentPlayerId) {
      const deviceType = window.device?.platform?.toLowerCase() || 'unknown';
      addPlayerId(currentPlayerId, deviceType);
    }
  });

  if (!Meteor.isCordova) {
    return;
  }

  console.log('Checking OneSignal availability...');
  const status = `
    plugins: ${!!window.plugins}
    plugins.OneSignal: ${!!window.plugins?.OneSignal}
    OneSignal: ${!!window.OneSignal}
  `;
  console.log(status);
  // alert('OneSignal Status:\n' + status); // Uncomment to see on device

  let appId = null;
// Get a reference to the plugin (fallback for older versions)
const appSettings = window.AppSettings || window.plugins?.AppSettings;

if (!appSettings) {
  console.error('AppSettings plugin not found');
  return;
}

// Correct signature: (successCallback, errorCallback, keyArray)
appSettings.get(
  (configs) => {
    const universalLink = configs.universallink;
    const appId = configs.onesignalappid;
    // cordova from fairmanager-cordova-plugin-universal-links
      window.cordova.plugins.UniversalLinks.subscribe(null, (eventData) => {
        console.debug(`cordovaRedirect ${universalLink} ${eventData.url}`);

        if (!eventData.url.includes(universalLink)) return;

        const redirectUrl = eventData.url.replace(universalLink, '');
        if (redirectUrl) {
          const navigateTo = `${
            !redirectUrl.startsWith('/') ? '/' : ''
          }${redirectUrl}`;
          console.debug(`navigateTo ${navigateTo}`);
          history.push(navigateTo);
        }
      });

      appId = configs.onesignalappid;
      if (appId) {
        console.log('Initializing OneSignal with App ID:', appId);
        window.plugins.OneSignal.setLogLevel({ logLevel: 4, visualLevel: 1 });

        const notificationOpenedCallback = (notification) => {
          console.debug('Notification opened:', JSON.stringify(notification));
          // Handle deep linking via additionalData.route
          const route =
            notification &&
            notification.payload &&
            notification.payload.additionalData &&
            notification.payload.additionalData.route;
          if (route) {
            goTo(route);
          }
        };

        // Handler for notifications received while app is in foreground
        const notificationReceivedCallback = (notification) => {
          console.debug('Notification received:', JSON.stringify(notification));
          // You can show an in-app notification here if desired
        };

        window.plugins.OneSignal.startInit(appId);
        
        // Set notification handlers
        window.plugins.OneSignal.handleNotificationOpened(
          notificationOpenedCallback,
        );
        window.plugins.OneSignal.handleNotificationReceived(
          notificationReceivedCallback,
        );
        
        // Get player ID and store it
        window.plugins.OneSignal.getIds((ids) => {
          currentPlayerId = ids.userId;
          console.log('OneSignal Player ID:', currentPlayerId);
          
          // Detect device type
          const deviceType = window.device?.platform?.toLowerCase() || 'unknown';
          
          // Store player ID if user is logged in
          if (Meteor.userId()) {
            addPlayerId(currentPlayerId, deviceType);
          }
        });
        
        window.plugins.OneSignal.endInit();
        console.log('OneSignal initialized successfully');
      } else {
        console.warn('OneSignal App ID not found in config');
      }
    },
    (error) => {
      console.error(
        'Error getting configuration from config.xml in Cordova',
        error,
      );
    },
  );
});
