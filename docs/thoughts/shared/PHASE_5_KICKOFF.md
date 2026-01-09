# Phase 5: User Authentication - Kickoff Guide

**Date**: January 5, 2025  
**Status**: 🚀 **READY TO START**  
**Duration**: 2-3 weeks  
**Complexity**: Medium-High

---

## Why Phase 5 Matters

**Current State**: Users can place orders anonymously
**Problem**: No order history, no user profiles, no saved preferences

**Phase 5 Solution**: Users create accounts and log in
**Benefit**: Personalization, order history, saved data

---

## What Phase 5 Will Deliver

### For Users
- ✅ Create account with phone number
- ✅ Login with phone + OTP
- ✅ Save profile information
- ✅ Save multiple delivery addresses
- ✅ View past orders
- ✅ Auto-fill checkout with saved info
- ✅ Track orders to user account

### For Backend
- ✅ User management
- ✅ Session/token handling
- ✅ Address storage
- ✅ Order-user linking
- ✅ User preferences

---

## High-Level Architecture

```
Mobile App:
├─ AuthProvider (state management)
├─ AuthService (API calls)
├─ LoginScreen (phone entry)
├─ OTPScreen (verification)
├─ ProfileScreen (edit details)
└─ AddressesScreen (saved locations)

Meteor Backend:
├─ Users collection
├─ Addresses collection
├─ Sessions/Tokens
├─ Methods: users.signup, users.verifyOTP, users.getProfile
└─ Publications: user.profile, user.addresses

Database:
├─ Users table/collection
└─ Addresses table/collection
```

---

## Implementation Roadmap

### Week 1: Authentication Core (4 days)
**Day 1-2**: AuthService & Phone/OTP Flow
- [ ] Create AuthService (backend API)
- [ ] Implement LoginScreen (phone entry)
- [ ] Implement OTPScreen (verification)
- [ ] Create Meteor `users.signup` method
- [ ] Create Meteor `users.verifyOTP` method

**Day 3**: State Management
- [ ] Create AuthProvider
- [ ] Implement session/token storage
- [ ] Connect login flow to provider
- [ ] Add auth state persistence

**Day 4**: Testing & Integration
- [ ] Unit tests (10+ tests)
- [ ] Manual testing (signup/login/logout)
- [ ] Error handling (invalid OTP, network errors)

### Week 2: User Profiles (3 days)
**Day 1**: Profile Management
- [ ] Create UserProfile model
- [ ] Create ProfileScreen
- [ ] Implement profile editing
- [ ] Add address management

**Day 2**: Meteor Backend
- [ ] Create `users.getProfile` method
- [ ] Create `users.updateProfile` method
- [ ] Create `addresses.add`, `addresses.delete`, `addresses.setDefault`

**Day 3**: Integration Testing
- [ ] Test profile updates
- [ ] Test address management
- [ ] Verify data persistence

### Week 3: Order Integration (2 days)
**Day 1**: Link Orders to Users
- [ ] Modify orders.create to include userId
- [ ] Create user order history query
- [ ] Create OrderHistoryScreen

**Day 2**: Checkout Enhancement
- [ ] Pre-fill name from profile
- [ ] Show saved addresses dropdown
- [ ] Allow guest checkout option

---

## Detailed Implementation Guide

### Step 1: AuthService (Frontend)
**File**: `lib/services/auth_service.dart`

```dart
class AuthService {
  late MeteorClient _meteorClient;
  
  // Signup with phone, get OTP
  Future<void> requestOTP(String phone) async {
    await _meteorClient.call('users.requestOTP', [phone]);
  }
  
  // Verify OTP, get session token
  Future<String> verifyOTP(String phone, String otp) async {
    final response = await _meteorClient.call('users.verifyOTP', [
      {'phone': phone, 'otp': otp}
    ]);
    return response['token'];
  }
  
  // Get current user profile
  Future<User> getCurrentUser() async { ... }
  
  // Logout
  Future<void> logout() async { ... }
}
```

### Step 2: AuthProvider (State)
**File**: `lib/providers/auth_provider.dart`

