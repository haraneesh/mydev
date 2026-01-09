# Phase 5.2: Application Flow - Password Authentication

**Date**: January 6, 2025  
**Phase**: 5.2  
**Focus**: Testing password auth integration

---

## High-Level Application Flow

```
┌──────────────────────────────────────────────────────┐
│                APP LAUNCH                            │
├──────────────────────────────────────────────────────┤
│ 1. Initialize providers                              │
│ 2. AuthProvider attempts to restore token            │
│    - Read from secure storage                        │
│    - If exists: authenticate user                    │
│    - If not: show login screen                       │
└────────────┬─────────────────────────────────────────┘
             │
       ┌─────▼──────────────────────────────────┐
       │ Token exists?                          │
       └─────┬──────────────────┬───────────────┘
             │ YES              │ NO
       ┌─────▼──────────────┐   │
       │ Verify with server │   │
       │ get CurrentUser()  │   │
       │ if valid:         │   │
       │ → show Profile    │   │
       │ if invalid:       │   │
       │ → show Login      │   │
       └───────────────────┘   │
                               │
                        ┌──────▼────────────────┐
                        │ Show Login Screen     │
                        │ Two modes:            │
                        │ • Create Account      │
                        │ • Login               │
                        └──────┬────────────────┘
                               │
```

---

## Sign Up Flow (Create New Account)

```
┌─────────────────────────────────────────┐
│         LOGIN SCREEN                    │
│ Mode: "Create Account"                  │
├─────────────────────────────────────────┤
│ [Phone Input] 10 digits                 │
│ [Password Input] 4+ chars               │
│ [Sign Up Button]                        │
└────────────────┬────────────────────────┘
                 │
          ┌──────▼──────────────────────┐
          │ User taps "Sign Up"          │
          └──────┬───────────────────────┘
                 │
          ┌──────▼──────────────────────┐
          │ Client Validation           │
          │ • Phone valid?              │
          │ • Password valid?           │
          └──────┬───────────────────────┘
                 │
       ┌─────────┴─────────────────────────────┐
       │ Validation fails?                     │
       │ Show error, stay on form              │
       └──────────────────────────────────────┘
                 │
       (validation passes)
                 │
          ┌──────▼───────────────────────────┐
          │ Show Loading Spinner              │
          └──────┬────────────────────────────┘
                 │
          ┌──────▼───────────────────────────┐
          │ AuthProvider.signup()             │
          │ → AuthService.signup()            │
          │ → Meteor.call('auth.signup')      │
          │   {phone, password}               │
          └──────┬────────────────────────────┘
                 │
       ┌─────────┴──────────────────────────────┐
       │                                        │
    ┌──▼──────────┐                    ┌───────▼──────┐
    │ SUCCESS      │                    │ ERROR        │
    ├──────────────┤                    ├──────────────┤
    │ • Clear form │                    │ • Show error │
    │ • Show msg   │                    │ • Keep form  │
    │ • Switch to  │                    │ • Can retry  │
    │   Login mode │                    │              │
    └──────────────┘                    └──────────────┘
```

---

## Login Flow (Existing User)

```
┌─────────────────────────────────────────┐
│         LOGIN SCREEN                    │
│ Mode: "Login"                           │
├─────────────────────────────────────────┤
│ [Phone Input] 10 digits                 │
│ [Password Input] 4+ chars               │
│ [Password toggle: show/hide]            │
│ [Login Button]                          │
└────────────────┬────────────────────────┘
                 │
          ┌──────▼──────────────────────┐
          │ User taps "Login"            │
          └──────┬───────────────────────┘
                 │
          ┌──────▼──────────────────────┐
          │ Client Validation           │
          │ • Phone valid?              │
          │ • Password provided?        │
          └──────┬───────────────────────┘
                 │
       ┌─────────┴─────────────────────────────┐
       │ Validation fails?                     │
       │ Show error, stay on form              │
       └──────────────────────────────────────┘
                 │
       (validation passes)
                 │
          ┌──────▼───────────────────────────┐
          │ Show Loading Spinner              │
          │ Disable all buttons                │
          └──────┬────────────────────────────┘
                 │
          ┌──────▼───────────────────────────┐
          │ AuthProvider.login()              │
          │ → AuthService.login()             │
          │ → Meteor.call('auth.login')       │
          │   {phone, password}               │
          └──────┬────────────────────────────┘
                 │
       ┌─────────┴──────────────────────────────┐
       │                                        │
    ┌──▼──────────────┐              ┌──────────▼──────┐
    │ SUCCESS          │              │ ERROR           │
    ├──────────────────┤              ├─────────────────┤
    │ • Receive token  │              │ • Show error    │
    │ • Store secure   │              │ • Clear password│
    │   storage        │              │ • Keep phone    │
    │ • Call get User  │              │ • Can retry     │
    │ • Update state   │              │                 │
    │ • Navigate to    │              │ Possible errors:│
    │   Profile        │              │ • User not found│
    └──────────────────┘              │ • Invalid pass  │
          │                           │ • Network error │
          │                           └─────────────────┘
          │
    ┌─────▼────────────────────────────┐
    │ PROFILE SCREEN                    │
    ├───────────────────────────────────┤
    │ Phone: [display]                  │
    │ [Logout Button]                   │
    └───────────────────────────────────┘
```

