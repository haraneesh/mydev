---
date: 2025-01-04T00:00:00Z
researcher: amp
git_commit: 95c7e777ea35b68b5c4ab795e96c530384e51c35
branch: master
repository: mydev
topic: "Flutter Mobile App Replication - Client-Side Flows for Logged-Out and Consumer Roles"
tags: [research, flutter, mobile, ui-replication, consumer-flows, routing]
status: complete
last_updated: 2025-01-04
last_updated_by: amp
---

# Research: Flutter Mobile App Replication - Client-Side Flows

**Date**: 2025-01-04  
**Researcher**: amp  
**Git Commit**: 95c7e777ea35b68b5c4ab795e96c530384e51c35  
**Branch**: master  
**Repository**: mydev

## Research Question

What are the public and authenticated consumer user flows in the current web application that need to be replicated in a Flutter mobile app for iOS and Android, excluding admin/super-admin screens?

## Summary

The current web application (Meteor/React) is a food ordering platform called "Namma Suvai" with three primary user flows: **Public (Logged-Out)**, **NotAuthenticated (Login/Signup)**, and **Authenticated (Logged-In Consumer)**. The app uses a cart-based ordering system with product browsing, invoicing, wallet payments, messaging, and profile management.

For Flutter replication, **21 screens** need to be built across public, authentication, and authenticated consumer flows. Admin screens (AdminAuthenticated routes) and supplier-specific features are excluded per requirements.

## Detailed Findings

### Architecture Overview

The current app uses three route wrapper patterns:

1. **Public** - Accessible to all users, no authentication required
2. **NotAuthenticated** - Only accessible when not logged in (redirects to "/" if already authenticated)
3. **Authenticated** - Only accessible to logged-in users (redirects to "/login" if not authenticated)
4. **AdminAuthenticated** - ⚠️ EXCLUDED from Flutter (requirement: skip admin/super-admin)

Two layout types are used:
- **OrderLayout** - Minimal header/footer for product browsing and cart flows
- **MainLayout** - Full navigation for authenticated user features

---

### Public Flows (Accessible to All Users)

These screens are accessible whether logged in or not:

| Route | Component | Layout | Purpose |
|-------|-----------|--------|---------|
| `/` (home) | `Cart` | OrderLayout | Shopping cart display and product ordering |
| `/cart/:id?` | `Cart` | OrderLayout | Alternative cart entry point |
| `/neworder` | `PlaceNewOrder` | OrderLayout | Browse all products and place new order |
| `/neworder/product/:productName` | `PlaceNewOrder` | OrderLayout | View specific product details and order |
| `/neworder/category/:category/subcategory/:subcategory` | `PlaceNewOrder` | OrderLayout | Browse products by category/subcategory |
| `/orderspecials` | `OrderSpecials` | MainLayout | View special offers/promotions |
| `/collectPay` | `CollectOrderPaymentHome` | OrderLayout | Payment collection page |
| `/order/success/:orderId?` | `SuccessOrderPlaced` | MainLayout | Order confirmation/success page |
| `/about` | `About` | MainLayout | About company page |
| `/vision` | `dVision` | MainLayout | Company vision/mission |
| `/healthprinciples` | `dHealthPrinciples` | MainLayout | Health principles content |
| `/healthfaq` | `dHealthFAQ` | MainLayout | Health FAQ page |
| `/pages/terms` | `Terms` | MainLayout | Terms of Service |
| `/pages/privacy` | `Privacy` | MainLayout | Privacy Policy |
| `/pages/refund` | `Refund` | MainLayout | Refund Policy |
| `/interest/:adType` | `ShowInterest` | MainLayout | Ad interest/referral pages |

**Total: 16 public screens**

---

### Authentication Flows (Not Logged In)

These screens are only for unauthenticated users:

