# Phase 5: Transition to Password-Based Authentication

**Date**: January 6, 2025  
**Status**: Research Complete - Ready to Implement  
**Approach**: Reuse existing Meteor infrastructure

---

## Findings: Meteor Already Has Password Support

### ✅ Existing Infrastructure

**Meteor Accounts System**:
- Built-in password hashing via `Accounts.setPasswordAsync()`
- Login token generation: `Accounts._generateLoginToken()`
- Token hashing: `Accounts._hashLoginToken()`
- User creation with `Accounts.createUserAsync()`
- All password security handled by Meteor

**Current Methods Available**:
- `auth.requestOTP` → Replace with password signup
- `auth.verifyOTP` → Replace with password login
- `auth.getCurrentUser` → Keep (reuse)
- `auth.logout` → Keep (reuse)

**Password Requirements** (from existing system):
- No minimum length specified (Meteor default is reasonable)
- No special characters required (simple approach)
- No complexity requirements
- Just: `username` (phone) + `password`

### 📊 Architecture Comparison

**Current OTP Flow**:
```
Phone → [RequestOTP] → Server generates 6-digit → [VerifyOTP] → Token → Login
```

**New Password Flow**:
```
Phone + Password → [Signup] → User created with hashed password → [Login] → Token
```

---

## Implementation Plan

### Step 1: Add Password-Based Methods to Meteor

**File**: `imports/api/Users/methods.js`

