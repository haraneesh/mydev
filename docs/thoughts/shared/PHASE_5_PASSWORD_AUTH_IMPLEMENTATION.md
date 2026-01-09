# Phase 5: Password Auth Implementation Guide

**Status**: Ready to implement  
**Duration**: 1-2 days  
**Approach**: Reuse Meteor infrastructure

---

## Why Password Auth Instead of OTP?

**Current Issue**: "Failed to request OTP" error when clicking Send OTP
**Root Cause**: MeteorClient not connecting before calling methods
**Solution**: Use simpler password authentication (already built into Meteor)

**Benefits**:
- No SMS/OTP infrastructure needed
- Simpler UX (1 screen instead of 2)
- Meteor handles all password security
- Faster development
- Same security level for app

---

## What You Need to Know

### Password Requirements
- **Minimum**: 4 characters
- **Max**: No limit (Meteor handles it)
- **Special chars**: Not required
- **Example**: "Test@123" or "password" both work

### What Gets Reused
✅ `Accounts` system from Meteor  
✅ `getCurrentUser()` method  
✅ `logout()` method  
✅ Token generation & storage  
✅ Auth persistence  

### What Changes
✏️ Login screen (1 screen, 2 fields: phone + password)  
✏️ Meteor methods (auth.signup + auth.login)  
✏️ AuthService (password methods instead of OTP)  
❌ Delete OTP verification screen  

---

## Implementation Steps

### Step 1: Add Meteor Methods (Backend)

**File**: `imports/api/Users/methods.js`

After line 589 (where OTP methods are), add:

```javascript
'auth.signup': async function signup(data) {
  check(data, { phone: String, password: String });
  
  const { phone, password } = data;
  
  // Validate phone
  if (!phone || phone.length !== 10) {
    throw new Meteor.Error('invalid-phone', 'Phone must be 10 digits');
  }
  
  if (!/^\d{10}$/.test(phone)) {
    throw new Meteor.Error('invalid-phone', 'Phone must contain only digits');
  }
  
  // Validate password
  if (!password || password.length < 4) {
    throw new Meteor.Error('weak-password', 'Password must be at least 4 characters');
  }
  
  try {
    // Check if user already exists
    const existingUser = await Meteor.users.findOneAsync({ username: phone });
    if (existingUser) {
      throw new Meteor.Error('user-exists', 'User already registered');
    }
    
    // Create user with password
    const userId = await Accounts.createUserAsync({
      username: phone,
      password: password,
      profile: {
        phone: phone,
      },
    });
    
    console.log(`[auth.signup] User created: ${phone}`);
    
    return { success: true, userId, message: 'Account created successfully' };
  } catch (error) {
    console.error('[auth.signup] Error:', error);
    if (error.error) throw error;
    throw new Meteor.Error('signup-failed', 'Failed to create account');
  }
},

'auth.login': async function login(data) {
  check(data, { phone: String, password: String });
  
  const { phone, password } = data;
  
  // Validate inputs
  if (!phone || phone.length !== 10) {
    throw new Meteor.Error('invalid-phone', 'Phone must be 10 digits');
  }
  
  if (!password) {
    throw new Meteor.Error('invalid-password', 'Password is required');
  }
  
  try {
    // Find user
    const user = await Meteor.users.findOneAsync({ username: phone });
    if (!user) {
      throw new Meteor.Error('user-not-found', 'User not found');
    }
    
    // Verify password
    const authenticated = await Accounts._checkPasswordAsync(user, password);
    if (!authenticated) {
      throw new Meteor.Error('invalid-credentials', 'Invalid password');
    }
    
    // Generate token
    const token = Accounts._generateLoginToken();
    const hashedToken = Accounts._hashLoginToken(token);
    
    // Store token
    await Meteor.users.updateAsync(
      { _id: user._id },
      {
        $set: {
          'services.resume.loginTokens': [
            {
              when: new Date(),
              hashedToken,
            },
          ],
          'auth.authenticated': true,
          'auth.authenticatedAt': new Date(),
        },
      },
    );
    
    console.log(`[auth.login] User authenticated: ${phone}`);
    
    return {
      token,
      userId: user._id,
      success: true,
    };
  } catch (error) {
    console.error('[auth.login] Error:', error);
    if (error.error) throw error;
    throw new Meteor.Error('login-failed', 'Login failed');
  }
},
```

---

### Step 2: Update AuthService

**File**: `mobile/lib/services/auth_service.dart`

Find and replace the `requestOTP` and `verifyOTP` methods with:

