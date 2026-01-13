# Change: Refresh Meteor Settings on Home Page Navigation

## Why
Currently, Meteor settings are cached in-memory after the first fetch, causing stale data to persist even when the server may have published updates. Users navigating to the home page expect to see fresh configuration data without restarting the app.

## What Changes
- Clear the settings cache and reload fresh settings whenever the user navigates to the home page
- Ensure the home page waits for fresh settings to load before rendering
- Handle loading and error states during the refresh

## Impact
- Affected specs: `settings-management` (new capability)
- Affected code: 
  - `mobile/lib/screens/public/home_screen.dart` - Add settings refresh on init
  - `mobile/lib/services/settings_service.dart` - Optional: add refresh method
  - `mobile/lib/main.dart` - May need adjustments to initialization logic