---

## Persistence Flow (App Restart)

```
┌──────────────────────────────────────────┐
│         USER CLOSES APP                  │
├──────────────────────────────────────────┤
│ Token stored in secure storage (encrypted)
└────────────┬─────────────────────────────┘
             │
             │ [TIME PASSES]
             │ [USER REOPENS APP]
             │
    ┌────────▼──────────────────────────┐
    │ main() runs                        │
    │ Initialize all providers           │
    └────────┬───────────────────────────┘
             │
    ┌────────▼──────────────────────────┐
    │ AuthProvider constructor           │
    │ calls restoreToken()               │
    │ → Read from secure storage         │
    └────────┬───────────────────────────┘
             │
       ┌─────▼──────────────────────┐
       │ Token exists?               │
       └─────┬──────────┬────────────┘
             │ YES      │ NO
       ┌─────▼──────────┐    │
       │ Token found    │    │
       │ Set as current │    │
       │ Verify with    │    │
       │ server:        │    │
       │ getCurrentUser │    │
       └─────┬──────────┘    │
             │               │
       ┌─────▼─────────────────────┐
       │ Valid token?               │
       └─────┬──────┬──────────────┘
             │ YES  │ NO
       ┌─────▼──────────┐    │
       │ Set state:     │    │
       │ authenticated  │    │
       │ Current user   │    │
       │ data loaded    │    │
       └─────┬──────────┘    │
             │               │
       ┌─────▼──────────────────────────┐
       │ PROFILE SCREEN                  │
       │ (no login needed)                │
       │ User already authenticated      │
       └─────────────────────────────────┘
                                  │
                           ┌──────▼────────────────┐
                           │ Set state:            │
                           │ unauthenticated       │
                           │ Clear current user    │
                           └──────┬─────────────────┘
                                  │
                           ┌──────▼────────────────┐
                           │ LOGIN SCREEN          │
                           │ (login again needed)   │
                           └───────────────────────┘
```

---

## Logout Flow

```
┌──────────────────────────────────────────┐
│      PROFILE SCREEN                      │
│ User is authenticated                    │
├──────────────────────────────────────────┤
│ Phone: [display]                         │
│ [Logout Button]                          │
└────────────────┬─────────────────────────┘
                 │
          ┌──────▼──────────────────────┐
          │ User taps "Logout"           │
          └──────┬───────────────────────┘
                 │
          ┌──────▼───────────────────────┐
          │ Show Loading State            │
          │ Disable all buttons           │
          └──────┬────────────────────────┘
                 │
          ┌──────▼───────────────────────┐
          │ AuthProvider.logout()         │
          │ → AuthService.logout()        │
          │ → Meteor.call('auth.logout')  │
          └──────┬────────────────────────┘
                 │
       ┌─────────┴──────────────────────────┐
       │                                    │
    ┌──▼──────────────┐        ┌───────────▼──────┐
    │ SUCCESS          │        │ ERROR            │
    ├──────────────────┤        ├──────────────────┤
    │ • Clear token    │        │ • Show error     │
    │   from storage   │        │ • Log error      │
    │ • Clear user     │        │ • Can retry      │
    │   data           │        │ • Can navigate   │
    │ • Set state:     │        │   manually       │
    │   unauthenticated│        │                  │
    │ • Navigate to    │        │                  │
    │   Login screen   │        │                  │
    └──────────────────┘        └──────────────────┘
             │                           │
             │                           │
    ┌────────▼──────────────────────┐   │
    │ LOGIN SCREEN                   │   │
    │ User not authenticated         │   │
    │ Form cleared                   │   │
    │ Ready for next user            │   │
    └────────────────────────────────┘───┘
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────┐
│        ANY OPERATION                        │
│ (Sign Up, Login, Get User, Logout)          │
└──────────────┬────────────────────────────────┘
               │
         ┌─────▼──────────────────┐
         │ Operation fails         │
         │ Exception/Error thrown  │
         └─────┬──────────────────┘
               │
         ┌─────▼────────────────────────────┐
         │ AuthProvider catches exception    │
         │ Sets error state: true            │
         │ Sets error message: human readable
         └─────┬────────────────────────────┘
               │
         ┌─────▼──────────────────┐
         │ Error type?             │
         └─────┬──────────────────┘
               │
    ┌──────────┼──────────────────────────┐
    │          │                          │
┌───▼──┐  ┌────▼─────┐  ┌────────────────▼──┐
│Server│  │Network   │  │Client Validation  │
│Error │  │Error     │  │Error              │
├───┬──┤  ├────┬─────┤  ├────────────┬──────┤
│   │  │  │    │     │  │            │      │
│   ▼  │  │    ▼     │  │            ▼      │
│ Show │  │  Show    │  │ Show error │      │
│error │  │  "Network│  │ immediately│      │
│msg  │  │  Error"  │  │ on change  │      │
│     │  │          │  │            │      │
│ Can │  │ Can      │  │ Prevent    │      │
│ retry  │  │ retry   │  │ submission │      │
│     │  │          │  │            │      │
└─────┘  └──────────┘  └────────────────────┘
    │          │                │
    └──────────┴────────────────┘
               │
        ┌──────▼──────────────────┐
        │ Clear error after user   │
        │ modifies input           │
        │ (start fresh attempt)    │
        └──────────────────────────┘
```

