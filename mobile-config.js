const version = '1.0.0';
const [major, minor, patch] = version.split('.');
// eslint-disable-next-line no-mixed-operators
const buildNumber = `${major * 10000 + minor * 1000 + patch * 100}`;

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
  case 'com.suvaiapp.mobile':
    // eslint-disable-next-line no-console
    console.log('--> mobile-config - production build');
    idName = {
      id: 'com.suvaiapp.mobile',
      name: 'suvaiapp',
    };
    oneSignalAppId = 'a4a5axxx-59f2-493f-abdb-efce7b0c8ef6';
    urlUniversalLink = 'mobile.suvaiapp.com';
    break;
  case 'com.suvaiapp.stagingmobile':
    // eslint-disable-next-line no-console
    console.log('--> mobile-config - staging build');
    idName = {
      id: 'com.suvaiapp.stagingmobile',
      name: 'suvaiapp_staging',
    };
    oneSignalAppId = '7b357xxx-6509-48e4-b0e1-60f8f5f116a2';
    urlUniversalLink = 'stagingmobile.suvaiapp.com';
    break;
  default:
    // eslint-disable-next-line no-console
    console.log('--> mobile-config - development build');
    idName = {
      id: 'localhost.mobile',
      name: 'suvaiapp_dev',
    };
    urlUniversalLink = 'localhost:5000';
    schemeUniversalLink = 'http';
}

App.info(
  Object.assign(
    {
      version,
      buildNumber,
      description: '',
      author: 'Suvai',
      email: 'hi@suvai.com',
      website: 'www.nammasuvai.com',
    },
    //idName,
  ),
);

// Set PhoneGap/Cordova preferences.

App.setPreference('BackgroundColor', '0xff0000ff');
App.setPreference('HideKeyboardFormAccessoryBar', true);
App.setPreference('Orientation', 'default');
App.setPreference('Orientation', 'all', 'ios');
App.setPreference('deployment-target', '12.0');

App.setPreference('StatusBarBackgroundColor', '#fdab13');

App.setPreference('StatusBarStyle', 'lightcontent');

// fix App Error connection to the server was unsuccessful.
// https://forum.ionicframework.com/t/app-error-and-cordova-deviceready-not-fired/50996/5

App.setPreference('LoadUrlTimeoutValue', '1000000', 'android');

App.setPreference('WebAppStartupTimeout', '1000000', 'android');

// needs to be lower case because of iOS

App.setPreference('onesignalappid', oneSignalAppId);

App.setPreference(
  'universallink',
  `${schemeUniversalLink}://${urlUniversalLink}`,
);

App.setPreference('WebAppStartupTimeout', 120000);

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
  app_store: appStoreIcon, // 1024x1024
  iphone_2x: `${iosIconsFolder}/icon-60@2x.png`, // 120x120
  iphone_3x: `${iosIconsFolder}/icon-60@3x.png`, // 180x180
  ipad_2x: `${iosIconsFolder}/icon-76@2x.png`, // 152x152
  ipad_pro: `${iosIconsFolder}/icon-83.5@2x.png`, // 167x167
  ios_settings_2x: `${iosIconsFolder}/icon-small@2x.png`, // 58x58
  ios_settings_3x: `${iosIconsFolder}/icon-small@3x.png`, // 87x87
  ios_spotlight_2x: `${iosIconsFolder}/icon-small-40@2x.png`, // 80x80
  ios_spotlight_3x: `${iosIconsFolder}/icon-small-40@3x.png`, // (120x120) // iPhone 6 Plus, 6s Plus, 7 Plus, 8 Plus, X
  ios_notification_2x: `${iosIconsFolder}/icon-small-40.png`, // 40x40
  ios_notification_3x: `${iosIconsFolder}/icon-60.png`, // 60x60
  ipad: `${iosIconsFolder}/icon-76.png`, // 76x76
  ios_settings: `${iosIconsFolder}/icon-small.png`, // 29x29
  ios_spotlight: `${iosIconsFolder}/icon-small-40.png`, // 40x40
  ios_notification: `${iosIconsFolder}/icon-small-40.png`, // 20x20
  iphone_legacy: `${iosIconsFolder}/icon.png`, // 57x57
  iphone_legacy_2x: `${iosIconsFolder}/icon@2x.png`, // 114x114
  ipad_spotlight_legacy: `${iosIconsFolder}/icon-small-50.png`, // 50x50
  ipad_spotlight_legacy_2x: `${iosIconsFolder}/icon-small-50@2x.png`, // 100x100
  ipad_app_legacy: `${iosIconsFolder}/icon-72.png`, // 72x72
  ipad_app_legacy_2x: `${iosIconsFolder}/icon-72@2x.png`, // 144x144
  android_mdpi: `${androidIconsFolder}/mdpi.png`, // 48x48
  android_hdpi: `${androidIconsFolder}/hdpi.png`, // 72x72
  android_xhdpi: `${androidIconsFolder}/xhdpi.png`, // 96x96
  android_xxhdpi: `${androidIconsFolder}/xxhdpi.png`, // 144x144
  android_xxxhdpi: `${androidIconsFolder}/xxxhdpi.png`, // 192x192
});

// https://docs.meteor.com/api/mobile-config.html#App-launchScreens
App.launchScreens({
  android_mdpi_portrait: `${androidSplashScreensFolder}/splash-port-mdpi.png`,
  android_mdpi_landscape: `${androidSplashScreensFolder}/splash-land-mdpi.png`,
  android_hdpi_portrait: `${androidSplashScreensFolder}/splash-port-hdpi.png`,
  android_hdpi_landscape: `${androidSplashScreensFolder}/splash-land-hdpi.png`,
  android_xhdpi_portrait: `${androidSplashScreensFolder}/splash-port-xhdpi.png`,
  android_xhdpi_landscape: `${androidSplashScreensFolder}/splash-land-xhdpi.png`,
  android_xxhdpi_portrait: `${androidSplashScreensFolder}/splash-port-xxhdpi.png`,
  android_xxhdpi_landscape: `${androidSplashScreensFolder}/splash-land-xxhdpi.png`,
  android_xxxhdpi_portrait: `${androidSplashScreensFolder}/splash-port-xxxhdpi.png`,
  android_xxxhdpi_landscape: `${androidSplashScreensFolder}/splash-land-xxxhdpi.png`,
});

App.appendToConfig(`
  <platform name="ios">
    <splash src="${iosSplashScreensFolder}/Default@2x~universal~anyany.png" />
  </platform>
  <platform name="android">
    <preference name="android-targetSdkVersion" value="29" />
    <preference name="android-minSdkVersion" value="20" />
  </platform>
  <universal-links>
    <host name="${urlUniversalLink}" scheme="${schemeUniversalLink}" />
  </universal-links>
  <edit-config file="app/src/main/AndroidManifest.xml" mode="merge" target="/manifest/application" xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:usesCleartextTraffic="true"></application>
  </edit-config>
`);
