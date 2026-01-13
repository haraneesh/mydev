# User Profile Specification

## ADDED Requirements

### Requirement: Extended Profile Fields Display
The system SHALL display all user profile fields including salutation, name, email, phone, dietary preferences, packing preferences, product update preferences, delivery address, and delivery pincode.

#### Scenario: User views complete profile
- **WHEN** user navigates to profile page
- **THEN** all available profile fields are displayed with current values
- **AND** read-only fields show as text, editable fields show as inputs when in edit mode

#### Scenario: User with no preferences set
- **WHEN** user views profile and has not set preferences
- **THEN** preference fields show default/empty options
- **AND** delivery fields show as empty strings

### Requirement: Profile Editing Interface
The system SHALL provide edit mode allowing users to modify all applicable profile fields with proper input types.

#### Scenario: User enters edit mode
- **WHEN** user clicks "EDIT PROFILE" button
- **THEN** all profile fields become editable inputs
- **AND** new password fields appear at bottom
- **AND** "SAVE CHANGES" button appears (replaces "EDIT PROFILE")

#### Scenario: Preference field types
- **WHEN** editing profile
- **THEN** salutation displays as dropdown with options: Mr., Mrs., Miss
- **AND** dietary preference displays as dropdown with configured options
- **AND** packing preference displays as dropdown with configured options
- **AND** product update preference displays as dropdown with configured options
- **AND** clear cart after order displays as toggle/dropdown with Yes/No
- **AND** delivery address displays as multi-line textarea
- **AND** delivery pincode displays as number input with max length 6

### Requirement: Profile Persistence
The system SHALL persist all profile changes using the `users.editUserProfile` Meteor method.

#### Scenario: Save valid profile changes
- **WHEN** user modifies profile fields and clicks "SAVE CHANGES"
- **THEN** system validates all fields
- **AND** calls `users.editUserProfile` Meteor method with updated profile data
- **AND** displays success toast: "Profile updated!"
- **AND** returns to view mode

#### Scenario: Password change on save
- **WHEN** user enters new password in password fields
- **AND** clicks "SAVE CHANGES"
- **THEN** password is hashed and sent to backend
- **AND** password change is applied with profile update

### Requirement: Form Validation
The system SHALL validate all form inputs before submission.

#### Scenario: Dietary preference validation
- **WHEN** user leaves dietary preference empty
- **AND** clicks "SAVE CHANGES"
- **THEN** system shows error: "dietary preference is mandatory"
- **AND** prevents form submission

#### Scenario: Password confirmation validation
- **WHEN** new password and confirm password do not match
- **AND** user tries to save
- **THEN** system shows error: "two passwords do not match, please check"
- **AND** prevents form submission

#### Scenario: Inline validation errors
- **WHEN** user leaves required field empty
- **THEN** error message appears below field in red text
- **AND** form cannot be submitted with errors

### Requirement: Preferences Configuration
The system SHALL support configurable preference options for dietary, packing, and product update preferences.

#### Scenario: Display preference options
- **WHEN** user opens preference dropdown
- **THEN** all configured options display with user-friendly display names
- **AND** currently selected option is highlighted

## MODIFIED Requirements

### Requirement: User Model
The User model in `mobile/lib/models/user.dart` SHALL include all profile fields from the Meteor backend.

#### Scenario: User model deserialization
- **WHEN** User model is created from JSON response
- **THEN** all fields are properly mapped including salutation, preferences, delivery info
- **AND** fields properly handle null/missing values with sensible defaults

#### Scenario: User model serialization
- **WHEN** User model is converted to JSON for submission
- **THEN** all fields are properly formatted for Meteor method
- **AND** field names match backend expectations (camelCase)
