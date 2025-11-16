const appVersion = '1.0.0';
const [major, minor, patch] = appVersion.split('.').map(Number);
const buildNumber = String(major * 10000 + minor * 1000 + patch * 100);

// App Information
const appName = 'NammaSuvai';
const appDescription = 'Healthy, Organic Food Marketplace';

// Plugin Version Constants
const CORDOVA_PLUGIN_VERSIONS = {
  DEVICE: '2.1.0',
  NETWORK: '3.0.0',
  WHITELIST: '1.3.5',
  FILE: '7.0.0',
  FILE_TRANSFER: '1.7.1',
  DIALOGS: '3.0.0',
  INAPPBROWSER: '5.0.0',
  CAMERA: '7.0.0',
  GEOLOCATION: '4.1.0',
  STATUSBAR: '3.0.0'
};

const appStoreIcon = 'private/assets/icon.png';
const iosIconsFolder = 'private/assets/res/icon/ios';
const androidIconsFolder = 'private/assets/res/icon/android';
// The path for the ios splash screen folder is different from the android
// because this is passed to Cordova
const iosSplashScreensFolder = '../../../private/assets/res/screen/ios';
const androidSplashScreensFolder = 'private/assets/res/screen/android';

let idName = null;
let oneSignalAppId = '';
let urlUniversalLink = null;
let schemeUniversalLink = 'https';

// noinspection ThisExpressionReferencesGlobalObjectJS
switch (this.process.env.MOBILE_APP_ID) {
  case 'com.nammasuvai.production':
    // Production build for NammaSuvai
    console.log('--> NammaSuvai mobile-config - production build');
    idName = {
      id: 'com.nammasuvai.production',
      name: 'NammaSuvai',
    };
    oneSignalAppId = ''; // Add your OneSignal App ID here when available
    urlUniversalLink = 'app.nammasuvai.com';
    schemeUniversalLink = 'https';
    break;
  case 'com.nammasuvai.staging':
    // Staging build for NammaSuvai
    console.log('--> NammaSuvai mobile-config - staging build');
    idName = {
      id: 'com.nammasuvai.staging',
      name: 'NammaSuvai Staging',
    };
    oneSignalAppId = ''; // Add your staging OneSignal App ID here when available
    urlUniversalLink = 'staging.nammasuvai.com';
    break;
  case 'com.suvaiapp.mobile':
    // Legacy production build - keeping for backward compatibility
    console.log('--> Legacy suvaiapp mobile-config - production build');
    idName = {
      id: 'com.suvaiapp.mobile',
      name: 'suvaiapp',
    };
    oneSignalAppId = 'a4a5axxx-59f2-493f-abdb-efce7b0c8ef6';
    urlUniversalLink = 'mobile.suvaiapp.com';
    break;
  default:
    // Development build
    console.log('--> NammaSuvai mobile-config - development build');
    idName = {
      id: 'com.nammasuvai.development',
      name: 'NammaSuvai Dev',
    };
    urlUniversalLink = 'localhost:3000';
    schemeUniversalLink = 'http';
}

// Configure App
App.info({
  name: appName,
  description: appDescription,
  author: 'NammaSuvai Team',
  email: 'support@nammasuvai.com',
  website: 'https://nammasuvai.com',
  version: appVersion
});

// Set build number as a preference
App.setPreference('android-versionCode', buildNumber);
App.setPreference('ios-CFBundleVersion', buildNumber);

// Set PhoneGap/Cordova preferences.

App.setPreference('BackgroundColor', '0xff0000ff');
App.setPreference('HideKeyboardFormAccessoryBar', 'true');
App.setPreference('Orientation', 'default');
App.setPreference('Orientation', 'all', 'ios');
App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#000000');
App.setPreference('StatusBarStyle', 'lightcontent');

// Configure Whitelist and other preferences
App.setPreference('loadUrlTimeoutValue', '700000');
App.setPreference('android-windowSoftInputMode', 'adjustResize');
App.setPreference('android-launchMode', 'singleTop');
App.setPreference('DisallowOverscroll', 'true');
App.setPreference('BackupWebStorage', 'cloud');
// Native Splash Screen Configuration (Cordova 6+ for iOS and 9+ for Android)
App.setPreference('SplashScreen', 'screen');
App.setPreference('SplashScreenDelay', '3000');
App.setPreference('FadeSplashScreenDuration', '300');
App.setPreference('AutoHideSplashScreen', 'true');
App.setPreference('SplashScreenBackgroundColor', '#ffffff');
App.setPreference('ShowSplashScreenSpinner', 'false');
App.setPreference('SplashMaintainAspectRatio', 'true');
App.setPreference('FadeSplashScreen', 'true');

// Configure Android Platform
App.configurePlugin('cordova-plugin-camera', {
  CAMERA_USAGE_DESCRIPTION: 'To capture photos of products',
  PHOTOLIBRARY_USAGE_DESCRIPTION: 'To select product images from your gallery'
});

App.configurePlugin('cordova-plugin-geolocation', {
  GEOLOCATION_USAGE_DESCRIPTION: 'To find nearby stores and delivery locations'
});

// Configure Android platform
App.setPreference('android-targetSdkVersion', '35');
App.setPreference('android-compileSdkVersion', '35');
App.setPreference('android-minSdkVersion', '21');
App.setPreference('android-installLocation', 'auto');
App.setPreference('android-allowBackup', 'true');
App.setPreference('android-fullBackupContent', 'true');
App.setPreference('android-usesCleartextTraffic', 'true');

