# Phase 5.2: Integration Testing - Password Authentication

**Phase**: 5.2  
**Status**: 🚀 **Ready to Start**  
**Timeline**: 2-3 days  
**Date Created**: January 6, 2025  
**Complexity**: Medium  
**Auth Approach**: Password-based (not OTP)

---

## Overview

Phase 5.2 focuses on testing the password authentication system with the real Meteor backend. Phase 5.1 implementation is complete—all services, providers, and UI screens are built for password auth. Now we verify everything works end-to-end.

**Previous Phase (5.1)**: ✅ COMPLETE
- AuthService with password methods (signup/login)
- AuthProvider state management
- Single unified LoginScreen (no OTP verification needed)
- UserProfileScreen
- Meteor backend methods (auth.signup, auth.login, auth.getCurrentUser, auth.logout)
- Secure token storage
- Error handling and validation
- Code compiles with 0 errors

**This Phase (5.2)**: Integration & Testing
- Test with real Meteor backend
- Verify password auth flow end-to-end
- Test token storage and retrieval
- Test auth persistence on app restart
- Fix any integration issues
- Verify all 10 core test cases pass
- Prepare for Phase 5.3 (profile/address management)

---

## Success Criteria

### Automated Tests (Must Pass)
- [ ] All unit tests pass (run `flutter test`)
- [ ] All widget tests pass
- [ ] 0 linting errors (`flutter analyze`)
- [ ] Code compiles without warnings
- [ ] All auth methods callable from Flutter

### Integration Tests (Manual) - Password Auth Flow
- [ ] Phone validation works (empty, invalid, valid)
- [ ] Password validation works (empty, too short, valid)
- [ ] Sign up creates new account
- [ ] Sign up prevents duplicate users
- [ ] Login succeeds with correct credentials
- [ ] Login fails with wrong password
- [ ] Token stored securely after login
- [ ] Token retrieved on app restart
- [ ] Auth state persists on app restart
- [ ] Logout clears token and auth state
- [ ] User profile displays after login
- [ ] Error messages clear and helpful
- [ ] Network errors handled gracefully

### Backend Integration
- [ ] Meteor server running at `http://10.0.2.2:3000`
- [ ] All 4 auth methods working (signup, login, getCurrentUser, logout)
- [ ] Password hashing working (no plain text in DB)
- [ ] Rate limiting working
- [ ] Session management correct

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│              Login Screen (Single)               │
│  ┌──────────────────────────────────────────┐  │
│  │ Toggle: Create Account / Login           │  │
│  │ Phone: [10-digit input]                  │  │
│  │ Password: [password input with toggle]   │  │
│  │ [Sign Up / Login Button]                 │  │
│  └──────────────────────────────────────────┘  │
└─────────────┬───────────────────────────────────┘
              │
    ┌─────────▼─────────┐
    │  AuthProvider     │
    │  signup() / login()
    └─────────┬─────────┘
              │
    ┌─────────▼──────────┐
    │  AuthService       │
    │  Meteor.call()     │
    └─────────┬──────────┘
              │
    ┌─────────▼──────────────────────────────┐
    │  Meteor Server                         │
    │  auth.signup(phone, password)          │
    │  auth.login(phone, password)           │
    │  → Validate → Hash → Store token       │
    └─────────┬──────────────────────────────┘
              │
    ┌─────────▼──────────┐
    │  Token Returned    │
    │  Store in          │
    │  flutter_secure_   │
    │  storage           │
    └─────────┬──────────┘
              │
    ┌─────────▼────────────────────┐
    │  User Profile Screen         │
    │  Display phone               │
    │  Show logout button          │
    └──────────────────────────────┘
