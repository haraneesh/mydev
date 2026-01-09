# Change: Add Background Image to All Flutter Pages

## Why
Consistent visual branding across the Flutter application requires applying a background image across all pages. The bg.jpg asset is available in the public folder of the client Meteor application and should be used as the default background.

## What Changes
- Add bg.jpg background image to all Flutter page widgets
- Ensure the image repeats/tiles across all page sizes
- Maintain visual consistency across the application

## Impact
- Affected specs: UI Styling
- Affected code: Flutter mobile application pages (mobile/lib/), client Meteor application assets (client/public/)