Add two new methods (don't remove OTP methods yet):

#### Method 1: `auth.signup` - Register user with phone + password

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
}
```

#### Method 2: `auth.login` - Login with phone + password

```javascript
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
    
    // Verify password (Meteor's Accounts._findUserByUsername handles this)
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
}
```

### Step 2: Update Frontend AuthService

**File**: `mobile/lib/services/auth_service.dart`

Replace OTP methods with password methods:

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

Remove:
- `requestOTP()`
- `verifyOTP()`

Keep:
- `getCurrentUser()` - works as-is
- `logout()` - works as-is
- `restoreToken()` - works as-is

### Step 3: Update Frontend AuthProvider

**File**: `mobile/lib/providers/auth_provider.dart`

Replace OTP methods:

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

Remove:
- `requestOTP()`
- `verifyOTP()`

### Step 4: Update LoginScreen

**File**: `mobile/lib/screens/public/login_screen.dart`

Replace entire screen with single phone + password form:

```dart
class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _isLogin = true; // Toggle between login and signup
  String? _errorMessage;
  bool _obscurePassword = true;
  
  // Validation methods...
  String? _validatePhone(String? value) {
    if (value == null || value.isEmpty) {
      return 'Phone is required';
    }
    if (value.length != 10 || !RegExp(r'^[0-9]{10}$').hasMatch(value)) {
      return 'Phone must be 10 digits';
    }
    return null;
  }
  
  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    if (value.length < 4) {
      return 'Password must be at least 4 characters';
    }
    return null;
  }
  
  Future<void> _submit() async {
    if (_validatePhone(_phoneController.text) != null) {
      setState(() => _errorMessage = _validatePhone(_phoneController.text));
      return;
    }
    
    if (_validatePassword(_passwordController.text) != null) {
      setState(() => _errorMessage = _validatePassword(_passwordController.text));
      return;
    }
    
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });
    
    try {
      final authProvider = context.read<AuthProvider>();
      
      if (_isLogin) {
        await authProvider.login(_phoneController.text, _passwordController.text);
      } else {
        await authProvider.signup(_phoneController.text, _passwordController.text);
        // After signup, show login mode
        setState(() => _isLogin = true);
        _passwordController.clear();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Account created! Please login.')),
          );
        }
        return;
      }
      
      // On successful login, navigate to profile
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/profile');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = e.toString().replaceAll('Exception: ', '');
        });
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 40),
            Text(
              _isLogin ? 'Welcome Back' : 'Create Account',
              style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            Text(
              _isLogin ? 'Login to your account' : 'Sign up to get started',
              style: const TextStyle(fontSize: 16, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 48),
            
            // Phone field
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              maxLength: 10,
              enabled: !_isLoading,
              decoration: InputDecoration(
                labelText: 'Phone Number',
                hintText: '9876543210',
                prefixText: '+91 ',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                errorText: _phoneController.text.isNotEmpty
                    ? _validatePhone(_phoneController.text)
                    : null,
                counterText: '',
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 24),
            
            // Password field
            TextField(
              controller: _passwordController,
              obscureText: _obscurePassword,
              enabled: !_isLoading,
              decoration: InputDecoration(
                labelText: 'Password',
                hintText: 'Enter password',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                suffixIcon: IconButton(
                  icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                  onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                ),
                errorText: _passwordController.text.isNotEmpty
                    ? _validatePassword(_passwordController.text)
                    : null,
              ),
              onChanged: (_) => setState(() {}),
            ),
            const SizedBox(height: 8),
            if (_errorMessage != null)
              Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red, fontSize: 16),
              ),
            const SizedBox(height: 32),
            
            // Submit button
            ElevatedButton(
              onPressed: _isLoading ? null : _submit,
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 12.0),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : Text(
                        _isLogin ? 'Login' : 'Sign Up',
                        style: const TextStyle(fontSize: 16),
                      ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Toggle signup/login
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(_isLogin ? "Don't have account? " : 'Already have account? '),
                TextButton(
                  onPressed: _isLoading ? null : () => setState(() => _isLogin = !_isLogin),
                  child: Text(_isLogin ? 'Sign Up' : 'Login'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

### Step 5: Remove OTP Screens

Delete:
- `mobile/lib/screens/public/otp_verification_screen.dart`

---

## Files Changed

### Backend (Meteor)
- ✏️ `imports/api/Users/methods.js` - Add `auth.signup` and `auth.login` methods

### Frontend (Flutter)
- ✏️ `mobile/lib/services/auth_service.dart` - Replace OTP with password methods
- ✏️ `mobile/lib/providers/auth_provider.dart` - Replace OTP methods
- ✏️ `mobile/lib/screens/public/login_screen.dart` - Redesign for password auth
- ❌ `mobile/lib/screens/public/otp_verification_screen.dart` - DELETE

### Configuration
- ✏️ `mobile/lib/main.dart` - Already set to LoginScreen, keep as-is

---

## Password Requirements

**Minimum**: 4 characters  
**Why**: Simple for mobile, matches Meteor conventions  
**No**: Special chars, uppercase required (keep it simple)

---

## Key Differences from OTP

| Aspect | OTP | Password |
|--------|-----|----------|
| Steps | 2 screens | 1 screen |
| User Input | Phone → OTP code | Phone + Password |
| Backend | Generate OTP | Hash password |
| Security | Time-limited code | Hashed + Salted |
| UX | Wait for SMS | Instant submit |
| Error Recovery | Resend OTP | Remember password |

---

## Backward Compatibility

**Keep OTP methods** in Meteor for now:
- Don't delete `auth.requestOTP`, `auth.verifyOTP`
- Users can still use either method
- Can deprecate later if needed

---

## Testing Phase

### Phase 5.1 (Updated)
- **SignUp**: Phone + password → account created
- **Login**: Phone + password → token → profile
- **Logout**: Clear token
- **Persistence**: Token persists on restart

### Phase 5.2
- Integration testing (same as OTP, just different inputs)

### Phase 5.3
- Profile & address management (unchanged)

---

## Implementation Order

1. **Day 1**: Add Meteor methods
2. **Day 1**: Update AuthService
3. **Day 1**: Update AuthProvider
4. **Day 2**: Update LoginScreen
5. **Day 2**: Test signup/login flow
6. **Day 2**: Update documentation

---

## Advantages of This Approach

✅ **Reuses existing Meteor infrastructure**  
✅ **No new packages needed**  
✅ **Simpler UX (1 screen vs 2)**  
✅ **Standard password authentication**  
✅ **Can keep OTP as fallback later**  
✅ **Minimal changes to Phase 5.2 & 5.3**

---

**Status**: Ready to implement  
**Confidence**: High (all infrastructure exists)  
**Time Estimate**: 1-2 days  
**Next Step**: Start implementation
