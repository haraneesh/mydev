# Phase 5.2: Quick Reference Guide

**Date**: January 6, 2025  
**Phase**: 5.2 - Integration Testing  
**Status**: Ready to execute  

---

## Quick Start

### Setup (5 minutes)
```bash
# Terminal 1: Start Meteor server
cd /Users/charaneesh/Stuff/mydev-flutter
meteor npm start

# Terminal 2: Start Flutter app
cd mobile
flutter run
```

### What to Test
✅ Sign up new user  
✅ Login existing user  
✅ Wrong password rejection  
✅ Phone validation  
✅ Password validation  
✅ Token persistence  
✅ Auth persistence on restart  
✅ Logout clears everything  

---

## 10 Test Cases at a Glance

| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | Sign up new user | Account created, message shown | [ ] |
| 2 | Sign up duplicate | Error "User already registered" | [ ] |
| 3 | Login correct | Profile screen displays | [ ] |
| 4 | Login wrong password | Error "Invalid password" | [ ] |
| 5 | Login non-existent | Error "User not found" | [ ] |
| 6 | Invalid phone | Error "Phone must be 10 digits" | [ ] |
| 7 | Weak password | Error "Password must be 4+ chars" | [ ] |
| 8 | Token persistence | App restart shows profile (not login) | [ ] |
| 9 | Logout works | Token cleared, login screen shows | [ ] |
| 10 | Password toggle | Show/hide password works | [ ] |

---

## Quick Test Credentials

```
Phone: 9876543210 (always valid)
Password: Test@123 (always valid)
```

### First Run Checklist
```
1. Launch app
2. Tap "Create Account"
3. Phone: 9876543210
4. Password: Test@123
5. Tap "Sign Up"
6. ✅ Account created
7. Toggle to "Login"
8. Same phone & password
9. Tap "Login"
10. ✅ Profile shows
```

---

## Validation Rules (Quick)

### Phone
- **Must be**: Exactly 10 digits
- **Can't have**: Letters, hyphens, spaces
- **Example**: 9876543210 ✅ | 987-654-3210 ❌

### Password
- **Minimum**: 4 characters
- **Maximum**: No limit
- **Special chars**: Optional
- **Example**: Test@123 ✅ | pwd ❌

---

## Error Messages (Quick Reference)

### Sign Up Errors
```
"User already registered" → User exists, try login
"Phone must be 10 digits" → Invalid phone format
"Password must be at least 4 characters" → Too short
```

### Login Errors
```
"Invalid password" → Wrong password, try again
"User not found" → No account, try sign up
"Phone must be 10 digits" → Invalid phone format
"No internet connection" → Check WiFi/Meteor
```

---

## Debugging Quick Commands

### Check Meteor is Running
```bash
# In Meteor terminal, you should see:
# - "Started MongoDB"
# - "Started server"
# - No [ERR] messages
```

### Check App Logs
```bash
# In Flutter terminal, look for:
# - No [error] messages
# - No red stack traces
# - [auth.*] messages from server calls
```

### Reset Data
```bash
# If you need fresh test data
cd /Users/charaneesh/Stuff/mydev-flutter
meteor reset
```

---

## Files to Know

### Frontend
- `mobile/lib/services/auth_service.dart` - Auth logic
- `mobile/lib/providers/auth_provider.dart` - State
- `mobile/lib/screens/public/login_screen.dart` - Login UI
- `mobile/lib/screens/private/user_profile_screen.dart` - Profile UI

### Backend
- `imports/api/Users/methods.js` - Server auth methods
- Look for: `auth.signup`, `auth.login`, `auth.getCurrentUser`, `auth.logout`

---

## Key Concepts

**Token**: Returned by server after login, stored securely, proves you're logged in

**Secure Storage**: Encrypted by OS, tokens can't be read by other apps

**Persistence**: Token read on app restart, user stays logged in

**State**: Provider tracks auth state (authenticating, authenticated, error)

**Validation**: Phone must be 10 digits, password must be 4+ chars