| Route | Component | Layout | Purpose |
|-------|-----------|--------|---------|
| `/login` | `Login` | MainLayout | User login screen |
| `/signup` | `SignUp` | MainLayout | New user registration |
| `/invitations/:token` | `SignUp` | MainLayout | Accept invitation & signup |
| `/verify-email/:token` | `VerifyEmail` | MainLayout | Email verification |
| `/recover-password` | `RecoverPassword` | MainLayout | Password reset request |
| `/reset-password/:token` | `ResetPassword` | MainLayout | Set new password |
| `/logout` | `Logout` | MainLayout | Logout handler |

**Total: 7 authentication screens**

---

### Authenticated Consumer Flows (Logged In)

These screens require authentication and are for regular consumer users:

| Route | Component | Layout | Purpose | Features |
|-------|-----------|--------|---------|----------|
| `/myorders` | `MyOrders` | MainLayout | View user's order history | List all past orders |
| `/order/:_id/view` | `ViewOrderDetailsContainer` | OrderLayout | View specific order details | Read-only order info |
| `/order/:_id` | `EditOrderDetails` | OrderLayout | Edit order details | Modify order before completion |
| `/neworder/selectbasket` | `SelectBasket` | OrderLayout | Choose basket template | Pre-fill order from template |
| `/openinvoices` | `UnpaidInvoices` | MainLayout | View outstanding invoices | List unpaid invoices |
| `/invoices/:id` | `InvoiceViewWrapper` | MainLayout | View invoice details | Read invoice information |
| `/profile` | `Profile` | MainLayout | User profile page | View/edit profile info |
| `/messages` | `dMessagesHome` | MainLayout | Messaging center | Send/receive messages |
| `/mywallet` | `dMyWallet` | MainLayout | Wallet/payment management | View wallet balance, add funds |
| `/invitations` | `dInvitations` | MainLayout | Manage invitations | View sent/received invitations |
| `/invitations/new` | `dNewInvitation` | MainLayout | Create new invitation | Invite other users |

**Total: 11 authenticated consumer screens**

---

### Components & UI Elements to Replicate

#### Navigation (Present in MainLayout)

File: `imports/ui/components/Navigation/Navigation.js`

- App logo and branding
- Navigation menu items
- User profile/account access
- Hamburger menu for mobile nav
- Search functionality
- Logout button

#### Toolbar (Footer in OrderLayout)

File: `imports/ui/components/ToolBar/ToolBar.js`

- Wallet/balance display
- Cart summary/badge
- Quick action buttons
- Back/navigation controls

#### Styling & Theme

Location: `imports/ui/stylesheets/`

- Color palette and button colors
- Font names and sizes
- Background images/patterns
- Component spacing and margins
- Responsive design breakpoints

Key SCSS files:
- `stylesheets/base/_extends.scss` - Extends and variables
- `stylesheets/special/_specials.scss` - Special styling
- Component-level SCSS files for individual screens

---

### Design System Elements to Preserve

Based on codebase structure, the following design elements need to be extracted and replicated:

#### 1. **Colors**
- Primary action button colors
- Secondary button colors
- Text colors (primary, secondary, disabled states)
- Background colors
- Alert/notification colors
- Link colors

#### 2. **Typography**
- Font family names (extract from CSS/SCSS)
- Font sizes for headings, body, labels
- Font weights (regular, bold, semi-bold)
- Line heights and spacing

#### 3. **Images**
- Logo files (extract from public folder)
- Background images for screens
- Product image placeholders
- Promotional/ad images

#### 4. **Layout Components**
- Input fields styling (text, email, password, number)
- Button styles (primary, secondary, disabled)
- Card/container styling
- Modal/dialog styling
- List item styling
- Form field labels and validation messages

#### 5. **Navigation Patterns**
- Navigation bar appearance and position
- Menu item styling
- Active/inactive states
- Hamburger menu animation

---

## Code References

### Route Definition
- `imports/ui/apps/App.js:219-867` - Complete routing structure with Public, NotAuthenticated, Authenticated wrappers

