# Flutter Native Splash Screen Setup

## Status: Configuration Ready ✅

All pubspec.yaml configuration is complete. The remaining step requires manual file copying via terminal/Finder.

## What's Been Done

1. ✅ Added `flutter_native_splash: ^2.3.5` dependency
2. ✅ Configured flutter_native_splash in pubspec.yaml with:
   - White background (#FFFFFF)
   - Suvai logo as splash image
   - Android 12+ specific configuration
3. ✅ Uncommented and configured assets section in pubspec.yaml

## Next Steps

### 1. Create Assets Directory
Create the directory structure for Flutter assets:
```
mobile/assets/
└── splash.png  (copy from private assets)
```

### 2. Copy Splash Image
Copy the splash image from the private assets to the mobile app:
```
Source: /Users/charaneesh/Stuff/mydev-flutter/private/assets/res/screen/android/universal/splash.png
Destination: /Users/charaneesh/Stuff/mydev-flutter/mobile/assets/splash.png
```

The splash image is the Suvai logo (sun and fields design).

### 3. Generate Splash Screens
Once the image is in place, run from the `mobile` directory:
```bash
cd /Users/charaneesh/Stuff/mydev-flutter/mobile
flutter pub get
flutter pub run flutter_native_splash:create
```

This will:
- Generate splash screens for Android (multiple densities)
- Generate splash screens for iOS
- Automatically integrate them into the native code

### 4. Verify & Test
```bash
flutter clean
flutter run
```

The app should now show the Suvai splash screen on startup before the Flutter UI loads.

## Configuration Details

The flutter_native_splash configuration generates:

**Android:**
- Splash images for each density (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Splash layout in `android/app/src/main/res/layout/launch_screen.xml`
- Updates to `android/app/src/main/AndroidManifest.xml`
- Integration with the LaunchTheme theme

**iOS:**
- Splash screen image in Xcode assets
- LaunchScreen.storyboard configuration
- Integration with iOS launch settings

## Files Modified This Session
- `pubspec.yaml` - Added dependency and configuration

## Ready for Next Session
Just need to copy the splash image and run the flutter_native_splash generator command.