---

## Common Issues & Instant Fixes

| Issue | Fix |
|-------|-----|
| "Connection refused" | Start Meteor server |
| "User already registered" | Try different phone or `meteor reset` |
| App shows login after restart | Token not stored, check secure storage |
| Button doesn't enable | Invalid input (phone not 10 digits or password < 4) |
| Password looks plain text | Enable show/hide toggle temporarily |
| Network timeout | Check WiFi and Meteor logs |

---

## Performance Checklist

| Operation | Target | Acceptable |
|-----------|--------|-----------|
| Sign Up | < 2 sec | < 3 sec |
| Login | < 2 sec | < 3 sec |
| Profile load | < 1 sec | < 2 sec |

---

## Success = All Checks Passed ✅

- [ ] All 10 test cases pass
- [ ] 0 critical errors
- [ ] Token persists
- [ ] No console spam
- [ ] Clear error messages
- [ ] Performance acceptable

---

## Rollover to Phase 5.3

When Phase 5.2 complete:
1. All tests pass
2. Update `PHASE_5_STATUS.md`
3. Document any issues found
4. Ready for profile management features

---

## Handy Commands

```bash
# Flutter analyze (check for errors)
flutter analyze

# Flutter test (run unit tests)
flutter test

# Clean and rebuild
flutter clean && flutter pub get && flutter run

# Check Meteor logs in real time
tail -f /path/to/meteor/logs

# Kill Meteor if stuck
lsof -i :3000
kill -9 <PID>
```

---

## Test Result Template

```
Date: ___________
Tester: ___________

Test 1: [ ] PASS [ ] FAIL [ ] SKIP
Test 2: [ ] PASS [ ] FAIL [ ] SKIP
Test 3: [ ] PASS [ ] FAIL [ ] SKIP
Test 4: [ ] PASS [ ] FAIL [ ] SKIP
Test 5: [ ] PASS [ ] FAIL [ ] SKIP
Test 6: [ ] PASS [ ] FAIL [ ] SKIP
Test 7: [ ] PASS [ ] FAIL [ ] SKIP
Test 8: [ ] PASS [ ] FAIL [ ] SKIP
Test 9: [ ] PASS [ ] FAIL [ ] SKIP
Test 10: [ ] PASS [ ] FAIL [ ] SKIP

Total: ___/10 PASS

Issues found:
1. _____________________
2. _____________________
3. _____________________

Status: ✅ READY FOR PHASE 5.3 or ❌ NEEDS FIXES
```

---

## One-Minute Troubleshooting Guide

### App won't connect to Meteor
→ Check: `meteor npm start` running?  
→ Check: Correct address (10.0.2.2 vs localhost)?

### Sign up fails with "User exists"
→ Phone already registered  
→ Try: Different phone or `meteor reset`

### Login doesn't work
→ Check: Account was created (sign up first)  
→ Check: Exact phone and password match

### Token not persisting
→ App probably crashed on first run  
→ Try: Sign up again and login

### Error messages unclear
→ Check: Meteor logs for actual error  
→ Check: Flutter console for stack trace

---

## Document Index

- **Main Plan**: `PHASE_5_2_INTEGRATION_TESTING_PLAN.md`
- **Implementation**: `PHASE_5_2_IMPLEMENTATION_SUMMARY.md`
- **Research**: `PHASE_5_2_RESEARCH.md`
- **App Flow**: `APP_FLOW_PHASE_5_2.md`
- **Test Checklist**: `PHASE_5_1_TEST_CHECKLIST.md`
- **Password Auth Guide**: `PHASE_5_PASSWORD_AUTH_IMPLEMENTATION.md`

---

**Ready to start testing?**

1. Start Meteor in Terminal 1
2. Start app in Terminal 2
3. Follow 10 test cases
4. Document results
5. Fix any issues
6. Move to Phase 5.3 when ready

---

Created: January 6, 2025  
Updated for: Password-based authentication  
Focus: Quick reference during testing