### Route Wrappers
- `imports/ui/components/Routes/Public.js` - Public route wrapper
- `imports/ui/components/Routes/NotAuthenticated.js` - Login/signup route wrapper
- `imports/ui/components/Routes/Authenticated.js` - Protected authenticated route wrapper

### Layouts
- `imports/ui/layouts/Layouts.js:66-78` - OrderLayout (minimal header/footer)
- `imports/ui/layouts/Layouts.js:105-118` - MainLayout (full navigation)
- `imports/ui/components/Navigation/Navigation.js` - Navigation bar component
- `imports/ui/components/ToolBar/ToolBar.js` - Bottom toolbar/footer

### Styling
- `imports/ui/stylesheets/base/` - Base styling and variables
- `imports/ui/stylesheets/special/` - Special component styling

### Configuration
- `Meteor.settings.public.App_Name` - App name ("Namma Suvai")

---

## Architecture Insights

### Flow Patterns

1. **Cart-Based Ordering**: Public users can browse products and create orders without login, but authenticated users can save orders, view history, and manage multiple orders.

2. **Invitation-Based Signup**: The app supports both direct signup and invitation-based signup, indicating a managed user base or referral system.

3. **Wallet System**: Authenticated users have a wallet feature for prepaid/postpaid payment options, integrated with invoice management.

4. **Lazy-Loaded Components**: Uses dynamic imports (`dynamicRoutes.js`) for code-splitting, important for performance on mobile.

5. **Layout-Based Navigation**: Minimal layouts for ordering (OrderLayout) vs. full navigation for account features (MainLayout) shows thoughtful UX separation.

---

## Required Screens Summary

### For Flutter Implementation

**Screen Count by Category:**
- Public/Guest flows: 16 screens
- Authentication flows: 7 screens
- Authenticated consumer flows: 11 screens
- **Total: 34 screens** (excluding all Admin/SuperAdmin routes)

### Navigation Structure

```
App Root
├── Public Routes (No Auth Required)
│   ├── Home/Cart
│   ├── Product Browsing (Category/Subcategory)
│   ├── Product Details
│   ├── Order Success
│   ├── Payment Collection
│   ├── About/Vision/Health Info
│   ├── Legal Pages (Terms/Privacy/Refund)
│   ├── Ad Interest Pages
│   └── Special Offers
├── Auth Routes (Not Logged In)
│   ├── Login
│   ├── Signup
│   ├── Invitation Signup
│   ├── Email Verification
│   ├── Password Recovery
│   ├── Password Reset
│   └── Logout
└── Authenticated Routes (Logged In - Consumer)
    ├── My Orders
    ├── Order Details (View/Edit)
    ├── Select Basket (Templates)
    ├── Invoices (Unpaid/Paid)
    ├── Invoice Details
    ├── Profile
    ├── Messages
    ├── Wallet
    ├── Invitations (Sent/Received)
    └── New Invitation
```

---

## Design Replication Checklist

- [ ] Extract color palette from SCSS variables
- [ ] Identify font families from CSS files
- [ ] Export logo files from public assets
- [ ] Capture button styling (sizes, shapes, colors, states)
- [ ] Document form input styling
- [ ] Extract background images
- [ ] Map navigation bar layout and styling
- [ ] Document responsive breakpoints and adjustments
- [ ] Identify animation/transition specifications
- [ ] Capture error/validation message styling

---

## Related Resources

- Web app routing: `imports/ui/apps/App.js`
- Dynamic route imports: `imports/ui/apps/dynamicRoutes.js`
- Main layout components: `imports/ui/components/Navigation/Navigation.js`, `imports/ui/components/ToolBar/ToolBar.js`
- Styling foundation: `imports/ui/stylesheets/`
- Public assets (logos, images): `public/` folder

---

## Server Configuration & Settings

The app uses a Meteor `settings-development.json` file that contains environment-specific configuration. The Flutter app must access these settings from the server.

