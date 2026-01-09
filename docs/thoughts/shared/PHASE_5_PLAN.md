# Phase 5 Implementation Plan - User Authentication

**Status**: 📋 **Ready to Plan**  
**Timeline**: 2-3 weeks  
**Complexity**: High  
**Date Created**: January 5, 2025

---

## Overview

Phase 5 adds user authentication to the Suvai app, enabling personalized user experiences, order history tracking, and saved preferences. This phase bridges from anonymous orders to user-based accounts.

---

## Phase 5 Breakdown

### Objective
Enable users to create accounts, log in, and access personalized features while maintaining backward compatibility with guest checkout.

### Key Features
- Phone number-based signup/login
- OTP verification
- User profile management
- Order history tracking
- Saved addresses
- User preferences

---

## Architecture: AuthProvider & AuthService

### New Components

```
AuthService (handles backend communication)
  ├─ signup(phone: String)
  ├─ verifyOTP(phone: String, otp: String)
  ├─ login(phone: String)
  ├─ logout()
  ├─ getCurrentUser()
  └─ updateProfile(profile: UserProfile)

AuthProvider (state management)
  ├─ User? currentUser
  ├─ AuthState (authenticated, unauthenticated, loading)
  ├─ String? authToken
  ├─ Methods: signup(), verifyOTP(), login(), logout()
  └─ Emits: authStateChanges() stream

UserProfileService (profile operations)
  ├─ getProfile(userId: String)
  ├─ updateProfile(profile: UserProfile)
  ├─ addAddress(address: Address)
  ├─ getAddresses(userId: String)
  └─ setDefaultAddress(addressId: String)
```

### Updated Components

```
CartProvider (changes)
  ├─ Add userId field (optional for guests)
  ├─ Update placeOrder() to include userId
  └─ Track user orders

HomeScreen (changes)
  ├─ Show user greeting if authenticated
  ├─ Show login button if not authenticated
  └─ Update header with user info

CheckoutScreen (changes)
  ├─ Pre-fill customer name from profile
  ├─ Show saved addresses dropdown
  ├─ Allow saving new address
  └─ Allow guest checkout option
```

---

## Data Models

### User Model
```dart
class User {
  final String id;
  final String phone;
  final String? name;
  final String? email;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<String> addressIds;
  final String? defaultAddressId;
}
```

### UserProfile Model
```dart
class UserProfile {
  final String userId;
  final String phone;
  final String name;
  final String? email;
  final String? profileImageUrl;
  final DateTime? dateOfBirth;
  final List<Address> addresses;
}
```

### Address Model
```dart
class Address {
  final String id;
  final String userId;
  final String label; // 'Home', 'Work', etc.
  final String street;
  final String city;
  final String state;
  final String zipCode;
  final bool isDefault;
}
```

### AuthState Model
```dart
enum AuthState {
  initial,
  unauthenticated,
  authenticating,
  authenticated,
  error,
}

class AuthException implements Exception {
  final String message;
  final String? code;
  
  AuthException(this.message, {this.code});
}
```

---

## Implementation Steps

### Step 1: Create AuthService (Day 1)
**File**: `lib/services/auth_service.dart` (~200 lines)

```dart
class AuthService {
  late MeteorClient _meteorClient;
  String? _authToken;
  
  Future<void> signup(String phone) async {
    // Call Meteor method: 'auth.signup'
    // Sends OTP to phone
    // Returns nothing (OTP sent)
  }
  
  Future<String> verifyOTP(String phone, String otp) async {
    // Call Meteor method: 'auth.verifyOTP'
    // Returns auth token if valid
  }
  
  Future<String> login(String phone) async {
    // Call Meteor method: 'auth.login'
    // Sends OTP for login
    // (Can reuse same flow as signup)
  }
  
  Future<void> logout() async {
    // Clear local auth token
    // Call Meteor method: 'auth.logout'
  }
  
  Future<User?> getCurrentUser() async {
    // Fetch user profile from Meteor
    // Using stored auth token
  }
}
```

