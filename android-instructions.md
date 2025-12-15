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


11a. Generate Keystore (First Time Only)
If this is a brand new app, generate the keystore first.
**Keep your password safe!**
```bash
keytool -genkey -v -keystore ~/nammasuvai-release.keystore -alias nammasuvai -keyalg RSA -keysize 2048 -validity 10000
```


12. Sign and Align the APK (Android 11+ Workflow)
Since we target Android 11+ (SDK 30+), we must use **zipalign** FIRST, and then sign with **apksigner** (v2 signature).

**A. Zip Align (Input: unsigned -> Output: aligned)**
```bash
/Users/charaneesh/Library/Android/sdk/build-tools/36.1.0/zipalign -v -f 4 app/build/outputs/apk/release/app-release-unsigned.apk app/build/outputs/apk/release/app-release-aligned.apk
```

**B. Sign with apksigner**
(Enter your keystore password when prompted)
```bash
/Users/charaneesh/Library/Android/sdk/build-tools/36.1.0/apksigner sign --ks ~/nammasuvai-release.keystore --ks-key-alias nammasuvai app/build/outputs/apk/release/app-release-aligned.apk
```

**C. Install**
```bash
adb install -r app/build/outputs/apk/release/app-release-aligned.apk
```



  
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