```

---

## Test Plan

### 1. Unit Tests (Automated)

**File**: `test/unit/services/auth_service_test.dart`
- [ ] AuthService initialization
- [ ] signup calls Meteor method correctly
- [ ] login calls Meteor method correctly
- [ ] signup throws on invalid phone
- [ ] signup throws on weak password
- [ ] login throws on invalid credentials
- [ ] getCurrentUser returns user data
- [ ] logout clears token
- [ ] Token persistence in secure storage

**File**: `test/unit/providers/auth_provider_test.dart`
- [ ] Initial auth state is unauthenticated
- [ ] signup changes state to authenticating, then back
- [ ] login changes state to authenticating, then authenticated
- [ ] logout changes state to unauthenticated
- [ ] currentUser populated after login
- [ ] Error state set on signup failure
- [ ] Error state set on login failure

**File**: `test/unit/screens/login_screen_test.dart`
- [ ] Phone input validation (empty, invalid, valid)
- [ ] Password input validation (empty, too short, valid)
- [ ] Mode toggle works (Create Account ↔ Login)
- [ ] Sign Up button disabled until valid inputs
- [ ] Login button disabled until valid inputs
- [ ] Sign Up calls AuthProvider.signup()
- [ ] Login calls AuthProvider.login()
- [ ] Error message displays on failure
- [ ] Loading state shows spinner

**File**: `test/unit/screens/user_profile_screen_test.dart`
- [ ] User data displays correctly
- [ ] Phone number shown
- [ ] Logout button visible
- [ ] Logout calls AuthProvider.logout()
- [ ] Navigation to login after logout

### 2. Integration Tests (Manual)

**Test Case 1: Sign Up - New User**
1. Start app
2. Ensure "Create Account" mode selected
3. Enter phone: `9876543210`
4. Enter password: `Test@123`
5. Tap "Sign Up"
   - Expected: Loading spinner → "Account created" message → Form clears → Switches to Login mode
6. Verify in Meteor logs: `[auth.signup] User created: 9876543210`

**Test Case 2: Sign Up - Duplicate User**
1. Toggle to "Create Account"
2. Enter same phone: `9876543210`
3. Enter password: `Test@123`
4. Tap "Sign Up"
   - Expected: Error message "User already registered"
   - Expected: Form remains (no navigation)

**Test Case 3: Login - Correct Credentials**
1. Ensure "Login" mode selected
2. Enter phone: `9876543210`
3. Enter password: `Test@123`
4. Tap "Login"
   - Expected: Loading spinner → User profile displays
5. Verify phone number shown on profile
6. Verify Meteor logs: `[auth.login] User authenticated: 9876543210`

**Test Case 4: Login - Wrong Password**
1. Enter phone: `9876543210`
2. Enter wrong password: `WrongPass123`
3. Tap "Login"
   - Expected: Error message "Invalid password"
   - Expected: Login screen remains (no navigation)
   - Can try again

**Test Case 5: Login - Non-existent User**
1. Enter phone: `1234567890` (different phone)
2. Enter password: `anything`
3. Tap "Login"
   - Expected: Error message "User not found"

**Test Case 6: Phone Validation**
1. Enter invalid phone: `abc`
2. Tap Login/SignUp button
   - Expected: Button disabled or shows error "Phone must be 10 digits"
3. Enter partial phone: `123`
4. Same result

**Test Case 7: Password Validation**
1. Enter valid phone: `9876543210`
2. Enter short password: `123` (< 4 chars)
3. Tap Sign Up
   - Expected: Error message "Password must be at least 4 characters"

**Test Case 8: Auth Persistence**
1. Complete login (Test Case 3)
2. User on profile screen
3. Force close app completely
4. Restart app
   - Expected: Profile screen displays (not login)
   - Expected: Phone number still shown
   - Expected: Token was persisted in secure storage

**Test Case 9: Logout & Clear State**
1. Logged-in user on profile screen
2. Tap "Logout"
   - Expected: Navigation to login screen
   - Expected: Token cleared from secure storage
3. Force close app
4. Restart app
   - Expected: Login screen displays (not profile)

**Test Case 10: Password Show/Hide Toggle**
1. On login screen
2. In password field, tap show/hide icon
   - Expected: Password text becomes visible
   - Expected: Icon changes
3. Tap again
   - Expected: Password masked again

---

## Debugging Checklist

### If Sign Up Fails

**Check Meteor Server**
```bash
# Terminal: Verify Meteor is running
meteor npm start
# Should show: "Started MongoDB", "Started server"
# Should show no errors
```

**Check Meteor Logs**
- Look for `[auth.signup]` messages
- Check for validation errors
- Check for permission errors
- Verify method exists: `auth.signup`

**Check Network Connection**
- Flutter console should show no connection errors
- Verify MeteorClient is initialized in AuthService
- Check connection endpoint: `http://10.0.2.2:3000`