### Step 2: Create AuthProvider (Day 2)
**File**: `lib/providers/auth_provider.dart` (~250 lines)

```dart
class AuthProvider extends ChangeNotifier {
  User? _currentUser;
  AuthState _authState = AuthState.initial;
  String? _authToken;
  late AuthService _authService;
  
  User? get currentUser => _currentUser;
  AuthState get authState => _authState;
  bool get isAuthenticated => _currentUser != null;
  
  Future<void> signup(String phone) async {
    _authState = AuthState.authenticating;
    notifyListeners();
    
    try {
      await _authService.signup(phone);
      // Emit OTP verification needed
    } catch (e) {
      _authState = AuthState.error;
      notifyListeners();
      throw AuthException(e.toString());
    }
  }
  
  Future<void> verifyOTP(String phone, String otp) async {
    try {
      _authToken = await _authService.verifyOTP(phone, otp);
      _currentUser = await _authService.getCurrentUser();
      _authState = AuthState.authenticated;
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      notifyListeners();
      throw AuthException(e.toString());
    }
  }
  
  Future<void> logout() async {
    await _authService.logout();
    _currentUser = null;
    _authToken = null;
    _authState = AuthState.unauthenticated;
    notifyListeners();
  }
}
```

### Step 3: Create LoginScreen (Day 2)
**File**: `lib/screens/public/login_screen.dart` (~300 lines)

```dart
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  bool _isLoading = false;
  String? _step; // 'phone' or 'otp'
  String? _phone;
  
  // Step 1: Enter phone number
  // Step 2: Verify OTP
  // Step 3: Complete profile (optional)
}
```

### Step 4: Create OTP Verification Screen (Day 3)
**File**: `lib/screens/public/otp_verification_screen.dart` (~250 lines)

```dart
class OTPVerificationScreen extends StatefulWidget {
  final String phone;
  
  const OTPVerificationScreen({required this.phone, super.key});
}

// Features:
// - 6 OTP input fields
// - Resend OTP button (with cooldown)
// - Countdown timer
// - Auto-submit on 6 digits
// - Error handling for invalid OTP
```

### Step 5: Create UserProfileScreen (Day 4)
**File**: `lib/screens/public/user_profile_screen.dart` (~400 lines)

```dart
class UserProfileScreen extends StatefulWidget {
  const UserProfileScreen({super.key});
}

// Features:
// - Display user info
// - Edit profile button
// - Manage addresses
// - View order history
// - Logout button
// - Account settings
```

### Step 6: Create SavedAddressesWidget (Day 4)
**File**: `lib/widgets/saved_addresses_widget.dart` (~250 lines)

```dart
class SavedAddressesWidget extends StatefulWidget {
  final List<Address> addresses;
  final Function(Address) onSelectAddress;
  
  const SavedAddressesWidget({
    required this.addresses,
    required this.onSelectAddress,
  });
}

// Features:
// - Display all saved addresses
// - Select address
// - Add new address
// - Edit address
// - Delete address
// - Set default address
```

### Step 7: Update CheckoutScreen (Day 5)
**File**: `lib/screens/public/checkout_screen.dart` (modify existing)

```dart
// Changes:
// - Show LoginPrompt if not authenticated
// - Show SavedAddresses dropdown if authenticated
// - Pre-fill name from profile
// - Allow adding new address
// - Allow guest checkout
```

### Step 8: Create AuthStateService (Day 5)
**File**: `lib/services/auth_state_service.dart` (~150 lines)

```dart
class AuthStateService {
  // Handle persistent auth storage
  // Load auth token from SharedPreferences on app start
  // Save token after login
  // Clear token after logout
  // Handle token refresh
}
```

### Step 9: Update main.dart (Day 5)
```dart
// Add AuthProvider to MultiProvider
// Restore auth state on app start
// Update navigation based on auth state
```

