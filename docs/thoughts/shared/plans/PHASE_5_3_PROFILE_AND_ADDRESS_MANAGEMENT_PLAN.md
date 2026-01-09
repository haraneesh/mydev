# Phase 5.3: Profile & Address Management Backend - Implementation Plan

**Phase**: 5.3  
**Status**: 📋 **Planned (After 5.2)**  
**Timeline**: 3-5 days  
**Date Created**: January 6, 2025  
**Complexity**: Medium-High  

---

## Overview

Phase 5.3 completes the user management system by adding backend methods for profile editing and address management. The UI screens are already built in Phase 5.1; this phase adds the missing backend functionality.

**Previous Phases**:
- Phase 5.1: ✅ UI screens, AuthService, AuthProvider, token storage
- Phase 5.2: ✅ Integration testing with Meteor backend

**This Phase**: Backend Methods for User Data Management
- Profile editing backend (name, email, date of birth)
- Address management backend (create, update, delete, set default)
- Integration with checkout screen
- Order-user linking preparation
- Validation and error handling
- Testing and verification

---

## Current State

### ✅ What Works
- Users can login with phone + OTP
- Auth tokens stored securely
- User profile displays (read-only)
- User can logout
- Auth persists on app restart
- All Phase 5.1 tests passing

### ⏳ What's Missing (Phase 5.3)
- Profile editing backend
- Address CRUD operations
- Address validation
- Setting default address
- Checkout screen integration (pre-fill addresses)
- Order-user linking backend
- Tests for address operations

---

## Architecture

### Backend Methods to Implement

```
Meteor Methods (in imports/api/Users/methods.js):

auth.updateProfile({
  userId: String,
  name?: String,
  email?: String,
  dateOfBirth?: Date,
  profileImageUrl?: String
}) → { success: Boolean, user: User }

auth.addAddress({
  userId: String,
  label: String (e.g., "Home", "Work"),
  street: String,
  city: String,
  state: String,
  zipCode: String
}) → { success: Boolean, addressId: String, address: Address }

auth.updateAddress({
  addressId: String,
  label?: String,
  street?: String,
  city?: String,
  state?: String,
  zipCode?: String
}) → { success: Boolean, address: Address }

auth.deleteAddress({
  addressId: String
}) → { success: Boolean }

auth.setDefaultAddress({
  addressId: String
}) → { success: Boolean, user: User }

auth.getAddresses({
  userId: String
}) → { addresses: Address[] }
```

### Frontend Services

**AuthService additions**:
```dart
Future<User> updateProfile(Map<String, dynamic> profileData) async
Future<Address> addAddress(Address address) async
Future<Address> updateAddress(String addressId, Address address) async
Future<void> deleteAddress(String addressId) async
Future<void> setDefaultAddress(String addressId) async
Future<List<Address>> getAddresses() async
```

**AuthProvider additions**:
```dart
Future<void> updateProfile(Map<String, dynamic> profileData) async
Future<void> addAddress(Address address) async
Future<void> updateAddress(String addressId, Address address) async
Future<void> deleteAddress(String addressId) async
Future<void> setDefaultAddress(String addressId) async
```

---

## Data Models

### Address Model (Already exists)
```dart
class Address {
  final String id;
  final String userId;
  final String label;      // 'Home', 'Work', 'Other'
  final String street;
  final String city;
  final String state;
  final String zipCode;
  final bool isDefault;
  final DateTime createdAt;
  final DateTime updatedAt;

  // Validation
  bool isValid() {
    return street.isNotEmpty &&
        city.isNotEmpty &&
        state.isNotEmpty &&
        zipCode.isNotEmpty &&
        zipCode.length == 6;  // Indian zip code format
  }

  // Convert to/from JSON
  Map<String, dynamic> toJson() { ... }
  factory Address.fromJson(Map<String, dynamic> json) { ... }
}
```

### User Model (Extended)
```dart
class User {
  final String id;
  final String phone;
  final String? name;
  final String? email;
  final DateTime? dateOfBirth;
  final String? profileImageUrl;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<Address> addresses;
  final String? defaultAddressId;

  // Helper getters
  Address? get defaultAddress => 
    addresses.firstWhere((a) => a.isDefault, orElse: () => null);

  int get addressCount => addresses.length;

  // Convert to/from JSON
  Map<String, dynamic> toJson() { ... }
  factory User.fromJson(Map<String, dynamic> json) { ... }
}
```

---

## Implementation Steps

### Step 1: Backend Methods (Meteor)
**File**: `imports/api/Users/methods.js`
**Lines**: ~400-500  
**Time**: 1-2 days

