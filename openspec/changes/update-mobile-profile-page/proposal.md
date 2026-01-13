# Change: Update Mobile Profile Page to Match Client

## Why
The Flutter mobile application's profile page currently displays only basic user information (phone, name, email). The web client profile page displays significantly more fields that allow users to manage preferences, delivery information, and account settings. To provide feature parity across platforms, the mobile profile page should include all fields available in the web client.

## What Changes
- Add display and editing capability for salutation (title) field
- Add dietary preference selection
- Add packing preference selection
- Add product update preference selection
- Add delivery address field
- Add delivery pincode field
- Add clear cart after order toggle
- Implement form validation for required fields
- Add password change functionality
- Reuse existing Meteor methods and subscriptions for consistency

## Impact
- Affected specs: `user-profile` (new capability)
- Affected code:
  - `mobile/lib/screens/public/user_profile_screen.dart` - main profile UI
  - `mobile/lib/models/user.dart` - user model extension
  - `mobile/lib/providers/auth_provider.dart` - auth provider methods
- User-facing: Provides access to all profile settings previously only available on web

## Approval Gate
This change requires approval before implementation begins.