### Step 10: Write Tests (Day 6)
- AuthService tests: 12 tests
- AuthProvider tests: 15 tests
- LoginScreen tests: 8 tests
- OTPVerificationScreen tests: 8 tests
- UserProfileScreen tests: 10 tests
- SavedAddressesWidget tests: 8 tests
- Integration tests: 6 tests

**Total**: ~70 new tests

---

## Screens Layout

### LoginScreen Flow
```
LoginScreen
├─ Phone Number Input
├─ "Send OTP" Button
├─ "Guest Checkout" Link
└─ "Terms & Conditions" Link
```

### OTPVerificationScreen Flow
```
OTPVerificationScreen
├─ Phone Number (display)
├─ OTP Input (6 fields)
├─ Countdown Timer
├─ "Resend OTP" Button (disabled until timer)
├─ "Verify" Button
└─ "Change Number" Link
```

### UserProfileScreen Flow
```
UserProfileScreen
├─ User Avatar
├─ User Name
├─ Phone Number
├─ "Edit Profile" Button
│
├─ Saved Addresses Section
│  ├─ Default Address Highlight
│  ├─ "Add Address" Button
│  └─ Address Cards (with edit/delete)
│
├─ Order History Section
│  ├─ Recent Orders List
│  └─ "View All Orders" Link
│
├─ Settings Section
│  ├─ Notifications Toggle
│  ├─ Email Notifications Toggle
│  └─ Privacy Settings Link
│
└─ "Logout" Button
```

---

## Meteor Backend Requirements

### Collections Needed

**Users Collection**
```javascript
{
  _id: ObjectId,
  phone: String (unique),
  name: String,
  email: String,
  profileImageUrl: String,
  createdAt: Date,
  updatedAt: Date,
}
```

**Addresses Collection**
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  label: String, // 'Home', 'Work', etc.
  street: String,
  city: String,
  state: String,
  zipCode: String,
  isDefault: Boolean,
  createdAt: Date,
  updatedAt: Date,
}
```

### Methods Needed

```javascript
// Authentication
Meteor.methods({
  'auth.signup'(phone) {
    // Create user if not exists
    // Generate and send OTP
    // Return { success: true }
  },
  
  'auth.verifyOTP'(phone, otp) {
    // Verify OTP
    // If valid, generate auth token
    // Return { token: 'xxx', userId: 'xxx' }
  },
  
  'auth.logout'() {
    // Invalidate current token
    // Log logout event
  },
});

// User Profile
Meteor.methods({
  'user.getProfile'(userId) {
    // Return user with addresses
  },
  
  'user.updateProfile'(profile) {
    // Update user info
    // Validate inputs
  },
  
  'address.add'(address) {
    // Add new address
    // Validate address
  },
  
  'address.delete'(addressId) {
    // Delete address
    // Check ownership
  },
  
  'address.setDefault'(addressId) {
    // Set as default
  },
});
```

### Publications Needed

```javascript
Meteor.publish('user.profile', function(userId) {
  return Users.find({ _id: userId });
});

Meteor.publish('user.addresses', function(userId) {
  return Addresses.find({ userId });
});

