# Persistent Login Testing Guide

## Test Scenarios

### ✅ Test 1: Fresh Install (First Launch)
**Expected:** App should show login screen

**Steps:**
1. Uninstall app from device/emulator
2. Install and launch app
3. Verify login screen is displayed

**Pass Criteria:**
- Login screen appears
- No authentication errors in console
- Console shows: "Meteor connected"

---

### ✅ Test 2: Successful Login & Persistence
**Expected:** User stays logged in after app restart

**Steps:**
1. Login with valid credentials
2. Verify you reach home screen
3. Close app completely (swipe away from recent apps)
4. Relaunch app
5. Verify you're still logged in (home screen appears)

**Pass Criteria:**
- After login: Navigate to home screen
- After relaunch: Directly to home screen (no login prompt)
- Console shows: "[Auth] Restored token is valid"

---

### ✅ Test 3: Invalid Token Handling
**Expected:** Invalid token should be cleared and user redirected to login

**Steps:**
1. Login successfully
2. Stop the app
3. Clear app data OR wait for token to expire on server
4. Relaunch app
5. Verify login screen appears

**Pass Criteria:**
- Login screen appears
- Console shows: "[Auth] Restored token is invalid, clearing"
- No crash or infinite loading

---

### ✅ Test 4: Auth Error During Session
**Expected:** Auth errors during app usage trigger auto-logout

**Simulation Steps:**
1. Login successfully
2. While app is running, invalidate session on server (or simulate auth error)
3. Trigger any Meteor method call
4. Verify automatic logout and redirect to login

**Pass Criteria:**
- Console shows: "[Auth] Authentication error detected, logging out..."
- User redirected to login screen
- Token cleared from storage

---

### ✅ Test 5: Logout Functionality
**Expected:** Manual logout clears token and redirects to login

**Steps:**
1. Login successfully
2. Navigate to profile/settings
3. Click logout button
4. Verify redirect to login screen
5. Close and relaunch app
6. Verify login screen appears (not auto-logged in)

**Pass Criteria:**
- Immediate redirect to login after logout
- Token cleared from secure storage
- App doesn't auto-login on next launch

---

## Debug Console Messages to Look For

### Successful Flow:
```
✅ Meteor connected
[Auth] Registering OneSignal player ID for user: <userId>
✅ OneSignal player ID registered
```

### Token Restoration (Valid):
```
✅ Meteor connected
[Auth] Fetching user data with valid token
```

### Token Restoration (Invalid):
```
✅ Meteor connected
[Auth] Restored token is invalid, clearing: <error>
```

### Auth Error Detection:
```
[Auth] Authentication error detected, logging out...
```

---

## Common Issues & Solutions

### Issue: App stuck on loading screen
**Solution:** Check if Meteor server is running and accessible

### Issue: Always shows login even after successful login
**Solution:** Check secure storage permissions on device

### Issue: Auth errors not triggering logout
**Solution:** Verify onAuthError callback is properly set in main.dart

### Issue: Token validation fails immediately
**Solution:** Check if getCurrentUser method is working correctly

---

## Manual Testing Commands

### Check if token is stored:
```bash
# Android
adb shell run-as com.suvai.app ls /data/data/com.suvai.app/files/

# iOS - Use Xcode device manager to inspect app container
```

### View Flutter logs:
```bash
flutter logs
```

### Clear app data (Android):
```bash
adb shell pm clear com.suvai.app
```

---

## Automated Test Ideas (Future)

1. Widget test for AuthRouter state transitions
2. Integration test for login → restart → auto-login flow
3. Unit test for AuthService.restoreToken() validation logic
4. Unit test for MeteorClient auth error detection
