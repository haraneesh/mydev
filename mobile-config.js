// ================================
// mobile-config.js
// ================================

const version = '1.0.0';
const [major, minor, patch] = version.split('.');
// eslint-disable-next-line no-mixed-operators
const buildNumber = `${major * 10000 + minor * 1000 + patch * 100}`;

const androidIconsFolder = 'private/assets/res/icon/android';
const androidSplashScreensFolder = 'private/assets/res/screen/android';

let idName = null;
let oneSignalAppId = '';
let urlUniversalLink = null;
let schemeUniversalLink = 'https';


// noinspection ThisExpressionReferencesGlobalObjectJS
switch (this.process.env.MOBILE_APP_ID) {
  case 'com.nammasuvai.production':
    // eslint-disable-next-line no-console
    console.log('--> NammaSuvai mobile-config - production build');
    idName = {
      id: 'com.nammasuvai.production',
      name: 'NammaSuvai',
    };
    urlUniversalLink = 'app.nammasuvai.com';
    break;

  default:
    // eslint-disable-next-line no-console
    console.log('--> NammaSuvai mobile-config - development build');
    idName = {
      id: 'com.nammasuvai.dev',
      name: 'NammaSuvai Dev',
    };
    urlUniversalLink = 'localhost:3000';
    schemeUniversalLink = 'http';
}

   // Get OneSignal App ID from environment variables
    if (process.env.ONESIGNAL_APP_ID) {
      oneSignalAppId = process.env.ONESIGNAL_APP_ID;
      console.log(`--> Using OneSignal App ID from env: ${oneSignalAppId}`);
    } else {
      console.warn('--> ONESIGNAL_APP_ID env var not set. Using default.');
      oneSignalAppId = 'eb78f651-694d-45b3-9427-922622ea51e5';
    }

// eslint-disable-next-line no-undef
App.info(
  Object.assign(
    {
      version,
      buildNumber,
      description: 'Healthy, Organic Food Marketplace',
      author: 'NammaSuvai Team',
      email: 'support@nammasuvai.com',
      website: 'https://nammasuvai.com',
    },
    idName
  )
);

// General settings
// eslint-disable-next-line no-undef
App.setPreference('HideKeyboardFormAccessoryBar', 'true');
// eslint-disable-next-line no-undef
App.setPreference('Orientation', 'default');
// eslint-disable-next-line no-undef
App.setPreference('StatusBarOverlaysWebView', 'false');
// eslint-disable-next-line no-undef
App.setPreference('StatusBarBackgroundColor', '#000000');
// eslint-disable-next-line no-undef
App.setPreference('StatusBarStyle', 'lightcontent');

// eslint-disable-next-line no-undef
App.setPreference('loadUrlTimeoutValue', '700000');
// eslint-disable-next-line no-undef
App.setPreference('android-windowSoftInputMode', 'adjustResize');
// eslint-disable-next-line no-undef
App.setPreference('android-launchMode', 'singleTop');
// eslint-disable-next-line no-undef
App.setPreference('android-allowBackup', 'true');
// eslint-disable-next-line no-undef
App.setPreference('android-usesCleartextTraffic', 'true');

// Splash screen configuration
// eslint-disable-next-line no-undef
App.configurePlugin('cordova-plugin-splashscreen', {
  // Android specific
  SplashScreen: 'screen',
  SplashScreenDelay: '5000',
  AutoHideSplashScreen: 'true',
  FadeSplashScreen: 'true',
  FadeSplashScreenDuration: '500',
  ShowSplashScreenSpinner: 'false',
  SplashMaintainAspectRatio: 'true',
  SplashShowOnlyFirstTime: '0',
  SplashScreenBackgroundColor: '#ffffff',
  // Android 12+ specific
  AndroidSplashScreenSplashIconBackgroundColor: '#ffffff',
  AndroidSplashScreenSplashIconSize: '200',
  AndroidSplashScreenShowOnlyTheFirstScreen: 'true',
  ShowSplashScreen: 'true',
  SplashScreenSpinnerColor: '#000000'
});

// Plugins
// eslint-disable-next-line no-undef
App.configurePlugin('cordova-plugin-camera', {
  CAMERA_USAGE_DESCRIPTION: 'To capture photos of products',
  PHOTOLIBRARY_USAGE_DESCRIPTION: 'To select product images from your gallery'
});

// eslint-disable-next-line no-undef
App.configurePlugin('cordova-plugin-geolocation', {
  GEOLOCATION_USAGE_DESCRIPTION: 'To find nearby stores and delivery locations'
});