```dart
Future<void> signup(String phone, String password) async {
  if (phone.isEmpty) throw AuthException('Phone is required');
  if (password.isEmpty) throw AuthException('Password is required');
  if (!_isValidPhone(phone)) throw AuthException('Phone must be 10 digits');
  if (password.length < 4) throw AuthException('Password must be at least 4 characters');
  
  try {
    // Ensure connected
    if (!meteorClient.isConnected) {
      await meteorClient.connect();
    }
    
    final response = await meteorClient.call('auth.signup', [
      {'phone': phone, 'password': password}
    ]);
    
    if (response['error'] != null) {
      throw AuthException(response['error'] as String);
    }
  } catch (e) {
    if (e is AuthException) rethrow;
    throw AuthException('Signup failed: $e');
  }
}

Future<void> login(String phone, String password) async {
  if (phone.isEmpty) throw AuthException('Phone is required');
  if (password.isEmpty) throw AuthException('Password is required');
  if (!_isValidPhone(phone)) throw AuthException('Phone must be 10 digits');
  
  try {
    // Ensure connected
    if (!meteorClient.isConnected) {
      await meteorClient.connect();
    }
    
    final response = await meteorClient.call('auth.login', [
      {'phone': phone, 'password': password}
    ]);
    
    if (response['error'] != null) {
      throw AuthException(response['error'] as String);
    }
    
    final token = response['token'] as String?;
    if (token == null || token.isEmpty) {
      throw AuthException('No token received');
    }
    
    _authToken = token;
    await secureStorage.write(key: _tokenKey, value: token);
  } catch (e) {
    if (e is AuthException) rethrow;
    throw AuthException('Login failed: $e');
  }
}
```

Keep these methods unchanged:
- `getCurrentUser()`
- `logout()`
- `restoreToken()`

---

### Step 3: Update AuthProvider

**File**: `mobile/lib/providers/auth_provider.dart`

Replace:

```dart
Future<void> requestOTP(String phone) async {
  _authState = AuthState.authenticating;
  _error = null;
  notifyListeners();

  try {
    await _authService.requestOTP(phone);
    _authState = AuthState.authenticating;
    notifyListeners();
  } catch (e) {
    _authState = AuthState.error;
    _error = e.toString();
    notifyListeners();
    rethrow;
  }
}

Future<void> verifyOTP(String phone, String otp) async {
  _authState = AuthState.authenticating;
  _error = null;
  notifyListeners();

  try {
    await _authService.verifyOTP(phone, otp);
    _currentUser = await _authService.getCurrentUser();
    _authState = AuthState.authenticated;
    notifyListeners();
  } catch (e) {
    _authState = AuthState.error;
    _error = e.toString();
    notifyListeners();
    rethrow;
  }
}
```

With:

```dart
Future<void> signup(String phone, String password) async {
  _authState = AuthState.authenticating;
  _error = null;
  notifyListeners();
  
  try {
    await _authService.signup(phone, password);
    _authState = AuthState.authenticating;
    notifyListeners();
  } catch (e) {
    _authState = AuthState.error;
    _error = e.toString();
    notifyListeners();
    rethrow;
  }
}

Future<void> login(String phone, String password) async {
  _authState = AuthState.authenticating;
  _error = null;
  notifyListeners();
  
  try {
    await _authService.login(phone, password);
    _currentUser = await _authService.getCurrentUser();
    _authState = AuthState.authenticated;
    notifyListeners();
  } catch (e) {
    _authState = AuthState.error;
    _error = e.toString();
    notifyListeners();
    rethrow;
  }
}
```

---

### Step 4: Redesign LoginScreen

This is the biggest change. Replace entire screen with password-based form. See detailed code in: `PHASE_5_PASSWORD_AUTH_TRANSITION.md`

**Key changes**:
- Single screen (no OTP verification screen needed)
- Phone field + Password field
- Toggle between "Create Account" and "Login"
- Show/hide password toggle

---

## Testing After Changes

Use the updated checklist: `/PHASE_5_1_TEST_CHECKLIST.md`

10 new test cases:
1. App launches
2. Phone validation
3. Password validation
4. Sign up - new user
5. Sign up - duplicate user
6. Login - correct credentials
7. Login - wrong password
8. Profile display
9. Logout
10. Auth persistence

---

## Important Notes

### Meteor Connection Fix
The new methods include connection check:
```dart
if (!meteorClient.isConnected) {
  await meteorClient.connect();
}
```

This ensures connection before calling methods.

### Password Storage
Meteor automatically:
- Hashes passwords
- Salts them
- Stores securely
- No plain text ever stored

### Backward Compatibility
OTP methods remain in Meteor:
- Don't delete `auth.requestOTP`
- Don't delete `auth.verifyOTP`
- Can keep or deprecate later

---

## Next Steps

1. ✅ Read this guide
2. ✅ Read PHASE_5_PASSWORD_AUTH_TRANSITION.md for details
3. [ ] Implement Step 1 (Meteor methods)
4. [ ] Implement Step 2 (AuthService)
5. [ ] Implement Step 3 (AuthProvider)
6. [ ] Implement Step 4 (LoginScreen)
7. [ ] Test all 10 test cases
8. [ ] Move to Phase 5.2

---

## Quick Reference

**Meteor password validation**: min 4 chars  
**Phone format**: 10 digits only  
**Login flow**: Phone + Password → Token → Profile  
**Signup flow**: Phone + Password → Create account → Back to login

---

**Ready to start implementing?**

Step 1 (Meteor) is the quickest - just add two methods to methods.js