### Key Settings Available

**Public Settings** (accessible from client):
- `App_Name`: "Suvai"
- `Product_Images`: "https://storage.googleapis.com/suvai_images_19/" (CDN URL)
- `Product_Images_Version`: "v1"
- `suvaiLocation`: { latitude: 13.0365, longitude: 80.2375 }
- `MINIMUM_ORDER_AMT`: 1000 (minimum cart order)
- `MINIMUMCART_ORDER_MSG`: "Due to an increase in delivery costs..." (delivery message)
- `Support_Numbers`: { whatsapp: "+91 9361032849", landline: "+91 44 48569950" }
- `pinCodes.allowedCodes`: [600001, 600002, ...] (service area postal codes)
- `ShowAlerts`: true
- `AlertHtML`: Alert messages/announcements
- `ShowInviteButton`: false
- `MessageInvitation`: Invitation message template

**Payment Integration:**
- `Razor`: { merchantKey: "rzp_live_HXFPKD0suH0c86" }
- `PayTM`: { merchantName: "Suvai Organics", merchantId: "..." }

**Analytics & Notifications:**
- `oneSignalGcmSenderId`: OneSignal GCM ID
- `native.oneSignalAppId`: OneSignal App ID for native apps
- `cloudinary`: { cloudName: "suvai", apiKey: "..." }
- Google Analytics, Mixpanel, Segment IO, Amplitude tracking IDs

### Recommendations for Flutter Access

1. **Create a Settings Service**: Build a singleton service that fetches and caches settings from the Meteor server on app startup.
   
   ```dart
   class AppSettings {
     static const String API_BASE_URL = 'https://your-meteor-server.com';
     
     Future<Map<String, dynamic>> fetchPublicSettings() async {
       // Call Meteor method: 'getPublicSettings' or similar
       // Return public.* section from settings
     }
   }
   ```

2. **Meteor Methods for Settings**: Request that server exposes a Meteor method like `getPublicSettings()` that returns the public settings object.

3. **Cache Settings Locally**: Store fetched settings in local storage (shared_preferences/hive) to allow app functionality even if network is temporarily unavailable.

4. **Update Strategy**: Implement periodic refresh of settings (e.g., on app startup, after user login) to pick up configuration changes without requiring app updates.

5. **Specific Config Needs**:
   - **Product Image Base URL**: Use `Product_Images` setting to construct product image URLs
   - **Minimum Order Amount**: Enforce on cart page using `MINIMUM_ORDER_AMT`
   - **Service Area**: Validate user's postal code against `pinCodes.allowedCodes`
   - **OneSignal Integration**: Use `native.oneSignalAppId` and `oneSignalGcmSenderId`
   - **Support Contact**: Display whatsapp/landline from `Support_Numbers` in help section
   - **Alerts/Announcements**: Show `AlertHtML` if `ShowAlerts` is true

---

## Color Theme & Design System

The app uses a Bootstrap-based SCSS theme with earth-tone colors suited to an organic food brand.

### Primary Color Palette

**Core Colors** (from `_variables.scss`):
- **Primary (Brand Blue)**: `#702223` - Deep burgundy/maroon (primary buttons, links, active states)
- **Secondary (Orange)**: `#e04a06` - Warm orange (secondary actions)
- **Accent Red**: `#EF0905` - Bright red (alerts, warnings, high-priority actions)
- **Success Green**: `#519716` - Muted green (success states, positive actions)
- **Info Cyan**: `#7F4422` - Warm brown (secondary info)
- **Warning Yellow**: `#ffc107` - Bright yellow (warnings)