// Universal links + OneSignal
// eslint-disable-next-line no-undef
App.setPreference('OneSignalAppId', oneSignalAppId);
// eslint-disable-next-line no-undef
App.setPreference('universallink', `${schemeUniversalLink}://${urlUniversalLink}`);

// Security
// eslint-disable-next-line no-undef
App.accessRule('http://*', { type: 'network' });
// eslint-disable-next-line no-undef
App.accessRule('https://*', { type: 'network' });
// eslint-disable-next-line no-undef
App.accessRule('https://cdn.onesignal.com', { type: 'network' });
// eslint-disable-next-line no-undef
App.accessRule('https://securegw.paytm.in', { type: 'network' });
// eslint-disable-next-line no-undef
App.accessRule('https://securegw-stage.paytm.in', { type: 'network' });

// Icons
App.icons({
  // Standard Android icons
  'android_mdpi': `${androidIconsFolder}/mipmap-mdpi/ic_launcher.webp`,
  'android_hdpi': `${androidIconsFolder}/mipmap-hdpi/ic_launcher.webp`,
  'android_xhdpi': `${androidIconsFolder}/mipmap-xhdpi/ic_launcher.webp`,
  'android_xxhdpi': `${androidIconsFolder}/mipmap-xxhdpi/ic_launcher.webp`,
  'android_xxxhdpi': `${androidIconsFolder}/mipmap-xxxhdpi/ic_launcher.webp`
});

// Launch screens
App.launchScreens({
  // Android
  'android_universal': `${androidSplashScreensFolder}/universal/splash.png`
});

// eslint-disable-next-line no-undef
App.appendToConfig(`
  <platform name="android">
    <preference name="android-targetSdkVersion" value="35" />
    <preference name="android-compileSdkVersion" value="35" />
    <preference name="android-minSdkVersion" value="21" />

    <resource-file src="../../../${androidIconsFolder}/mipmap-anydpi-v26/ic_launcher.xml" target="app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml" />
    <resource-file src="../../../${androidIconsFolder}/mipmap-anydpi-v26/ic_launcher_round.xml" target="app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml" />
    
    <resource-file src="../../../${androidIconsFolder}/drawable/ic_launcher_background.xml" target="app/src/main/res/drawable/ic_launcher_background.xml" />
    
    <resource-file src="../../../${androidIconsFolder}/mipmap-mdpi/ic_launcher_foreground.webp" target="app/src/main/res/mipmap-mdpi/ic_launcher_foreground.webp" />
    <resource-file src="../../../${androidIconsFolder}/mipmap-hdpi/ic_launcher_foreground.webp" target="app/src/main/res/mipmap-hdpi/ic_launcher_foreground.webp" />
    <resource-file src="../../../${androidIconsFolder}/mipmap-xhdpi/ic_launcher_foreground.webp" target="app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.webp" />
    <resource-file src="../../../${androidIconsFolder}/mipmap-xxhdpi/ic_launcher_foreground.webp" target="app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.webp" />
    <resource-file src="../../../${androidIconsFolder}/mipmap-xxxhdpi/ic_launcher_foreground.webp" target="app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.webp" />
    
    <resource-file src="../../../${androidIconsFolder}/mipmap-mdpi/ic_launcher_round.webp" target="app/src/main/res/mipmap-mdpi/ic_launcher_round.webp" />
    <resource-file src="../../../${androidIconsFolder}/mipmap-hdpi/ic_launcher_round.webp" target="app/src/main/res/mipmap-hdpi/ic_launcher_round.webp" />
    <resource-file src="../../../${androidIconsFolder}/mipmap-xhdpi/ic_launcher_round.webp" target="app/src/main/res/mipmap-xhdpi/ic_launcher_round.webp" />
    <resource-file src="../../../${androidIconsFolder}/mipmap-xxhdpi/ic_launcher_round.webp" target="app/src/main/res/mipmap-xxhdpi/ic_launcher_round.webp" />
    <resource-file src="../../../${androidIconsFolder}/mipmap-xxxhdpi/ic_launcher_round.webp" target="app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.webp" />
  </platform>

  <universal-links>
    <host name="${urlUniversalLink}" scheme="${schemeUniversalLink}" />
  </universal-links>
  <edit-config file="app/src/main/AndroidManifest.xml" mode="merge" target="/manifest/application" xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:usesCleartextTraffic="true"></application>
  </edit-config>
`);