#### 1.1: Update Profile Method
```javascript
Meteor.methods({
  'auth.updateProfile': function(profileData) {
    const userId = this.userId;
    if (!userId) throw new Meteor.Error('not-authorized');
    
    const updates = {};
    if (profileData.name) updates.name = profileData.name;
    if (profileData.email) updates.email = profileData.email;
    if (profileData.dateOfBirth) updates.dateOfBirth = new Date(profileData.dateOfBirth);
    if (profileData.profileImageUrl) updates.profileImageUrl = profileData.profileImageUrl;
    
    updates.updatedAt = new Date();
    
    const result = Users.updateOne(
      { _id: userId },
      { $set: updates }
    );
    
    if (result.modifiedCount === 0) throw new Meteor.Error('user-not-found');
    
    return Users.findOne(userId);
  }
});
```

#### 1.2: Add Address Method
```javascript
Meteor.methods({
  'auth.addAddress': function(address) {
    const userId = this.userId;
    if (!userId) throw new Meteor.Error('not-authorized');
    
    // Validation
    if (!address.street || !address.city || !address.state || !address.zipCode) {
      throw new Meteor.Error('invalid-address');
    }
    
    const newAddress = {
      _id: Random.id(),
      userId,
      label: address.label || 'Home',
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = Users.updateOne(
      { _id: userId },
      { $push: { addresses: newAddress } }
    );
    
    return newAddress;
  }
});
```

#### 1.3: Update Address Method
```javascript
Meteor.methods({
  'auth.updateAddress': function(addressId, updates) {
    const userId = this.userId;
    if (!userId) throw new Meteor.Error('not-authorized');
    
    // Ensure user owns this address
    const user = Users.findOne({ _id: userId });
    const address = user.addresses.find(a => a._id === addressId);
    if (!address) throw new Meteor.Error('address-not-found');
    
    // Only allow updating specific fields
    const allowedFields = ['label', 'street', 'city', 'state', 'zipCode'];
    const safeUpdates = {};
    
    allowedFields.forEach(field => {
      if (updates[field]) safeUpdates[field] = updates[field];
    });
    
    safeUpdates.updatedAt = new Date();
    
    const result = Users.updateOne(
      { _id: userId, 'addresses._id': addressId },
      { $set: { 'addresses.$': { ...address, ...safeUpdates } } }
    );
    
    return result;
  }
});
```

#### 1.4: Delete Address Method
```javascript
Meteor.methods({
  'auth.deleteAddress': function(addressId) {
    const userId = this.userId;
    if (!userId) throw new Meteor.Error('not-authorized');
    
    const result = Users.updateOne(
      { _id: userId },
      { $pull: { addresses: { _id: addressId } } }
    );
    
    if (result.modifiedCount === 0) throw new Meteor.Error('address-not-found');
    
    return { success: true };
  }
});
```

#### 1.5: Set Default Address Method
```javascript
Meteor.methods({
  'auth.setDefaultAddress': function(addressId) {
    const userId = this.userId;
    if (!userId) throw new Meteor.Error('not-authorized');
    
    // Ensure address belongs to user
    const user = Users.findOne({ _id: userId });
    const address = user.addresses.find(a => a._id === addressId);
    if (!address) throw new Meteor.Error('address-not-found');
    
    // Update all addresses: clear isDefault, set specific one
    Users.updateOne(
      { _id: userId },
      { 
        $set: { 
          'addresses.$[].isDefault': false,
          defaultAddressId: addressId,
          updatedAt: new Date()
        }
      }
    );
    
    Users.updateOne(
      { _id: userId, 'addresses._id': addressId },
      { $set: { 'addresses.$.isDefault': true } }
    );
    
    return Users.findOne(userId);
  }
});
```

#### 1.6: Get Addresses Method
```javascript
Meteor.methods({
  'auth.getAddresses': function() {
    const userId = this.userId;
    if (!userId) throw new Meteor.Error('not-authorized');
    
    const user = Users.findOne({ _id: userId });
    return user?.addresses || [];
  }
});
```

### Step 2: AuthService Updates (Flutter)
**File**: `lib/services/auth_service.dart`
**Lines**: Add ~150-200 lines  
**Time**: 1 day