```dart
class AuthProvider extends ChangeNotifier {
  User? _currentUser;
  AuthState _state = AuthState.initial;
  late AuthService _authService;
  
  User? get currentUser => _currentUser;
  AuthState get state => _state;
  bool get isAuthenticated => _currentUser != null;
  
  Future<void> signup(String phone) async {
    _state = AuthState.authenticating;
    await _authService.requestOTP(phone);
    notifyListeners();
  }
  
  Future<void> verifyOTP(String phone, String otp) async {
    _state = AuthState.authenticating;
    final token = await _authService.verifyOTP(phone, otp);
    _currentUser = await _authService.getCurrentUser();
    _state = AuthState.authenticated;
    notifyListeners();
  }
  
  Future<void> logout() async {
    await _authService.logout();
    _currentUser = null;
    _state = AuthState.unauthenticated;
    notifyListeners();
  }
}
```

### Step 3: Meteor Backend Methods
**File**: `/imports/api/Users/methods.js` (create new file)

```javascript
Meteor.methods({
  'users.requestOTP': async function(phone) {
    // Validate phone
    // Generate 6-digit OTP
    // Send OTP via SMS (or log for testing)
    // Store OTP with expiry
    return { message: 'OTP sent' };
  },
  
  'users.verifyOTP': async function(data) {
    // Validate phone and OTP
    // Find or create user
    // Generate session token
    // Return token
    return { token, userId };
  },
  
  'users.getProfile': async function() {
    // Return current user profile
  },
  
  'users.updateProfile': async function(profile) {
    // Update user profile
  }
});
```

### Step 4: Screens
**File**: `lib/screens/login_screen.dart`
- Phone number entry
- Submit to requestOTP
- Show "OTP sent" message
- Navigate to OTPScreen

**File**: `lib/screens/otp_screen.dart`
- 6 digit OTP input
- Verify button
- Resend OTP button
- Handle invalid OTP

