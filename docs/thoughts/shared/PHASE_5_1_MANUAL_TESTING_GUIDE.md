# Phase 5.1: Manual Testing Guide

**Phase**: 5.1  
**Status**: Code exists, manual testing needed  
**Date**: January 6, 2025  
**Duration**: 1-2 hours

---

## Verification Summary

✅ **Code Exists**:
- `mobile/lib/services/auth_service.dart` - AuthService implementation
- `mobile/lib/providers/auth_provider.dart` - AuthProvider state management
- `mobile/lib/screens/public/login_screen.dart` - Login UI
- `mobile/lib/models/user.dart` - User data model
- All other screens and models

✅ **Backend Methods Exist**:
- `auth.requestOTP(phone)` - Generate OTP
- `auth.verifyOTP(data)` - Verify OTP and return token
- `auth.getCurrentUser()` - Fetch authenticated user
- `auth.logout()` - Clear session

❓ **Tests Status**:
- No automated auth tests yet (will create after manual verification)
- Existing Phase 4 tests have timeout issues (not blocking Phase 5)

---

## Setup Requirements

### Before Testing

1. **Meteor Server Running**
   ```bash
   cd /Users/charaneesh/Stuff/mydev-flutter
   meteor npm start
   # Should show: "Started MongoDB", "Started server"
   ```

2. **Check Server is Responsive**
   - Should be at: `http://10.0.2.2:3000` (Android) or `http://localhost:3000` (iOS)
   - Check terminal shows "App running at..."

3. **Flutter Environment**
   ```bash
   cd mobile
   flutter --version  # Should work
   flutter devices   # Show emulator/device
   ```

4. **Visual Access**
   - Have Meteor server logs visible in one terminal
   - Have Flutter console/logs visible in another
   - Or tail logs: `tail -f server.log`

---

## Manual Test Cases

### Test Case 1: App Launches Without Errors

**Steps**:
1. Run: `flutter run` in mobile directory
2. Wait for app to load (should see login screen or splash)
3. Check console for errors

**Expected Result**:
- App launches
- No crash/red screen
- Login screen visible (or splash if auth persists)

**Debug if fails**:
- Check: `flutter analyze` (should be 0 errors)
- Check: Pubspec dependencies installed (`flutter pub get`)
- Check: Any console errors

**Document**:
- [ ] App launches cleanly

---

### Test Case 2: Phone Input Screen Shows & Validates

**Steps**:
1. App shows LoginScreen (phone entry screen)
2. Try entering invalid phone: `abc`
3. Observe error message
4. Clear and enter incomplete phone: `123`
5. Observe error message
6. Enter valid phone: `9876543210`
7. Observe button becomes enabled

**Expected Result**:
- LoginScreen displays with phone input field
- Invalid input shows clear error message (e.g., "Phone must be 10 digits")
- Valid input enables "Request OTP" button
- Error messages are user-friendly

**Debug if fails**:
- Check: `LoginScreen` code in `mobile/lib/screens/public/login_screen.dart`
- Verify: Phone validation logic
- Check: Error message text

**Document**:
- [ ] Phone validation works
- [ ] Error messages display correctly

---

### Test Case 3: Request OTP Works

**Steps**:
1. Enter phone: `9876543210`
2. Tap "Request OTP" button
3. Observe: Loading state appears
4. Wait 2-3 seconds
5. Check Meteor server logs for OTP generation

**Expected Result**:
- Loading spinner appears
- After ~2 seconds: Screen transitions to OTP verification
- Meteor logs show: `[auth.requestOTP] OTP generated for phone...`
- OTP code visible in Meteor logs (6 digits, e.g., `123456`)

**Debug if fails**:
- Check: Meteor server logs for errors
- Check: Network tab shows `auth.requestOTP` call
- Verify: Phone number format matches expectations
- Check: Meteor methods.js has requestOTP method

**Document**:
- [ ] OTP request successful
- [ ] OTP code: `_____ _____ _____ _____ _____ _____` (from logs)

---

### Test Case 4: OTP Verification Screen Shows

**Steps**:
1. After successful OTP request
2. Observe: Screen shows OTP input widget
3. Look for: 6-digit input field or pin code input
4. Look for: Resend button
5. Look for: Timer (if implemented)

**Expected Result**:
- OTPVerificationScreen displays
- OTP input widget ready for input
- Resend button visible
- Clear instructions

**Debug if fails**:
- Check: OTPVerificationScreen code
- Verify: Pin code widget imported correctly
- Check: Navigation from LoginScreen to OTPVerificationScreen

**Document**:
- [ ] OTP verification screen displays

---

### Test Case 5: Verify OTP - Incorrect Code

