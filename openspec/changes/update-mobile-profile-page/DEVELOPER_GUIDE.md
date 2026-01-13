# Developer Guide: Mobile Profile Page Implementation

## Quick Reference

### Key Files
- **UI**: `mobile/lib/screens/public/user_profile_screen.dart`
- **Model**: `mobile/lib/models/user.dart`
- **Service**: `mobile/lib/services/auth_service.dart`
- **Provider**: `mobile/lib/providers/auth_provider.dart`
- **Constants**: `mobile/lib/config/preferences.dart`

### Data Flow

```
User taps "Edit Profile" button
  ↓
setState(editing=true) - UI switches to edit mode
  ↓
User fills form fields
  ↓
User clicks "Save Changes"
  ↓
_validateForm() - Check dietary preference & password match
  ↓
_saveProfile() - Call authProvider.updateProfile()
  ↓
AuthProvider.updateProfile() - Set state to authenticating
  ↓
AuthService.updateUserProfile() - Build request & call Meteor method
  ↓
meteorClient.call('users.editUserProfile', [profileData])
  ↓
Meteor backend processes and updates database
  ↓
AuthService.getCurrentUser() - Fetch updated user data
  ↓
User.fromJson() - Deserialize new user data
  ↓
AuthProvider updates _currentUser
  ↓
notifyListeners() - Rebuild UI
  ↓
UI shows success snackbar and returns to view mode
```

## Preference Constants

Location: `mobile/lib/config/preferences.dart`

**Usage Example:**
```dart
// Display name from key
final displayName = PreferenceConstants.dietaryPreferences['vegetarian'];
// Output: 'Vegetarian'

// Build dropdown items
PreferenceConstants.dietaryPreferences.entries
  .map((e) => DropdownMenuItem(
    value: e.key,
    child: Text(e.value),
  ))
  .toList()
```

**Available Constants:**
- `dietaryPreferences` - Map<String, String>
- `packingPreferences` - Map<String, String>
- `productUpdatePreferences` - Map<String, String>
- `salutations` - Map<String, String>

### Adding New Preferences

1. Add to constants in `mobile/lib/config/preferences.dart`
2. Update User model field name if needed
3. Update profile screen dropdown options
4. Update Meteor backend to support new values

## User Model Changes

### New Fields
```dart
// Profile section
String? salutation;          // Mr./Mrs./Miss
String? firstName;           // First name
String? lastName;            // Last name
String? whMobilePhone;       // Secondary mobile
String? deliveryAddress;     // Full address
String? deliveryPincode;     // 6-digit code

// Settings section
String? dietaryPreference;   // Dietary choice
String? packingPreference;   // Packaging preference
String? productUpdatePreference;  // Update frequency
bool clearCartAfterOrder;    // Auto-clear setting
```

### Serialization

**fromJson()**: Maps nested Meteor structure
```
profile: {
  salutation,
  name: { first, last },
  whMobilePhone,
  deliveryAddress,
  deliveryPincode
}

settings: {
  dietPreference,
  packingPreference,
  productUpdatePreference,
  clearCartAfterOrder
}
```

**toJson()**: Creates nested structure for Meteor method

## Form Validation

### Validation Rules
```dart
if (_dietaryPreference == null || _dietaryPreference!.isEmpty) {
  _validationErrors['dietaryPreference'] = 'Dietary preference is mandatory';
}

if (_newPasswordController.text.isNotEmpty) {
  if (_newPasswordController.text != _confirmPasswordController.text) {
    _validationErrors['password'] = 'Two passwords do not match, please check';
  }
}
```

### Adding New Validations
1. Add validation logic to `_validateForm()` method
2. Store errors in `_validationErrors` map
3. Display error below field in edit mode
4. Check `_validationErrors.isNotEmpty` before submission

## TextEditingController Management

### Important Pattern
```dart
// Declare as final with immediate initialization
final TextEditingController _firstNameController = TextEditingController();

// Set values in initState()
@override
void initState() {
  super.initState();
  _firstNameController.text = user?.firstName ?? '';
}

// Clean up in dispose()
@override
void dispose() {
  _firstNameController.dispose();
  super.dispose();
}
```

**Why?** Prevents LateInitializationError when widget builds before initState runs.

## Meteor Method Integration

