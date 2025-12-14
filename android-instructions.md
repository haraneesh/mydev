## Set Up assetlinks.json for Android App Links
## This is critical for deep linking to work:

bash
# Create the directory
sudo mkdir -p /var/www/html/.well-known

# Create assetlinks.json
sudo nano /var/www/html/.well-known/assetlinks.json

## Add this content (replace with your actual SHA256 fingerprint):

[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.nammasuvai.production",
    "sha256_cert_fingerprints": [
      "YOUR_APP_SHA256_FINGERPRINT_HERE"
    ]
  }
}]

## Get your SHA256 fingerprint:

bash
# From your release keystore 
# Run in local key store
# You run this command on your local machine (your Mac), in the directory where your Android release keystore file is located.

keytool -list -v -keystore nammasuvai-release.keystore -alias nammasuvai

## Set permissions:

bash
sudo chmod 644 /var/www/html/.well-known/assetlinks.json


## Verify Nginx Configuration
bash
# Test the config
sudo nginx -t

# If OK, reload
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx

## Android App Specific Requirements
11. Build the Android App with Production Settings
On your local machine:

bash
# Clean build
rm -rf .meteor/local/cordova-build

# Build with production config
npm run build:production

12. Sign the APK
bash
cd ../build/android
tar -xzf project.tar.gz
cd project

# Build release APK
./gradlew assembleRelease

# Sign it (if not already signed)
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore ~/nammasuvai-release.keystore \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  nammasuvai

  
13. Test Deep Links
After installing the app on a device:

bash
# Test via ADB
adb shell am start -a android.intent.action.VIEW \
  -d "https://www.nammasuvai.com/products/123"

14. Server code

tar xzf build.gz
npm install --prod
pm2 restart ecosystem.config.js