**Steps**:
1. On OTP verification screen
2. Enter wrong code: `000000`
3. Tap "Verify OTP"
4. Observe: Error message appears
5. Verify: Can try again

**Expected Result**:
- Error message: "Invalid OTP" or similar
- Screen doesn't navigate away
- Can enter new OTP
- Still on OTP verification screen

**Debug if fails**:
- Check: Meteor logs for verification failure
- Verify: Error is caught and displayed
- Ensure: User can retry

**Document**:
- [ ] Invalid OTP handled correctly
- [ ] Error message: _______________

---

### Test Case 6: Verify OTP - Correct Code

**Steps**:
1. Get correct OTP from Meteor logs (from Test Case 3)
2. Enter OTP: (use the code from logs)
3. Tap "Verify OTP"
4. Observe: Loading appears
5. Wait 2-3 seconds

**Expected Result**:
- Token obtained from backend
- User profile screen displays
- Shows user's phone number
- Logout button visible
- Meteor logs show successful verification

**Debug if fails**:
- Check: OTP code is correct
- Verify: Meteor logs show successful verification
- Check: Token is stored (should not see error)
- Verify: Auth state changes to authenticated

**Document**:
- [ ] Correct OTP verified
- [ ] Profile screen displays
- [ ] Phone number shown: _______________

---

### Test Case 7: Profile Screen - User Data Displays

**Steps**:
1. On profile screen after successful login
2. Observe: User phone number displayed
3. Look for: User name (if available)
4. Look for: Any other user info
5. Verify: Data matches what was sent

**Expected Result**:
- Profile shows phone: `9876543210`
- All user data displayed correctly
- Layout is readable
- No errors in console

**Debug if fails**:
- Check: User data in AuthProvider
- Verify: User model parsing works
- Check: UI widget displaying data correctly

**Document**:
- [ ] Profile displays correctly
- [ ] Phone shown: _______________

---

### Test Case 8: Logout Functionality

**Steps**:
1. On profile screen
2. Look for logout button
3. Tap logout button
4. Observe: Navigation back to login screen
5. Verify: Auth state cleared

**Expected Result**:
- Logout button visible and tappable
- Screen navigates to LoginScreen
- Token is cleared (should not see it in logs)
- Can login again with same phone
- Meteor logs show logout

**Debug if fails**:
- Check: Logout button exists in UI
- Verify: Navigation routing correct
- Ensure: Token is actually cleared
- Check: Meteor logout method called

**Document**:
- [ ] Logout works
- [ ] Returned to login screen

---

### Test Case 9: Auth Persistence on App Restart

**Steps**:
1. Logged-in user on profile screen
2. Close app completely (not background, fully close)
3. Kill the app: `flutter run` → Ctrl+C
4. Wait 2 seconds
5. Run app again: `flutter run`
6. Observe: Screen that appears on startup

**Expected Result**:
- App restarts
- Profile screen displays (not login screen)
- User's phone number shown
- Auth state persisted
- Token was retrieved from secure storage

**Debug if fails**:
- Check: Token stored in flutter_secure_storage
- Verify: AuthProvider reads token on startup
- Check: main.dart initializes auth on startup
- Ensure: Timing allows token to be read before UI builds

**Document**:
- [ ] Auth persists on restart
- [ ] Profile shows on startup

---

### Test Case 10: Network Error Handling

**Steps**:
1. Kill Meteor server (Ctrl+C in server terminal)
2. Logged-out user on login screen
3. Enter phone: `9876543210`
4. Tap "Request OTP"
5. Observe: Loading state
6. Wait 5 seconds

**Expected Result**:
- Error message appears (e.g., "Connection failed" or similar)
- Loading spinner goes away
- Clear error message to user
- Can try again when network restored

**Debug if fails**:
- Check: Error handling in AuthService
- Verify: Error message is user-friendly
- Ensure: UI recovers from error state
- Check: Doesn't crash or hang

**Document**:
- [ ] Network errors handled
- [ ] Error message: _______________
- [ ] Can retry after error

---

## Testing Checklist

### Before Starting
- [ ] Meteor server running and visible
- [ ] Flutter app building and running
- [ ] Have phone ready to log test results
- [ ] Can see Meteor logs
- [ ] Can see Flutter console logs

### During Testing
- [ ] Complete all 10 test cases above
- [ ] Document results in the document field
- [ ] Note any unexpected behavior
- [ ] Capture error messages exactly
- [ ] Check Meteor logs for each operation

### After Testing
- [ ] Review all results
- [ ] Document any issues
- [ ] Note what works well
- [ ] List anything that needs fixing

---

## Test Results Template