### Request Structure
```dart
final profileData = {
  'emailAddress': 'user@example.com',
  'profile': {
    'salutation': 'Mr.',
    'name': {
      'first': 'John',
      'last': 'Doe',
    },
    'whMobilePhone': '9876543210',
    'deliveryAddress': '123 Main St',
    'deliveryPincode': '560001',
  },
  'settings': {
    'dietPreference': 'vegetarian',
    'packingPreference': 'paper',
    'productUpdatePreference': 'weekly',
    'clearCartAfterOrder': true,
  },
  'password': 'hashed_password', // Optional
};
```

### Expected Response
Returns updated user object with all fields populated.

## UI Component Patterns

### View Mode (Read-only)
```dart
if (!_isEditing)
  Text(
    user.firstName?.isEmpty == false ? user.firstName! : 'Not set',
    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
  ),
```

**Key Points:**
- Always read from user object (not controller text)
- Use safe navigation (`?.isEmpty == false`)
- Show "Not set" for null/empty values

### Edit Mode (Input)
```dart
if (_isEditing)
  TextField(
    controller: _firstNameController,
    enabled: !_isLoading,
    decoration: InputDecoration(
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    ),
  ),
```

### Dropdown Pattern
```dart
DropdownButtonFormField<String>(
  value: _dietaryPreference,
  isExpanded: true,
  items: PreferenceConstants.dietaryPreferences.entries
    .map((e) => DropdownMenuItem(value: e.key, child: Text(e.value)))
    .toList(),
  onChanged: _isLoading ? null : (value) => setState(() => _dietaryPreference = value),
  decoration: InputDecoration(
    border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
  ),
)
```

## Common Issues & Solutions

### Issue: Fields show "Not Set" even with values
**Solution:** In view mode, read from `user` object, not controller text
```dart
// Wrong
_firstNameController.text.isEmpty ? 'Not set' : _firstNameController.text

// Correct
user.firstName?.isEmpty == false ? user.firstName! : 'Not set'
```

### Issue: LateInitializationError on controller access
**Solution:** Declare as `final` with immediate initialization, set text in initState
```dart
// Wrong
late TextEditingController _nameController;

// Correct
final TextEditingController _nameController = TextEditingController();

@override
void initState() {
  super.initState();
  _nameController.text = user?.name ?? '';
}
```

### Issue: Form validation not triggering
**Solution:** Ensure validation logic in `_validateForm()` and check error map before submit
```dart
void _validateForm() {
  _validationErrors.clear();
  // Add validation logic
}

Future<void> _saveProfile() async {
  _validateForm();
  if (_validationErrors.isNotEmpty) return;
  // Continue with save
}
```

### Issue: Dropdown not showing selected value
**Solution:** Ensure value matches key exactly (case-sensitive)
```dart
// Make sure user.dietaryPreference matches a key in PreferenceConstants.dietaryPreferences
// e.g., 'vegetarian' not 'Vegetarian'
```

## Testing Checklist

### Manual Testing
- [ ] Profile loads with all user data
- [ ] Edit button switches to edit mode
- [ ] All fields become editable in edit mode
- [ ] Preference dropdowns show correct options
- [ ] Password fields show only in edit mode
- [ ] Save button visible in edit mode
- [ ] Edit button visible in view mode
- [ ] Form validation prevents save (dietary preference empty)
- [ ] Form validation prevents save (passwords don't match)
- [ ] Successful save shows snackbar
- [ ] Profile returns to view mode after save
- [ ] Updated values persist (refresh page)
- [ ] Phone field is read-only
- [ ] Fields display "Not set" when empty

### Edge Cases
- [ ] User with no preferences set
- [ ] Very long delivery address
- [ ] Special characters in names
- [ ] Network error during submission
- [ ] Rapid successive save attempts

## Performance Considerations

1. **TextEditingController Memory**: Properly disposed in widget lifecycle
2. **State Rebuilds**: Only on necessary state changes (not on every keystroke)
3. **Network Calls**: Single Meteor method call per save
4. **UI Responsiveness**: Loading state prevents multiple submissions

## Accessibility

- Form fields have clear labels
- Error messages are semantic and descriptive
- Dropdown options are readable
- Text size is 16pt minimum
- Color contrast is sufficient for light theme

## Future Enhancement Opportunities

1. **Address Validation**: Integrate address lookup API
2. **Masked Inputs**: Use input formatters for pincode
3. **Multi-select Preferences**: Allow multiple dietary preferences
4. **Profile Picture**: Add image upload capability
5. **Address History**: Maintain previously used addresses
6. **Preference Presets**: Quick preset selections

---

**Last Updated:** January 13, 2026
**Version:** 1.0 (Initial Release)
