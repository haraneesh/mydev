# App Icon Setup

## Android App Icons

The app icons are stored in the private assets directory:
```
/Users/charaneesh/Stuff/mydev-flutter/private/assets/res/icon/android
```

### Manual Setup

To copy the icons to the Flutter project, run this from the `mobile` directory:

```bash
# Copy all icon density versions
for density in mipmap-hdpi mipmap-mdpi mipmap-xhdpi mipmap-xxhdpi mipmap-xxxhdpi; do
  cp ../private/assets/res/icon/android/$density/* android/app/src/main/res/$density/
done

# Rebuild the app
flutter clean
flutter build apk
```

Or use the convenience script:
```bash
bash scripts/setup_icons.sh
```

### Icon Details

The app icons are in WebP format with the following densities:
- `mipmap-mdpi` - Medium density (160dpi)
- `mipmap-hdpi` - High density (240dpi)
- `mipmap-xhdpi` - Extra high density (320dpi)
- `mipmap-xxhdpi` - Extra-extra high density (480dpi)
- `mipmap-xxxhdpi` - Extra-extra-extra high density (640dpi)

Each density folder contains:
- `ic_launcher.webp` - App icon
- `ic_launcher_round.webp` - Rounded variant
- `ic_launcher_foreground.webp` - Foreground layer (Adaptive icon)

### Current Status

The app name has been updated to "Suvai" in:
- `pubspec.yaml` - Package name
- `android/app/src/main/AndroidManifest.xml` - App label
- `lib/main.dart` - App title
- All source files referencing the app name

To complete the setup and see the custom Suvai icons on your device, copy the icon files using one of the methods above.