```
TEST CASE: [Number and Name]
Date: [Today]
Tester: [Your name]
Duration: [How long it took]

Steps Completed:
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

Result:
✅ PASS / ❌ FAIL / ⚠️ PARTIAL

Expected: [What should happen]
Actual: [What actually happened]

Notes: [Any observations]

Debug Info (if failed):
- Error message: [Exact error]
- Console logs: [Relevant logs]
- Meteor logs: [Server output]
```

---

## Common Issues & Quick Fixes

### Issue: "Connection refused" when requesting OTP
**Cause**: Meteor server not running
**Fix**: 
```bash
cd /Users/charaneesh/Stuff/mydev-flutter
meteor npm start
```
**Verify**: See "App running at http://..." in logs

### Issue: OTP code not showing in Meteor logs
**Cause**: Method not called or logs not visible
**Fix**:
1. Check terminal has Meteor logs visible
2. Verify phone format is 10 digits
3. Look for "[auth.requestOTP]" in logs
4. If missing, check network call in Flutter console

### Issue: Profile doesn't show after OTP verification
**Cause**: Token not saved or user not fetched
**Fix**:
1. Check Meteor logs show successful verification
2. Verify token returned from auth.verifyOTP
3. Check auth.getCurrentUser was called
4. Look for errors in Flutter console

### Issue: App crashes on startup
**Cause**: Startup initialization issue
**Fix**:
1. Run `flutter clean`
2. Run `flutter pub get`
3. Check main.dart AuthProvider initialization
4. Look for null pointer exceptions in console

---

## Success Criteria

### Phase 5.1 Manual Testing PASS if:
- ✅ All 10 test cases pass or marked as working
- ✅ Phone validation prevents invalid input
- ✅ OTP request works and generates code
- ✅ OTP verification works with correct code
- ✅ Profile displays after login
- ✅ Logout clears authentication
- ✅ Auth persists on app restart
- ✅ Errors handled gracefully
- ✅ No crashes during testing

### Phase 5.1 Manual Testing FAIL if:
- ❌ Core auth flow breaks (e.g., OTP verification fails)
- ❌ App crashes during normal usage
- ❌ Data doesn't persist on restart
- ❌ Error messages are unclear
- ❌ Major UI issues prevent testing

---

## Next Steps

### After Manual Testing Completes

1. **If All Tests Pass**:
   - Document results
   - Move to Phase 5.2 integration testing
   - Use 9 test cases from PHASE_5_2_INTEGRATION_TESTING_PLAN.md

2. **If Some Tests Fail**:
   - Document failures clearly
   - Fix code issues
   - Retest failing cases
   - Continue when all pass

3. **If Major Issues**:
   - Review code in relevant files
   - Check console logs carefully
   - Verify backend methods exist
   - Investigate Meteor server

---

## Files to Reference While Testing

**Backend** (if you need to check):
- `imports/api/Users/methods.js` - Auth methods (lines 591-780)

**Frontend** (if you need to check):
- `mobile/lib/services/auth_service.dart` - Service layer
- `mobile/lib/providers/auth_provider.dart` - State management
- `mobile/lib/screens/public/login_screen.dart` - Login UI
- `mobile/lib/screens/public/otp_verification_screen.dart` - OTP UI
- `mobile/lib/screens/public/user_profile_screen.dart` - Profile UI
- `mobile/lib/main.dart` - App initialization

---

## Logging Guide

### To See Meteor Logs
```bash
# Terminal where Meteor is running
# Look for lines like:
[auth.requestOTP] OTP generated for phone 9876543210: 123456
[auth.verifyOTP] User 9876543210 authenticated successfully
```

### To See Flutter Logs
```bash
# Terminal where flutter run is running
# Look for:
print() statements in services
I/Flutter (xxxxx): [log messages]
E/Flutter (xxxxx): [errors]
```

### To Add Debug Logging (if needed)
In AuthService or LoginScreen, add:
```dart
print('Debug: [Description of what you\'re checking]');
```

---

## Estimated Timeline

- Test Case 1-4: ~10 minutes
- Test Case 5-7: ~15 minutes
- Test Case 8-10: ~10 minutes
- **Total**: ~35 minutes of actual testing
- **Plus**: Time to fix any issues (variable)

---

## Final Notes

This manual testing will:
- ✅ Verify Phase 5.1 code works
- ✅ Identify any real issues
- ✅ Document the auth flow
- ✅ Prepare for Phase 5.2 integration testing
- ✅ Provide confidence in Phase 5.1 implementation

**You don't need perfect tests yet—just verify it works manually.**

---

**Date**: January 6, 2025  
**Status**: Ready to test  
**Estimated Duration**: 1-2 hours  
**Next Phase**: Phase 5.2 Integration Testing
