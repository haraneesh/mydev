# Phase 5.1 Manual Testing Checklist - Password Auth

**Date**: January 6, 2025  
**Tester**: ___________________  
**Start Time**: ___________________

**Note**: Updated for password-based authentication instead of OTP

---

## Prerequisites

- [ ] Meteor server running (`meteor npm start`)
- [ ] Meteor logs visible in terminal
- [ ] Flutter device/emulator ready
- [ ] No other Flutter instances running
- [ ] Phone charger nearby 😊

---

## Quick Setup

```bash
# Terminal 1: Meteor server
cd /Users/charaneesh/Stuff/mydev-flutter
meteor npm start

# Terminal 2: Flutter app
cd mobile
flutter run
```

---

## Test Cases

### ✅ Test 1: App Launches
- [ ] App starts without crash
- [ ] Login screen visible
- [ ] "Create Account" / "Login" toggle visible
- [ ] No red error screen
- **Result**: PASS / FAIL

### ✅ Test 2: Phone Validation
- [ ] Invalid phone shows error
- [ ] Valid phone (9876543210) allows input
- [ ] Error messages are clear
- **Result**: PASS / FAIL

### ✅ Test 3: Password Validation
- [ ] Empty password shows error
- [ ] Short password (< 4 chars) shows error
- [ ] Valid password (4+ chars) allows input
- **Result**: PASS / FAIL

### ✅ Test 4: Sign Up - New User
- [ ] Toggle to "Create Account"
- [ ] Enter phone: 9876543210
- [ ] Enter password: Test@123
- [ ] Tap "Sign Up"
- [ ] Account creation message appears
- [ ] Form clears and switches to Login mode
- **Result**: PASS / FAIL

### ✅ Test 5: Sign Up - Duplicate User
- [ ] Toggle to "Create Account"
- [ ] Enter same phone: 9876543210
- [ ] Enter password: Test@123
- [ ] Tap "Sign Up"
- [ ] Error: "User already registered"
- **Result**: PASS / FAIL

### ✅ Test 6: Login - Correct Credentials
- [ ] In Login mode
- [ ] Enter phone: 9876543210
- [ ] Enter password: Test@123
- [ ] Tap "Login"
- [ ] Loading spinner appears
- [ ] Profile screen shows
- [ ] User phone displayed
- **Result**: PASS / FAIL

### ✅ Test 7: Login - Wrong Password
- [ ] Enter phone: 9876543210
- [ ] Enter wrong password: WrongPass
- [ ] Tap "Login"
- [ ] Error message appears: "Invalid password"
- [ ] Can try again
- **Result**: PASS / FAIL

### ✅ Test 8: Profile Display
- [ ] After successful login
- [ ] Phone number shown
- [ ] User data displays correctly
- [ ] Logout button visible
- [ ] No layout issues
- **Result**: PASS / FAIL

### ✅ Test 9: Logout Works
- [ ] On profile screen
- [ ] Tap "Logout"
- [ ] Navigate back to Login screen
- [ ] Token cleared
- [ ] Can login again
- **Result**: PASS / FAIL

### ✅ Test 10: Auth Persistence
- [ ] Logged-in user on profile
- [ ] Close app completely
- [ ] Restart app
- [ ] Profile screen shows (not login)
- [ ] Phone still displayed
- [ ] Token was persisted
- **Result**: PASS / FAIL

---

## Summary

### Passed: ____ / 10
### Failed: ____ / 10
### Partial: ____ / 10

---

## Issues Found

1. **Issue**: _____________________
   - **Location**: _____________________
   - **Severity**: Critical / High / Medium / Low
   - **Fix**: _____________________

2. **Issue**: _____________________
   - **Location**: _____________________
   - **Severity**: Critical / High / Medium / Low
   - **Fix**: _____________________

3. **Issue**: _____________________
   - **Location**: _____________________
   - **Severity**: Critical / High / Medium / Low
   - **Fix**: _____________________

---

## Overall Assessment

- [ ] All core features work
- [ ] No critical bugs
- [ ] Auth flow complete
- [ ] Ready for Phase 5.2

**Comments**: _____________________________________

---

## Debugging Commands

```bash
# If something goes wrong:

# 1. Check Flutter analyze
flutter analyze

# 2. Clean and rebuild
flutter clean
flutter pub get
flutter run

# 3. Check Meteor logs (look for [auth.*] messages)
# Terminal running meteor npm start

# 4. Check network calls
# In browser or network monitor

# 5. Check secure storage
# Should not print tokens to console
```

---

## Next Steps

- [ ] Document all results
- [ ] Fix any failing tests
- [ ] Retest if code changed
- [ ] Move to Phase 5.2 when ready

---

## Time Log

| Test Case | Start | End | Duration | Status |
|-----------|-------|-----|----------|--------|
| 1 | _____ | _____ | _____ | PASS/FAIL |
| 2 | _____ | _____ | _____ | PASS/FAIL |
| 3 | _____ | _____ | _____ | PASS/FAIL |
| 4 | _____ | _____ | _____ | PASS/FAIL |
| 5 | _____ | _____ | _____ | PASS/FAIL |
| 6 | _____ | _____ | _____ | PASS/FAIL |
| 7 | _____ | _____ | _____ | PASS/FAIL |
| 8 | _____ | _____ | _____ | PASS/FAIL |
| 9 | _____ | _____ | _____ | PASS/FAIL |
| 10 | _____ | _____ | _____ | PASS/FAIL |

**Total Time**: _____________________

---

**End Time**: ___________________

**Final Status**: ✅ Ready for Phase 5.2 / ❌ Needs Fixes / ⚠️ Partial Success