### If Login Fails

**Check User Exists**
- Verify sign up completed first
- Check Meteor DB that user was created
- Verify username is phone number

**Check Password Hashing**
- Ensure password is being hashed on server
- Don't check plain text password

**Check Token Generation**
- Verify token returned from login method
- Check that token is valid format

### If Token Not Stored

**Check Secure Storage Setup**
```dart
// Add debug logging in AuthService
print('Storing token: $token');
final stored = await _storage.read(key: 'auth_token');
print('Retrieved token: $stored');
```

**Check Permissions**
- Android: Check `AndroidManifest.xml` for storage permissions
- iOS: Check entitlements file

### If Auth Doesn't Persist on Restart

**Check Token Restoration**
- Verify `restoreToken()` called in `main.dart`
- Check AuthProvider initialization timing
- Verify secure storage read is awaited

**Check State Restoration**
- Print state during app startup
- Verify getCurrentUser called with token
- Check timing of AuthProvider setup vs UI render

---

## Phase 5.2 Checklist

### Pre-Testing Setup
- [ ] Read the testing plan above
- [ ] Ensure Meteor server is running
- [ ] Clear any old test data (reset MongoDB if needed)
- [ ] Verify Flutter environment ready
- [ ] Have Meteor logs visible in terminal

### Code Verification
- [ ] Verify auth.signup method exists in Meteor
- [ ] Verify auth.login method exists in Meteor
- [ ] Verify password hashing logic in place
- [ ] Verify token generation logic in place

### Automated Testing
- [ ] Run `flutter test` → All tests pass
- [ ] Run `flutter analyze` → 0 errors
- [ ] Verify code compiles cleanly

### Manual Integration Testing
- [ ] Test Case 1: Sign up new user
- [ ] Test Case 2: Sign up duplicate user
- [ ] Test Case 3: Login correct credentials
- [ ] Test Case 4: Login wrong password
- [ ] Test Case 5: Login non-existent user
- [ ] Test Case 6: Phone validation
- [ ] Test Case 7: Password validation
- [ ] Test Case 8: Auth persistence on restart
- [ ] Test Case 9: Logout clears state
- [ ] Test Case 10: Password show/hide toggle

### Bug Fixes & Issues
- [ ] Document any failures
- [ ] Fix AuthService issues
- [ ] Fix AuthProvider issues
- [ ] Fix UI/UX issues
- [ ] Fix backend issues
- [ ] Update tests if needed

### Code Quality
- [ ] 0 linting errors
- [ ] All tests passing
- [ ] Code compiles without warnings
- [ ] Error messages clear and helpful
- [ ] No console spam or debug logs

### Documentation Updates
- [ ] Update PHASE_5_STATUS.md with test results
- [ ] Document any issues found
- [ ] Document workarounds if needed
- [ ] Update troubleshooting guide

---

## Common Issues & Solutions

### Issue 1: "Connection refused" error
**Cause**: Meteor server not running or wrong address
**Solution**: 
- Start Meteor: `cd /Users/charaneesh/Stuff/mydev-flutter && meteor npm start`
- Verify address: `http://10.0.2.2:3000` (Android emulator) or `http://localhost:3000` (iOS)
- Check firewall settings

### Issue 2: "User already registered" always appears
**Cause**: Previous test user still in database
**Solution**:
- Reset MongoDB: `meteor reset`
- Or delete specific user from Meteor console
- Restart Meteor and try different phone number

### Issue 3: "Invalid password" even with correct one
**Cause**: Password not hashing correctly or comparison wrong
**Solution**:
- Verify `Accounts._checkPasswordAsync()` used correctly
- Check that password is trimmed (no spaces)
- Verify user password field exists and populated

### Issue 4: Token not stored in secure storage
**Cause**: Secure storage permission issue or not awaited
**Solution**:
- Check secure storage initialization in AuthService
- Add debug logging to verify token returned from server
- Verify permissions in manifest/entitlements
- Ensure `await` on secure storage write