// iOS platform configuration
App.setPreference('AllowInlineMediaPlayback', 'true');
App.setPreference('BackupWebStorage', 'cloud');
App.setPreference('DisallowOverscroll', 'true');
App.setPreference('EnableViewportScale', 'true');
App.setPreference('KeyboardDisplayRequiresUserAction', 'false');
App.setPreference('SuppressesIncrementalRendering', 'false');

// Configure launch screens
// Configure splash screens
App.launchScreens({
  // Android
  'android_mdpi_landscape': 'private/assets/res/screen/android/splash_land-mdpi.png',
  'android_mdpi_portrait': 'private/assets/res/screen/android/splash_port-mdpi.png',
  'android_hdpi_landscape': 'private/assets/res/screen/android/splash_land-hdpi.png',
  'android_hdpi_portrait': 'private/assets/res/screen/android/splash_port-hdpi.png',
  'android_xhdpi_landscape': 'private/assets/res/screen/android/splash_land-xhdpi.png',
  'android_xhdpi_portrait': 'private/assets/res/screen/android/splash_port-xhdpi.png',
  'android_xxhdpi_landscape': 'private/assets/res/screen/android/splash_land-xxhdpi.png',
  'android_xxhdpi_portrait': 'private/assets/res/screen/android/splash_port-xxhdpi.png',
  'android_xxxhdpi_landscape': 'private/assets/res/screen/android/splash_land-xxxhdpi.png',
  'android_xxxhdpi_portrait': 'private/assets/res/screen/android/splash_port-xxxhdpi.png',
  
  // iOS
  'iphone': `${iosSplashScreensFolder}/Default~iphone.png`,
  'iphone_2x': `${iosSplashScreensFolder}/Default@2x~iphone.png`,
  'iphone5': `${iosSplashScreensFolder}/Default-568h@2x~iphone.png`,
  'iphone6': `${iosSplashScreensFolder}/Default-667h.png`,
  'iphone6p_portrait': `${iosSplashScreensFolder}/Default-736h.png`,
  'iphone6p_landscape': `${iosSplashScreensFolder}/Default-Landscape-736h.png`,
  'ipad_portrait': `${iosSplashScreensFolder}/Default-Portrait~ipad.png`,
  'ipad_portrait_2x': `${iosSplashScreensFolder}/Default-Portrait@2x~ipad.png`,
  'ipad_landscape': `${iosSplashScreensFolder}/Default-Landscape~ipad.png`,
  'ipad_landscape_2x': `${iosSplashScreensFolder}/Default-Landscape@2x~ipad.png`
});

// Content Security Policy is set via meta tag in HTML head

App.setPreference('StatusBarStyle', 'lightcontent');

// Fix App Error connection to the server was unsuccessful.
// https://forum.ionicframework.com/t/app-error-and-cordova-deviceready-not-fired/50996/5

App.setPreference('LoadUrlTimeoutValue', '1000000', 'android');
App.setPreference('WebAppStartupTimeout', '1000000', 'android');

// needs to be lower case because of iOS

App.setPreference('onesignalappid', oneSignalAppId);

App.setPreference(
  'universallink',
  `${schemeUniversalLink}://${urlUniversalLink}`
);

App.setPreference('WebAppStartupTimeout', '120000');

App.accessRule('http://*', { type: 'navigation' });

App.accessRule('https://*', { type: 'navigation' });

App.accessRule('http://*', { type: 'network' });

App.accessRule('https://*', { type: 'network' });

App.accessRule('http://www.google-analytics.com', { type: 'network' });

App.accessRule('https://www.google-analytics.com', { type: 'network' });

App.accessRule('https://cdn.onesignal.com', { type: 'network' });

// https://pgicons.abiro.com/
// https://docs.meteor.com/api/mobile-config.html#App-icons
App.icons({
  // iOS
  'iphone_2x': `${iosIconsFolder}/icon-60@2x.png`,
  'iphone_3x': `${iosIconsFolder}/icon-60@3x.png`,
  'ipad': `${iosIconsFolder}/icon-76.png`,
  'ipad_2x': `${iosIconsFolder}/icon-76@2x.png`,
  'ipad_pro': `${iosIconsFolder}/icon-83.5@2x.png`,
  'ios_settings': `${iosIconsFolder}/icon-small.png`,
  'ios_settings_2x': `${iosIconsFolder}/icon-small@2x.png`,
  'ios_settings_3x': `${iosIconsFolder}/icon-small@3x.png`,
  'ios_spotlight': `${iosIconsFolder}/icon-small-40.png`,
  'ios_spotlight_2x': `${iosIconsFolder}/icon-small-40@2x.png`,
  'ios_spotlight_3x': `${iosIconsFolder}/icon-small-40@3x.png`,
  'iphone_notification': `${iosIconsFolder}/icon-small.png`,
  'iphone_notification_2x': `${iosIconsFolder}/icon-small@2x.png`,
  'iphone_notification_3x': `${iosIconsFolder}/icon-small@3x.png`,
  'ipad_notification': `${iosIconsFolder}/icon-small.png`,
  'ipad_notification_2x': `${iosIconsFolder}/icon-small@2x.png`,
  'ios_marketing': `${iosIconsFolder}/icon-1024.png`,
  
  // Android
  'android_mdpi': 'private/assets/res/icon/android/mipmap-mdpi/ic_launcher.png',
  'android_hdpi': 'private/assets/res/icon/android/mipmap-hdpi/ic_launcher.png',
  'android_xhdpi': 'private/assets/res/icon/android/mipmap-xhdpi/ic_launcher.png',
  'android_xxhdpi': 'private/assets/res/icon/android/mipmap-xxhdpi/ic_launcher.png',
  'android_xxxhdpi': 'private/assets/res/icon/android/mipmap-xxxhdpi/ic_launcher.png'
});