Meteor.publish('user.orders', function(userId) {
  return Orders.find({ userId });
});
```

---

## Test Strategy

### Unit Tests (60 tests)
- AuthService methods (12)
- AuthProvider state management (15)
- OTP validation logic (6)
- Profile validation (8)
- Address validation (6)
- Token management (7)

### Widget Tests (40 tests)
- LoginScreen interactions (8)
- OTPVerificationScreen inputs (8)
- UserProfileScreen display (10)
- SavedAddressesWidget list (8)
- AddAddressForm validation (6)

### Integration Tests (8 tests)
- Full signup → verification → profile → order flow
- Login → order history → logout flow
- Update profile flow
- Save address during checkout flow

**Total**: ~108 new tests

---

## Success Criteria

### Functional
- [ ] User can signup with phone number
- [ ] OTP verification works correctly
- [ ] User profile displays after login
- [ ] Saved addresses work
- [ ] Can add/edit/delete addresses
- [ ] Logout clears all data
- [ ] Guest checkout still works
- [ ] Order history shows user's orders
- [ ] Login persists across app restart

### Quality
- [ ] 108+ tests written
- [ ] 100% test pass rate
- [ ] 0 linting errors
- [ ] Code coverage > 80%
- [ ] No memory leaks

### Performance
- [ ] Login flow < 2 seconds
- [ ] OTP verification < 1 second
- [ ] Profile loading < 500ms
- [ ] Address list renders smoothly
- [ ] Order history pagination works

### User Experience
- [ ] Clear error messages
- [ ] Proper loading indicators
- [ ] Smooth transitions between screens
- [ ] Accessible form inputs
- [ ] Password-less (OTP) authentication

---

## Security Considerations

### OTP Handling
- OTP sent via SMS, not displayed in logs
- OTP valid for 10 minutes
- Max 3 retry attempts before rate limit
- Rate limit 5 minutes
- OTP cannot be reused

### Token Management
- Auth token stored securely (flutter_secure_storage)
- Token refresh on expiry (auto-handled)
- Logout immediately invalidates token
- Token not logged or exposed

### Data Protection
- Phone number hashed on server
- Addresses encrypted in transit (HTTPS/WSS)
- User data isolated by userId
- Server-side authorization checks

---

## File Structure

### New Files
```
lib/screens/public/
├─ login_screen.dart           (~300 lines)
├─ otp_verification_screen.dart (~250 lines)
└─ user_profile_screen.dart    (~400 lines)

lib/widgets/
├─ saved_addresses_widget.dart (~250 lines)
├─ add_address_form.dart       (~200 lines)
└─ otp_input_widget.dart       (~150 lines)

lib/services/
├─ auth_service.dart           (~200 lines)
└─ auth_state_service.dart     (~150 lines)

lib/providers/
└─ auth_provider.dart          (~250 lines)

lib/models/
├─ user.dart                   (new)
└─ address.dart                (new)

test/unit/services/
├─ auth_service_test.dart      (~200 lines)
└─ auth_state_service_test.dart (~120 lines)

test/unit/providers/
└─ auth_provider_test.dart     (~250 lines)

test/unit/screens/
├─ login_screen_test.dart      (~150 lines)
├─ otp_verification_screen_test.dart (~150 lines)
└─ user_profile_screen_test.dart (~180 lines)

test/unit/widgets/
├─ saved_addresses_widget_test.dart (~120 lines)
├─ add_address_form_test.dart  (~100 lines)
└─ otp_input_widget_test.dart  (~100 lines)
```

### Modified Files
```
lib/screens/public/
├─ home_screen.dart            (add user greeting)
├─ checkout_screen.dart        (add saved addresses)
└─ cart_screen.dart            (optional: show user info)

lib/main.dart                   (add AuthProvider, restore auth)

pubspec.yaml                    (add packages)

test/unit/screens/
├─ checkout_screen_test.dart   (update tests)
└─ home_screen_test.dart       (update tests)
```

---

## Dependencies

```yaml
dependencies:
  # Security
  flutter_secure_storage: ^9.0.0

  # OTP UI
  pin_code_fields: ^8.0.0

  # Date picker (for profile)
  intl: ^0.18.0

  # Phone validation
  phone_numbers_parser: ^3.0.0

  # Already have
  provider: ^6.1.5
  shared_preferences: ^2.2.2
  meteor_client: ^1.0.0