---

## State Transitions

```
┌─────────────────────────────────────────────┐
│            AUTH STATE MACHINE               │
└─────────────────────────────────────────────┘

              ┌─────────────────────┐
              │                     │
              │  UNAUTHENTICATED    │
              │  (Initial state)    │
              │                     │
              └──────────┬──────────┘
                         │
             ┌───────────┼───────────┐
             │                       │
        ┌────▼────────┐        ┌─────▼──────────┐
        │ signup()    │        │ login()        │
        │ login()     │        │                │
        │             │        │                │
        └────┬────────┘        └─────┬──────────┘
             │                       │
        ┌────▼───────────────────────▼─┐
        │   AUTHENTICATING             │
        │   (Loading state)            │
        │                              │
        │ - Show loading spinner       │
        │ - Disable inputs             │
        │ - Waiting for server response│
        └────┬────────────┬────────────┘
             │            │
             │ Success    │ Failure
             │            │
        ┌────▼──────────────────────┐
        │ AUTHENTICATED             │
        │                           │
        │ - User logged in          │
        │ - Token stored            │
        │ - Current user set        │
        │ - Can navigate to profile  │
        │                           │
        │ logout() called           │
        │ (→ UNAUTHENTICATED)       │
        └─────────────────────────────┘
             │
        ┌────▼────────┐
        │ ERROR        │
        │              │
        │ - Show error │
        │ - Keep form  │
        │ - Can retry  │
        │              │
        │ User modifies│
        │ input        │
        │ (→ previous  │
        │  state)      │
        └──────────────┘
```

---

## Data Flow - Sign Up Success Path

```
User
  │
  ├─ Enter: Phone = "9876543210"
  ├─ Enter: Password = "Test@123"
  │
  └─→ Tap Sign Up
      │
      └─→ LoginScreen.onSignUp()
          │
          └─→ AuthProvider.signup(phone, password)
              │
              ├─ notifyListeners() [state = authenticating]
              │
              └─→ AuthService.signup(phone, password)
                  │
                  ├─ Validate phone (10 digits)
                  ├─ Validate password (4+ chars)
                  │
                  └─→ Meteor.call('auth.signup', {phone, password})
                      │
                      ├─→ Server validates inputs
                      │
                      ├─→ Server checks duplicate user
                      │
                      ├─→ Server creates user with hashed password
                      │   (bcrypt + salt)
                      │
                      └─→ Returns: {success: true, userId, message}
                          │
                          ├─→ AuthProvider receives response
                          │
                          └─→ notifyListeners() [state = authenticating]
                              [Clear form, message shown]
                              [Switch to Login mode]
```

---

## Data Flow - Login Success Path

```
User
  │
  ├─ Enter: Phone = "9876543210"
  ├─ Enter: Password = "Test@123"
  │
  └─→ Tap Login
      │
      └─→ LoginScreen.onLogin()
          │
          └─→ AuthProvider.login(phone, password)
              │
              ├─ notifyListeners() [state = authenticating]
              │
              └─→ AuthService.login(phone, password)
                  │
                  ├─ Validate phone (10 digits)
                  ├─ Validate password (not empty)
                  │
                  └─→ Meteor.call('auth.login', {phone, password})
                      │
                      ├─→ Server finds user by phone
                      │
                      ├─→ Server hashes provided password
                      │   (with same salt as stored)
                      │
                      ├─→ Server compares hashes
                      │
                      ├─→ If match: Generate login token
                      │   (Accounts._generateLoginToken())
                      │
                      └─→ Returns: {token, userId, success}
                          │
                          ├─→ AuthService receives token
                          │
                          ├─→ Store in secure storage
                          │   (encrypted by OS)
                          │
                          ├─→ AuthProvider.getCurrentUser()
                          │   (with token)
                          │
                          └─→ Meteor.call('auth.getCurrentUser', token)
                              │
                              └─→ Server validates token
                                  └─→ Returns: user profile data
                                      │
                                      └─→ AuthProvider updates
                                          ├─ _currentUser = user
                                          ├─ _authState = authenticated
                                          └─ notifyListeners()
                                              │
                                              └─→ LoginScreen detects state
                                                  └─→ Navigate to ProfileScreen
```

---

**This flow diagram is tested in Phase 5.2**

Created: January 6, 2025  
Updated for: Password-based authentication