```dart
class AuthService {
  // ... existing code ...

  Future<User> updateProfile(Map<String, dynamic> profileData) async {
    try {
      final result = await _meteorClient.callMethod(
        'auth.updateProfile',
        [profileData],
      );
      return User.fromJson(result);
    } catch (e) {
      throw AuthException('Failed to update profile: $e');
    }
  }

  Future<Address> addAddress(Address address) async {
    try {
      final result = await _meteorClient.callMethod(
        'auth.addAddress',
        [address.toJson()],
      );
      return Address.fromJson(result);
    } catch (e) {
      throw AuthException('Failed to add address: $e');
    }
  }

  Future<Address> updateAddress(String addressId, Address address) async {
    try {
      final result = await _meteorClient.callMethod(
        'auth.updateAddress',
        [addressId, address.toJson()],
      );
      return Address.fromJson(result);
    } catch (e) {
      throw AuthException('Failed to update address: $e');
    }
  }

  Future<void> deleteAddress(String addressId) async {
    try {
      await _meteorClient.callMethod(
        'auth.deleteAddress',
        [addressId],
      );
    } catch (e) {
      throw AuthException('Failed to delete address: $e');
    }
  }

  Future<User> setDefaultAddress(String addressId) async {
    try {
      final result = await _meteorClient.callMethod(
        'auth.setDefaultAddress',
        [addressId],
      );
      return User.fromJson(result);
    } catch (e) {
      throw AuthException('Failed to set default address: $e');
    }
  }

  Future<List<Address>> getAddresses() async {
    try {
      final result = await _meteorClient.callMethod(
        'auth.getAddresses',
        [],
      );
      return List<Address>.from(
        result.map((addr) => Address.fromJson(addr))
      );
    } catch (e) {
      throw AuthException('Failed to fetch addresses: $e');
    }
  }
}
```

### Step 3: AuthProvider Updates (Flutter)
**File**: `lib/providers/auth_provider.dart`
**Lines**: Add ~100-150 lines  
**Time**: 1 day

```dart
class AuthProvider extends ChangeNotifier {
  // ... existing code ...

  Future<void> updateProfile(Map<String, dynamic> profileData) async {
    try {
      _authState = AuthState.authenticating;
      notifyListeners();

      _currentUser = await _authService.updateProfile(profileData);
      _authState = AuthState.authenticated;
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      notifyListeners();
      throw AuthException('Profile update failed: $e');
    }
  }

  Future<void> addAddress(Address address) async {
    try {
      if (_currentUser == null) throw AuthException('Not authenticated');

      final newAddress = await _authService.addAddress(address);
      _currentUser = _currentUser!.copyWith(
        addresses: [..._currentUser!.addresses, newAddress]
      );
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      notifyListeners();
      throw AuthException('Failed to add address: $e');
    }
  }

  Future<void> updateAddress(String addressId, Address address) async {
    try {
      if (_currentUser == null) throw AuthException('Not authenticated');

      await _authService.updateAddress(addressId, address);
      
      final updatedAddresses = _currentUser!.addresses
        .map((a) => a.id == addressId ? address : a)
        .toList();
      
      _currentUser = _currentUser!.copyWith(addresses: updatedAddresses);
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      notifyListeners();
      throw AuthException('Failed to update address: $e');
    }
  }

  Future<void> deleteAddress(String addressId) async {
    try {
      if (_currentUser == null) throw AuthException('Not authenticated');

      await _authService.deleteAddress(addressId);
      
      final updatedAddresses = _currentUser!.addresses
        .where((a) => a.id != addressId)
        .toList();
      
      _currentUser = _currentUser!.copyWith(addresses: updatedAddresses);
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      notifyListeners();
      throw AuthException('Failed to delete address: $e');
    }
  }

  Future<void> setDefaultAddress(String addressId) async {
    try {
      if (_currentUser == null) throw AuthException('Not authenticated');

      _currentUser = await _authService.setDefaultAddress(addressId);
      notifyListeners();
    } catch (e) {
      _authState = AuthState.error;
      notifyListeners();
      throw AuthException('Failed to set default address: $e');
    }
  }
}
```

### Step 4: Frontend Integration
**Files**: Already exist from Phase 5.1
- `UserProfileScreen`: Connect edit buttons to new methods
- `SavedAddressesWidget`: Wire up add/edit/delete/default buttons
- `CheckoutScreen`: Pre-fill from default address

### Step 5: Testing
**New test files**:
- `test/unit/services/address_service_test.dart`
- Update `test/unit/providers/auth_provider_test.dart`
- Update `test/unit/screens/user_profile_screen_test.dart`

**Test coverage**:
- [ ] updateProfile method calls correct Meteor method
- [ ] addAddress creates new address
- [ ] updateAddress modifies existing address
- [ ] deleteAddress removes address
- [ ] setDefaultAddress updates default
- [ ] getAddresses returns list
- [ ] All methods handle errors gracefully
- [ ] UI reflects state changes
- [ ] Addresses persist after reload

---

## File Changes Summary

### New Backend Code (Meteor)
```
imports/api/Users/methods.js
├─ auth.updateProfile()          ~40 lines
├─ auth.addAddress()             ~40 lines
├─ auth.updateAddress()          ~40 lines
├─ auth.deleteAddress()          ~30 lines
├─ auth.setDefaultAddress()      ~35 lines
└─ auth.getAddresses()           ~20 lines
Total: ~205 lines
```

