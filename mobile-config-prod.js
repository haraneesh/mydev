// ================================
// mobile-config.js - Updated for Dec 2025
// ================================

const version = '1.0.1'; // Increment this for every Play Store upload
const [major, minor, patch] = version.split('.');
const buildNumber = `${major * 10000 + minor * 1000 + patch * 100}`;

const androidIconsFolder = 'private/assets/res/icon/android';
const androidSplashScreensFolder = 'private/assets/res/screen/android';

let idName = null;
let oneSignalAppId = '';
let urlUniversalLink = null;
let schemeUniversalLink = 'https';
let isProduction = false;

// Determine environment
switch (this.process.env.MOBILE_APP_ID) {
  case 'com.nammasuvai.production':
    isProduction = true;
    idName = {
      id: 'com.nammasuvai.production',
      name: 'NammaSuvai',
    };
    urlUniversalLink = 'www.nammasuvai.com';
    break;

  default:
    idName = {
      id: 'com.nammasuvai.dev',
      name: 'NammaSuvai Dev',
    };
    urlUniversalLink = 'localhost:3000';
    schemeUniversalLink = 'http';
}

// OneSignal Setup
oneSignalAppId = process.env.ONESIGNAL_APP_ID || 'eb78f651-694d-45b3-9427-922622ea51e5';

App.info(
  Object.assign(
    {
      version,
      buildNumber,
      description: 'Healthy, Organic Food Marketplace',
      author: 'NammaSuvai Team',
      email: 'support@nammasuvai.com',
      website: 'https://www.nammasuvai.com',
    },
    idName
  )
);

// General Preferences
App.setPreference('HideKeyboardFormAccessoryBar', 'true');
App.setPreference('Orientation', 'default');
App.setPreference('StatusBarOverlaysWebView', 'false');
App.setPreference('StatusBarBackgroundColor', '#000000');
App.setPreference('StatusBarStyle', 'lightcontent');
App.setPreference('android-windowSoftInputMode', 'adjustResize');
App.setPreference('android-launchMode', 'singleTop');
App.setPreference('android-allowBackup', 'true');

// IMPORTANT: Cleartext traffic (HTTP) is disabled in production for security
App.setPreference('android-usesCleartextTraffic', isProduction ? 'false' : 'true');

// Splash Screen (Android 12+ API 31+ Support)
App.configurePlugin('cordova-plugin-splashscreen', {
  SplashScreenDelay: '3000',
  FadeSplashScreenDuration: '500',
  SplashScreenBackgroundColor: '#ffffff',
  AndroidSplashScreenSplashIconBackgroundColor: '#ffffff',
  ShowSplashScreen: 'true',
});

// Permissions
App.configurePlugin('cordova-plugin-camera', {
  CAMERA_USAGE_DESCRIPTION: 'To capture photos of products',
  PHOTOLIBRARY_USAGE_DESCRIPTION: 'To select product images from your gallery'
});

App.configurePlugin('cordova-plugin-geolocation', {
  GEOLOCATION_USAGE_DESCRIPTION: 'To find nearby stores and delivery locations'
});

App.setPreference('OneSignalAppId', oneSignalAppId);

// Android Specific Configuration
App.appendToConfig(`
  <platform name="android">
    <preference name="android-targetSdkVersion" value="35" />
    <preference name="android-compileSdkVersion" value="35" />
    <preference name="android-minSdkVersion" value="24" />

    <resource-file src="../../../${androidIconsFolder}/mipmap-anydpi-v26/ic_launcher.xml" target="app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml" />
    <resource-file src="../../../${androidIconsFolder}/mipmap-anydpi-v26/ic_launcher_round.xml" target="app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml" />
    <resource-file src="../../../${androidIconsFolder}/drawable/ic_launcher_background.xml" target="app/src/main/res/drawable/ic_launcher_background.xml" />
    
    <resource-file src="../../../${androidIconsFolder}/drawable-xhdpi/ic_onesignal_large_icon_default.png" target="app/src/main/res/drawable-xhdpi/ic_onesignal_large_icon_default.png" />
    <resource-file src="../../../${androidIconsFolder}/drawable-xxhdpi/ic_onesignal_large_icon_default.png" target="app/src/main/res/drawable-xxhdpi/ic_onesignal_large_icon_default.png" />
  </platform>

  <universal-links>
    <host name="${urlUniversalLink}" scheme="${schemeUniversalLink}" />
  </universal-links>

  <edit-config file="app/src/main/AndroidManifest.xml" mode="merge" target="/manifest/application" xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:usesCleartextTraffic="${isProduction ? 'false' : 'true'}"></application>
  </edit-config>
`);