### Issue 5: Auth doesn't persist on app restart
**Cause**: Token not read during app initialization
**Solution**:
- Check if AuthProvider restores token in constructor
- Add `restoreToken()` call in `main.dart` initialization
- Verify secure storage read is awaited
- Check timing of AuthProvider setup vs UI rendering

### Issue 6: "No token received" error
**Cause**: Meteor method not returning token
**Solution**:
- Verify `auth.login` method returns `{token, userId, success}`
- Check that token is generated with `Accounts._generateLoginToken()`
- Verify token is returned before user document updated

### Issue 7: Network timeouts
**Cause**: Slow connection or Meteor not responding
**Solution**:
- Check Meteor logs for errors
- Verify WebSocket connection established
- Try with USB debugging to see actual errors
- Check network latency

---

## Performance Targets

| Operation | Target | Acceptable |
|-----------|--------|-----------|
| Sign Up | < 2 sec | < 3 sec |
| Login | < 2 sec | < 3 sec |
| Get User | < 1 sec | < 2 sec |
| Token Store | < 100 ms | < 500 ms |
| Token Retrieve | < 100 ms | < 500 ms |
| App Startup | < 2 sec | < 3 sec |

---

## Phase 5.2 Implementation Tasks

### Day 1: Setup & Automated Testing
- [ ] Verify Meteor server setup with auth.signup and auth.login
- [ ] Run all unit tests
- [ ] Fix any failing tests
- [ ] Run `flutter analyze`
- [ ] Document test results

### Day 2: Manual Integration Testing
- [ ] Execute Test Cases 1-10
- [ ] Document results and issues
- [ ] Fix any bugs found
- [ ] Rerun tests to verify fixes
- [ ] Test edge cases

### Day 3: Final Verification & Documentation
- [ ] Rerun complete test suite
- [ ] Verify performance targets
- [ ] Document any limitations
- [ ] Update status documents
- [ ] Prepare for Phase 5.3

---

## What to Do If Tests Fail

1. **Identify the failing test** (automated or manual)
2. **Reproduce the issue** with minimal steps
3. **Check Meteor logs** for backend errors
4. **Check Flutter console** for client-side errors
5. **Debug the specific component**:
   - If signup fails: Check Meteor method, user creation logic, validation
   - If login fails: Check password hashing, user lookup, token generation
   - If AuthService: Check Meteor method, network call, response parsing
   - If AuthProvider: Check state management logic, error handling
   - If UI: Check widget rendering, user input handling
   - If Storage: Check secure storage initialization
6. **Add logging** to trace the issue
7. **Fix the code** with minimal changes
8. **Verify the fix** by rerunning the failing test
9. **Update documentation** if there are workarounds

---

## Resources & References

### Meteor Backend
- Methods location: `imports/api/Users/methods.js`
- Auth methods: `auth.signup`, `auth.login`, `auth.getCurrentUser`, `auth.logout`
- Password hashing: Meteor Accounts system
- User creation: `Accounts.createUserAsync()`

### Flutter Packages
- `flutter_secure_storage`: Token storage
- `provider`: State management
- `meteor_client`: Backend communication

### Documentation Files
- `PHASE_5_PASSWORD_AUTH_IMPLEMENTATION.md`: Implementation guide
- `PHASE_5_1_TEST_CHECKLIST.md`: Manual test cases
- `PHASE_5_STATUS.md`: Current phase status

---

## Rollover to Phase 5.3

After Phase 5.2 is complete:
1. All integration tests pass ✅
2. No critical issues remaining
3. 10/10 test cases passing
4. Documentation updated
5. Ready for profile management features

Phase 5.3 will focus on:
- Backend profile editing methods
- Backend address management methods
- Integration with checkout screen
- Order-user linking

---

## Phase 5.2 Sign-Off Checklist

- [ ] All automated tests pass
- [ ] 0 linting errors
- [ ] All 10 manual test cases pass
- [ ] Performance targets met
- [ ] Error handling working correctly
- [ ] Auth persistence verified
- [ ] No critical issues
- [ ] Documentation updated
- [ ] Code ready for Phase 5.3

---

**Status**: 🚀 **Ready to Start**  
**Next Phase**: Phase 5.3 (Profile & Address Management)  
**Last Updated**: January 6, 2025  
**Auth Approach**: Password-based authentication