### Updated Frontend Code (Flutter)
```
lib/services/auth_service.dart   Add ~180 lines
lib/providers/auth_provider.dart Add ~150 lines
lib/screens/public/user_profile_screen.dart (already exists, wire up)
lib/widgets/saved_addresses_widget.dart (already exists, wire up)
lib/screens/public/checkout_screen.dart (update to use addresses)
```

### New Tests
```
test/unit/services/
├─ address_service_test.dart (~150 lines)

test/unit/providers/
├─ auth_provider_test.dart (extend ~100 lines)

test/unit/screens/
├─ user_profile_screen_test.dart (extend ~80 lines)
└─ checkout_screen_test.dart (update ~50 lines)
```

---

## Success Criteria

### Backend Methods
- [ ] All 6 methods implemented in Meteor
- [ ] All methods have proper authorization checks
- [ ] All methods validate input data
- [ ] All methods return correct response format
- [ ] Error handling for edge cases (user not found, address not found, etc.)
- [ ] Server-side validation of phone format, zip code, etc.

### Frontend Service
- [ ] AuthService methods call correct Meteor methods
- [ ] All methods handle errors and throw AuthException
- [ ] Methods work with real Meteor backend
- [ ] No network errors in normal operation

### Frontend Provider
- [ ] AuthProvider methods update internal state correctly
- [ ] notifyListeners() called after state changes
- [ ] Error state set on failures
- [ ] All methods accessible from UI

### Integration
- [ ] Profile editing works end-to-end
- [ ] Address CRUD works end-to-end
- [ ] CheckoutScreen shows saved addresses
- [ ] Addresses pre-fill in checkout
- [ ] All 20+ tests passing
- [ ] 0 linting errors

### User Experience
- [ ] Loading states during operations
- [ ] Clear error messages on failures
- [ ] Form validation before submit
- [ ] Confirmation before delete
- [ ] Address list displays correctly
- [ ] Default address marked clearly

---

## Timeline Estimate

| Task | Duration | Dependencies |
|------|----------|--------------|
| Backend Methods (Meteor) | 2 days | Phase 5.2 complete |
| AuthService Updates | 1 day | Backend methods done |
| AuthProvider Updates | 1 day | AuthService done |
| Frontend Integration | 1 day | Provider done |
| Testing | 1-2 days | All code done |
| **Total** | **6-7 days** | |

---

## Testing Plan

### Unit Tests
- Service methods call correct Meteor methods
- Provider state updates correctly
- Error handling works
- Data transformations correct

### Integration Tests (Manual)
1. Edit profile (name, email)
   - Changes saved to backend
   - Changes persist on restart
2. Add new address
   - Appears in address list
   - Can set as default
3. Edit existing address
   - Changes saved
   - Reflected in UI
4. Delete address
   - Removed from list
   - Cannot use as default
5. Set default address
   - Marked as default
   - Pre-fills in checkout
6. Multiple addresses
   - All stored correctly
   - Can manage independently
7. Error cases
   - Invalid address format rejected
   - Network errors handled
   - Proper error messages

---

## Known Limitations & Future Work

### Phase 5.3 Scope
- Basic CRUD for addresses
- Profile editing (no image upload)
- Manual address entry (no Google Maps API)

### Future Enhancements (Phase 6+)
- [ ] Address validation with postal code API
- [ ] Google Maps address autocomplete
- [ ] Profile image upload to cloud storage
- [ ] Address history and suggestions
- [ ] One-click re-order with saved address
- [ ] SMS confirmation for address changes

---

## Rollover to Next Phase

After Phase 5.3 complete:
1. All address CRUD working ✅
2. Profile editing working ✅
3. CheckoutScreen integrated ✅
4. Tests passing ✅
5. Ready for Phase 5.4 (Order-User Linking)

**Phase 5.4**: Order-User Linking
- Link orders to authenticated users
- Build order history screen
- Prepare for personalization features

---

## Dependencies & Blockers

### Must Have
- [ ] Phase 5.1 complete (auth core)
- [ ] Phase 5.2 complete (integration testing)
- [ ] Meteor server running

### Depends On
- User model with addresses field
- Address model structure
- Meteor.methods authorization setup

### Blocks
- Phase 5.4 (order linking)
- Phase 6 (personalization)

---

## Checklist for Start

- [ ] Phase 5.2 passing all tests
- [ ] Meteor methods can be modified
- [ ] Flutter services ready to extend
- [ ] Understanding of phase 5.1 architecture
- [ ] Test environment ready

---

**Status**: 📋 **Planned**  
**Start After**: Phase 5.2 complete (Est. Jan 8-9, 2025)  
**Previous Phase**: Phase 5.2 (Integration Testing)  
**Next Phase**: Phase 5.4 (Order-User Linking)  
**Last Updated**: January 6, 2025
