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

  // Capture device details from Cordova Device plugin
  const deviceInfo = {};
  
  if (window.device) {
    deviceInfo.deviceUuid = window.device.uuid || null;
    deviceInfo.deviceModel = window.device.model || null;
    deviceInfo.deviceManufacturer = window.device.manufacturer || null;
    deviceInfo.platform = window.device.platform || null;
    deviceInfo.osVersion = window.device.version || null;
    deviceInfo.isVirtual = window.device.isVirtual || false;
  }

  // Get app version from Meteor settings or package
  const appVersion = (Meteor.settings && Meteor.settings.public && Meteor.settings.public.appVersion) || '1.0.0';

  methodCall('addPlayerId', {
    playerId,
    deviceType,
    ...deviceInfo,
    appVersion,
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
    
    const registerPlayerId = async () => {
      if (currentPlayerId) {
        const deviceType = window.device?.platform?.toLowerCase() || 'unknown';
        console.log('Registering player ID on login:', currentPlayerId);
        addPlayerId(currentPlayerId, deviceType);
        return true;
      }
      
      // If currentPlayerId not set yet, try to get it from OneSignal
      if (window.plugins?.OneSignal?.User?.pushSubscription) {
        try {
          const subscriptionId = await window.plugins.OneSignal.User.pushSubscription.getIdAsync();
          if (subscriptionId) {
            currentPlayerId = subscriptionId;
            const deviceType = window.device?.platform?.toLowerCase() || 'unknown';
            console.log('Got player ID from OneSignal on login:', currentPlayerId);
            addPlayerId(currentPlayerId, deviceType);
            return true;
          }
        } catch (error) {
          console.warn('Could not get player ID on login:', error);
        }
      }
      
      return false;
    };
    
    // Try immediately
    registerPlayerId().then((success) => {
      if (!success) {
        // If failed, retry after 2 seconds (OneSignal might still be initializing)
        console.log('Player ID not available yet, will retry in 2 seconds...');
        setTimeout(() => {
          registerPlayerId().then((retrySuccess) => {
            if (!retrySuccess) {
              console.warn('Player ID still not available after retry. User may need to restart the app.');
            }
          });
        }, 2000);
      }
    });
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
  // eslint-disable-next-line no-undef
  const appSettings = window.AppSettings || window.plugins?.AppSettings;

  console.log('AppSettings check:', {
    windowAppSettings: !!window.AppSettings,
    pluginsAppSettings: !!window.plugins?.AppSettings,
    appSettings: !!appSettings
  });

  if (!appSettings) {
    console.error('AppSettings plugin not found');
    return;
  }

  console.log('About to call appSettings.get...');

  // Correct signature: (successCallback, errorCallback, keyArray)
  appSettings.get(
    (configs) => {
      const universalLink = configs.universallink;
      appId = configs.OneSignalAppId || configs.onesignalappid;

      // cordova from fairmanager-cordova-plugin-universal-links
      if (universalLink && window.cordova?.plugins?.UniversalLinks) {
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
      }

      if (appId) {
        console.log('Initializing OneSignal with App ID:', appId);
        
        // OneSignal v5 SDK initialization
        window.plugins.OneSignal.initialize(appId);
        
        // Check current permission status
        const hasPermission = window.plugins.OneSignal.Notifications.hasPermission();
        console.log('Current notification permission:', hasPermission);
        
        // DON'T request permission automatically on app load
        // Permission will be requested after first order is placed
        // window.plugins.OneSignal.Notifications.requestPermission(true).then((accepted) => {
        //   console.log('Notification permission request result:', accepted);
        //   if (accepted) {
        //     console.log('Notification permissions granted!');
        //   } else {
        //     console.warn('Notification permissions denied');
        //   }
        // }).catch((error) => {
        //   console.error('Error requesting notification permission:', error);
        // });
        
        // Set up notification click handler
        window.plugins.OneSignal.Notifications.addEventListener('click', (event) => {
          console.debug('Notification clicked:', JSON.stringify(event));
          
          // Handle deep linking via additionalData.route
          const route = event?.notification?.additionalData?.route;
          if (route) {
            goTo(route);
          }
        });
        
        // Set up notification received handler (foreground)
        window.plugins.OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
          console.debug('Notification received in foreground:', JSON.stringify(event));
          // You can prevent the notification from displaying by calling:
          // event.preventDefault();
        });
        
        // Get player ID (subscription ID in v5)
        const getAndStorePlayerId = async () => {
          try {
            const subscriptionId = await window.plugins.OneSignal.User.pushSubscription.getIdAsync();
            if (subscriptionId) {
              currentPlayerId = subscriptionId;
              console.log('OneSignal Player ID:', currentPlayerId);
              
              // Detect device type
              const deviceType = window.device?.platform?.toLowerCase() || 'unknown';
              
              // Store player ID if user is logged in
              if (Meteor.userId()) {
                addPlayerId(currentPlayerId, deviceType);
              }
            } else {
              console.warn('OneSignal subscription ID not available yet');
            }
          } catch (error) {
            console.error('Error getting OneSignal subscription ID:', error);
          }
        };
        
        // Listen for subscription changes
        window.plugins.OneSignal.User.pushSubscription.addEventListener('change', (event) => {
          console.log('Push subscription changed:', event);
          getAndStorePlayerId();
        });
        
        // Try to get player ID immediately (in case already subscribed)
        setTimeout(getAndStorePlayerId, 1000);
        
        console.log('OneSignal initialized successfully');
      } else {
        console.warn('OneSignal App ID not found in config');
      }
    },
    (error) => {
      console.error('AppSettings get error:', error);
    },
    ['OneSignalAppId', 'onesignalappid', 'universallink']
  );
});