**File**: `lib/screens/profile_screen.dart`
- Display user info
- Edit name, email
- Manage addresses
- Logout button

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
  final List<Address> addresses;
  final String? defaultAddressId;
}
```

### Address Model
```dart
class Address {
  final String id;
  final String label;
  final String street;
  final String city;
  final String state;
  final String zipCode;
  final bool isDefault;
}
```

### AuthState Enum
```dart
enum AuthState {
  initial,
  authenticating,
  authenticated,
  unauthenticated,
  error
}
```

---

## Testing Strategy

### Unit Tests (15-20 tests)
- AuthService phone validation
- OTP validation
- Token handling
- Error scenarios
- Profile updates

### Integration Tests (5-10 tests)
- Signup → Verification → Profile
- Login → Get Profile → Logout
- Address management
- Session persistence

### Manual Testing
- Full signup flow on emulator
- Login with valid phone
- Update profile
- Save address
- Logout

---

## Success Criteria

### Functionality
- [ ] Users can signup with phone
- [ ] OTP verification works
- [ ] Users can login
- [ ] User profiles work
- [ ] Addresses are saved
- [ ] Orders linked to users
- [ ] Order history shows per user

### Code Quality
- [ ] 0 linting errors
- [ ] 15+ tests passing
- [ ] Good test coverage
- [ ] No commented code
- [ ] Clean architecture

### UX
- [ ] Smooth signup flow
- [ ] Clear error messages
- [ ] Loading states
- [ ] Proper navigation
- [ ] Session persistence

---

## Dependencies & Integration

### What Phase 5 Depends On
- ✅ Phase 4 complete (products, orders)
- ✅ Meteor backend ready
- ✅ MongoDB available

### What Phase 5 Enables
- ✅ Order history tracking
- ✅ User preferences
- ✅ Saved addresses
- ✅ Later: Payment (Phase 6)
- ✅ Later: Notifications (Phase 6)

---

## Challenges & Solutions

### Challenge 1: OTP Delivery
**Risk**: Sending SMS requires third-party service  
**Solution**: Use Twilio or local SMS gateway  
**For Now**: Log OTP to console for testing

### Challenge 2: Session Management
**Risk**: Token expiry and refresh  
**Solution**: Implement refresh token flow  
**Implementation**: Store in secure local storage

### Challenge 3: Phone Format Validation
**Risk**: Different countries use different formats  
**Solution**: Accept basic validation now, enhance later  
**Minimum**: 10 digits minimum

### Challenge 4: OTP Retry Limits
**Risk**: Brute force attacks  
**Solution**: Rate limiting on OTP attempts  
**Implementation**: 3 attempts per hour

---

## Files to Create/Modify

### New Files (8)
- [ ] `lib/services/auth_service.dart` (150 lines)
- [ ] `lib/providers/auth_provider.dart` (120 lines)
- [ ] `lib/screens/login_screen.dart` (180 lines)
- [ ] `lib/screens/otp_screen.dart` (200 lines)
- [ ] `lib/screens/profile_screen.dart` (200 lines)
- [ ] `lib/models/user.dart` (80 lines)
- [ ] `lib/models/address.dart` (60 lines)
- [ ] `test/unit/services/auth_service_test.dart` (250 lines)

### Modified Files (4)
- [ ] `imports/api/Users/methods.js` (200 lines, new)
- [ ] `imports/api/Orders/methods.js` (add userId field)
- [ ] `lib/main.dart` (add AuthProvider)
- [ ] `lib/providers/cart_provider.dart` (track userId in orders)

### Meteor Backend (3)
- [ ] Create Users collection
- [ ] Create Addresses collection
- [ ] Create publications for user data

---

## Quick Start Checklist

### Before Starting
- [ ] Read this kickoff guide
- [ ] Review PHASE_5_PLAN.md (detailed plan)
- [ ] Understand Phase 4.3 completion
- [ ] Set up Meteor for Users collection

### Day 1: Planning
- [ ] Review architecture
- [ ] Design data models
- [ ] Plan screen flows
- [ ] Identify backend methods

### Day 2-3: Implementation
- [ ] Start with AuthService
- [ ] Build LoginScreen
- [ ] Create Meteor methods
- [ ] Write tests as you go

### Day 4+: Integration
- [ ] Connect everything
- [ ] End-to-end testing
- [ ] Fix issues
- [ ] Polish UX

---

## Resources

### Documentation
- PHASE_5_PLAN.md - Full implementation plan
- PHASE_5_IMPLEMENTATION_SUMMARY.md - What will be built

### Code Templates
- OrderService (Phase 4.3) - Reference for service pattern
- CartProvider (Phase 4) - Reference for provider pattern
- OrderService tests - Reference for test patterns

### External References
- Meteor authentication: https://docs.meteor.com/api/accounts.html
- Phone number validation: https://pub.dev/packages/phone_number_parser
- OTP input: https://pub.dev/packages/pin_code_fields

---

## Estimated Effort

| Task | Days | Start | End |
|------|------|-------|-----|
| AuthService + Screens | 2 | Day 1 | Day 2 |
| Meteor backend | 1 | Day 2 | Day 3 |
| Testing | 1.5 | Day 3 | Day 4 |
| Integration | 1 | Day 4 | Day 5 |
| **Total** | **5 days** | | |

**Timeline**: 1 week to MVP, 2-3 weeks for full Phase 5

---

## Next Actions

1. **Today**: Review this kickoff guide
2. **Tomorrow**: Read PHASE_5_PLAN.md for details
3. **Day 3**: Start implementation (AuthService first)
4. **Week 2**: Integration and testing
5. **Week 3**: Polish and deploy

---

## Success Statement

Once Phase 5 is complete:
- Users can create accounts
- Users can log in securely
- Orders are linked to user accounts
- Users see their order history
- Checkout is personalized with saved data

**Result**: Suvai becomes a personalized e-commerce platform with user accounts.

---

**Status**: 🚀 Ready to Start Phase 5  
**Confidence**: High (plan is solid)  
**Risk**: Medium (auth is complex)  
**Timeline**: 2-3 weeks  
**Impact**: High (enables personalization)