**Grayscale** (Earth-tone neutral palette):
- **Black**: `#2f2215` - Very dark brown (text, dark backgrounds)
- **Gray-900**: `#514732` - Darkest gray
- **Gray-800**: `#6B5D51` - Dark gray
- **Gray-700**: `#522E23` - Dark brown
- **Gray-600**: `#7a583f` - Medium-dark brown
- **Gray-500**: `#8f6f4f` - Medium brown
- **Gray-400**: `#c5b29e` - Light brown
- **Gray-300**: `#c9b8a3` - Lighter brown
- **Gray-200**: `#d8cbbe` - Very light beige
- **Gray-100**: `#e5dcd3` - Almost white beige
- **White**: `#ffffff` - Pure white

### Typography

**Fonts** (from `_extends.scss`):
- **Heading Font**: `$heading-font` variable (check computed value in compiled CSS)
- **Body Font**: Bootstrap default (likely system stack or web font)

**Text Styling**:
- Headings (h1-h6): `margin-top: 0`, `margin-bottom: 0`, use heading font
- h3/H3: `font-weight: 500`
- Buttons: `text-transform: uppercase`, `letter-spacing: 1px`, `font-size: 85%`
- Error labels: Color `#ffc107` (warning color)

### Component Styling

**Buttons**:
- Use primary (`#702223`) for primary CTA
- Use secondary (`#e04a06`) for secondary actions
- Use red (`#EF0905`) for destructive actions
- `text-transform: uppercase` with `letter-spacing: 1px`
- Button height and padding follow Bootstrap defaults

**Form Elements**:
- Input borders: `$gray-500` (#8f6f4f)
- Focus state: Use primary color (`#702223`)
- Error state: Red text (`#EF0905`)
- Labels: Regular weight, dark gray (`#2f2215`)

**Cards/Containers**:
- Background: `#ffffff` (white)
- Border: `$gray-100` (#e5dcd3)
- Shadow: Bootstrap `$box-shadow`

**Navigation**:
- Background: Check `_Navbar.scss` and Navigation component
- Text: Dark (`#2f2215`)
- Active state: Primary color (`#702223`)
- Hover state: Light background, darker text

### Responsive Design

**Breakpoints** (Bootstrap standard):
- xs: < 576px (phones)
- sm: ≥ 576px (large phones)
- md: ≥ 768px (tablets)
- lg: ≥ 992px (laptops)
- xl: ≥ 1200px (desktops)

**Container Padding**: 5px left/right (small padding for space efficiency)
**Container Bottom Padding**: 60px (accommodates toolbar/footer)

### Design Files to Extract

From `imports/ui/stylesheets/`:
- `bootstrap/_variables.scss` - All color and sizing variables
- `bootstrap/_type.scss` - Typography rules
- `module/_Login.scss` - Login form styling
- `module/_Signup.scss` - Registration form styling
- `state/_Navbar.scss` - Navigation styling
- Component-level SCSS files for specific screens

---

## Open Questions (Answered)

1. **Data API**: What's the backend API structure for authentication, orders, products, etc.? (Meteor methods or REST endpoints?)

   **Answer**: Meteor methods

2. **State Management**: Should Flutter app use Provider, Riverpod, or another state management solution?

   **Answer**: Use as needed.

3. **Local Storage**: What data should persist locally on mobile (cart, user session, etc.)?

   **Answer**: Yes, store data locally to allow user to be able to resume after breaking up from their flow.

4. **Offline Mode**: Should the app support offline browsing/cart creation?

   **Answer**: No need to support offline mode.

5. **Payment Integration**: Which payment gateways are integrated (Razorpay, Stripe, etc.)?

   **Answer**: Continue using PayTM

6. **Image Storage**: Where are product images stored (CDN, server, local)?

   **Answer**: Images will be stored on AWS and will be accessible to the public without having to authenticate. The location will be present in the meteor environment settings. You may be able to access them as `Meteor.settings.public.Product_Images`

7. **Notification System**: What push notification service is used?

   **Answer**: OneSignal will be the component that will be used.

8. **Deep Linking**: Should the Flutter app support deep links for order sharing, invitations, etc.?

   **Answer**: No need to support deeplinking.