```

---

## Timeline Estimate

| Task | Duration | Start | End |
|------|----------|-------|-----|
| AuthService | 1 day | Week 1 | Week 1 |
| AuthProvider | 1 day | Week 1 | Week 1 |
| LoginScreen | 1 day | Week 1 | Week 1 |
| OTPVerificationScreen | 1 day | Week 1 | Week 1 |
| UserProfileScreen | 1.5 days | Week 2 | Week 2 |
| SavedAddresses | 1 day | Week 2 | Week 2 |
| CheckoutScreen updates | 1 day | Week 2 | Week 2 |
| AuthStateService | 0.5 days | Week 2 | Week 2 |
| main.dart updates | 0.5 days | Week 2 | Week 2 |
| Testing | 2 days | Week 2-3 | Week 3 |
| Integration & Debug | 2 days | Week 3 | Week 3 |
| **Total** | **~13 days** | | |

---

## Rollout Checklist

### Before Implementation
- [ ] Meteor SMS service configured
- [ ] User & Address collections created
- [ ] Auth methods implemented on backend
- [ ] flutter_secure_storage setup
- [ ] OTP templates approved

### During Implementation
- [ ] AuthService working with mock OTP
- [ ] LoginScreen form validation working
- [ ] OTP input widget created & tested
- [ ] UserProfileScreen displaying data
- [ ] Address management working
- [ ] CheckoutScreen showing saved addresses
- [ ] Auth persistence working
- [ ] All 108+ tests passing

### After Implementation
- [ ] Staging server setup
- [ ] SMS service tested in staging
- [ ] Full signup-to-order flow tested
- [ ] Performance verified
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Team trained on new features

---

## What Comes Next

### Phase 6: Advanced Features
- Product images from cloud storage
- Payment integration (Razorpay/Stripe)
- Real-time order tracking
- Ratings & reviews
- Push notifications

---

## Key Decisions

### Decision 1: OTP-based Authentication
**Why**: No passwords to remember, better security, works globally

### Decision 2: Phone as Primary Identifier
**Why**: Can use for SMS, verification, delivery contact

### Decision 3: Saved Addresses
**Why**: Faster checkout, personalization, common user expectation

### Decision 4: Guest Checkout Option
**Why**: Don't force signup, optional authentication

---

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│        User Interface                   │
│  LoginScreen, UserProfileScreen, etc.  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   State Management                      │
│   AuthProvider (ChangeNotifier)         │
│   CartProvider (updated)                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Services Layer                        │
│   AuthService (auth operations)         │
│   AuthStateService (persistence)        │
│   UserProfileService (profile)          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Backend                               │
│   Meteor Server                         │
│   - Users collection                    │
│   - Addresses collection                │
│   - Auth methods                        │
└─────────────────────────────────────────┘
```

---

## Common Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| SMS delivery delays | Show countdown, auto-retry, resend button |
| Invalid phone numbers | Use phone_numbers_parser, validate format |
| Token expiry | Auto-refresh in background, handle gracefully |
| User switches devices | Require reverification on new device |
| Lost phone (account recovery) | Email as secondary verification |
| Rate limiting | Implement server-side rate limits |

---

## Resources

### Documentation
- [Flutter Secure Storage](https://pub.dev/packages/flutter_secure_storage)
- [Pin Code Fields](https://pub.dev/packages/pin_code_fields)
- [Phone Numbers Parser](https://pub.dev/packages/phone_numbers_parser)

### Meteor Resources
- [Meteor Accounts System](https://docs.meteor.com/api/accounts.html)
- [Meteor Methods](https://docs.meteor.com/api/methods.html)
- [Email/SMS services](https://docs.meteor.com/api/email.html)

---

## Conclusion

Phase 5 transforms Suvai from a guest-only ordering app to a full user platform. With authentication, users can:
- Access personalized features
- Track order history
- Save preferences
- Enjoy faster checkout

The architecture is designed to be extensible for future features like loyalty programs, recommendations, and premium features.

---

**Status**: 📋 **Ready to Implement**  
**Next**: Phase 5.1 (AuthService & AuthProvider)  
**Last Updated**: January 5, 2025
