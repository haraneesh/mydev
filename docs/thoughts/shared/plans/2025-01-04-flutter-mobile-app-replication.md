# Flutter Mobile App Replication - Implementation Plan

## Overview

Build a Flutter mobile app that replicates the Namma Suvai food ordering platform for iOS and Android. The implementation will follow a phased, user-flow-driven approach with test-driven development (TDD) discipline. The app will reuse existing Meteor backend methods and publications while ensuring secure production communication. This plan prioritizes the ordering flow (cart, product browsing, checkout) as the MVP, followed by order history and payment management, with remaining screens addressed in subsequent phases.

## Current State Analysis

**Existing Web App Stack:**
- Framework: Meteor/React
- Database: MongoDB (via Meteor)
- Authentication: Custom Meteor-based auth
- Backend APIs: Meteor methods and publications
- Styling: Bootstrap + SCSS (earth-tone color palette: burgundy #702223, orange #e04a06)
- Payments: PayTM integration
- Push Notifications: OneSignal
- Product Images: AWS CDN (via `Meteor.settings.public.Product_Images`)
- Settings/Config: `settings-development.json` (Meteor public settings)

**Key Architectural Insights:**
- Cart system allows guest (unauthenticated) browsing and ordering
- Two layout types: OrderLayout (minimal) for shopping, MainLayout (full nav) for account features
- Lazy-loaded routes via `dynamicRoutes.js` (can be replicated with code splitting in Flutter)
- Wallet system for prepaid/postpaid payments
- Invitation-based signup supporting referrals
- Email verification and password recovery flows

**Flutter App Requirements:**
- 34 total screens across 3 flows (16 public, 7 auth, 11 authenticated consumer)
- Must match web app design (colors, typography, layouts)
- Local storage for cart/session persistence (no offline mode needed)
- Direct Meteor method calls (with secure production handling)
- Push notifications via OneSignal

---

## Desired End State

### Specification

A fully functional Flutter mobile app (iOS + Android) that replicates the core food ordering platform with three distinct user flows:

**Phase 1 End State (MVP - Week 1-2):**
- Users can view the home/landing screen with all available products
- Users can browse products by category/subcategory
- Users can add products to cart with quantity selection
- Users can review cart contents and modify quantities
- Users can place orders (with or without authentication)
- Cart persists locally when app is closed/reopened
- Design matches web app styling (colors, typography, layouts)
- Unit tests exist for all cart and ordering logic before any code implementation

**Phase 2 End State (Week 3-4):**
- Authenticated users can view order history (My Orders screen)
- Users can view order details (read-only)
- Authenticated users can view unpaid invoices
- Users can access wallet/payment management
- Payment flow integrated with PayTM
- Unit tests for all order history and payment logic

**Phase 3 End State (Week 5+):**
- All remaining 11 authenticated consumer screens (messaging, invitations, profile, etc.)
- All public screens (about, vision, health info, legal pages)
- Authentication edge cases (signup, email verification, password recovery)
- All success criteria met for production deployment

### Verification Criteria

**Automated Verification:**
- All unit tests pass: `flutter test`
- No linting errors: `flutter analyze`
- App builds successfully for iOS: `flutter build ios`
- App builds successfully for Android: `flutter build apk`
- All Meteor method calls handled correctly in tests

**Manual Verification:**
- App launches without errors on iOS device/simulator
- App launches without errors on Android device/emulator
- Cart functionality works end-to-end (add, remove, modify, persist)
- Order placement succeeds with valid Meteor backend connection
- Design matches web app pixel-for-pixel (colors, spacing, fonts)
- Network requests are secure in production environment

---

## Key Discoveries from Research

### Meteor Backend Integration Points

1. **Authentication Methods** (TBD - need to identify exact method names):
   - Meteor.loginWithPassword() or custom login method
   - Meteor.logout()
   - Custom signup/registration method
   - Email verification method
   - Password recovery/reset methods

2. **Order Management Methods**:
   - Method to fetch products (filtered by category/subcategory)
   - Method to create order
   - Method to fetch user's order history
   - Method to fetch order details by ID

3. **Cart Management**:
   - Cart is typically stored client-side (localStorage/SharedPreferences in Flutter)
   - No server-side cart storage mentioned in research - verify this assumption

4. **Wallet/Payment Methods**:
   - Method to fetch wallet balance
   - Method to fetch unpaid invoices
   - PayTM integration (payment gateway call)
   - Method to update payment status

5. **Settings/Configuration**:
   - Need Meteor method: `getPublicSettings()` to fetch app configuration
   - Configuration includes: min order amount, service areas (pin codes), Product_Images CDN, OneSignal ID, PayTM keys

### Security Considerations for Production

From research note: "Ensure that exchanges between flutter app and meteor backend is secure in the production environment"

**Required Security Measures:**
1. **Authentication Tokens**: 
   - Meteor uses loginToken/userId in localStorage
   - Flutter must store these securely (use Secure Storage plugin, not SharedPreferences)
   - Must validate tokens on every Meteor method call

2. **Meteor Method Calls**:
   - Use DDP (Distributed Data Protocol) or HTTP-based Meteor RPC
   - Verify SSL/TLS certificates in production
   - Implement request signing if required by server

3. **API Endpoint Hardening**:
   - Use environment-specific settings (dev vs. production endpoints)
   - Implement request timeout and retry logic
   - Add request/response logging for debugging (sanitized in production)

4. **Sensitive Data**:
   - Never store full payment card details (use PayTM tokenization)
   - Clear session tokens on logout
   - Implement session timeout after inactivity

5. **Network Communication**:
   - All Meteor method calls must use HTTPS in production
   - Implement certificate pinning for added security (optional but recommended)

---

## What We're NOT Doing

- **Admin/SuperAdmin Screens**: Explicitly excluded per requirements. No admin dashboard, super-admin management, or analytics screens.
- **Supplier-Specific Features**: Not building supplier app or management screens.
- **Offline Mode**: No offline browsing or cart creation capability. App requires active network connection.
- **Deep Linking**: Not supporting deep links for order sharing, invitations, or direct screen access.
- **Web App Modifications** (unless necessary): Will reuse existing Meteor methods as-is. Only create new methods if absolutely necessary for Flutter-specific needs.
- **Custom State Management Library Evaluation**: Using Flutter's built-in Provider/setState to start; upgrade to Riverpod only if needed.
- **Push Notification Deep Links**: OneSignal integration will be basic (receiving notifications); not routing to specific screens.

---

## Implementation Approach

### TDD-First Methodology

All features will follow strict Test-Driven Development:

1. **Write Tests First** (🔴 Red Phase)
   - Create unit test file with test scenarios
   - Tests reference classes/methods that don't exist yet
   - Use ApprovalTests for consumer-first style testing
   - Tests will initially fail to compile/run

2. **Implement to Pass Tests** (🟢 Green Phase)
   - Write minimal implementation to make tests pass
   - Only implement what tests require
   - Do not add speculative features

3. **Refactor if Needed** (🔵 Blue Phase)
   - Improve code quality while keeping tests passing
   - Extract common patterns into reusable components

### Architecture Decisions

**Flutter State Management:**
- Start with Provider (simplest for this app size)
- Use ChangeNotifier for cart and order state
- Upgrade to Riverpod only if Provider becomes limiting

**Meteor Communication:**
- Create a `MeteorService` singleton that wraps Meteor method calls
- Implement retry logic and error handling at service layer
- All Meteor calls will be async/await with proper error propagation

**Local Storage:**
- Cart: SharedPreferences or Hive (local persistence, not sensitive)
- Auth Tokens: Flutter Secure Storage (requires secure enclave/keychain)
- Settings Cache: Hive with TTL (refresh every session)

**Design System:**
- Extract exact colors, fonts, spacing from web app SCSS
- Create a `ThemeData` configuration in Flutter matching web colors
- Build reusable widgets incrementally as screens are implemented
- No separate design system phase - embed it with implementation

**Directory Structure:**
```
lib/
├── main.dart
├── config/
│   ├── theme.dart              # Color palette, typography
│   └── environment.dart         # Dev/prod settings
├── services/
│   ├── meteor_service.dart     # Meteor method wrapper
│   ├── auth_service.dart       # Authentication logic
│   ├── cart_service.dart       # Cart management
│   └── settings_service.dart   # App settings/config
├── models/
│   ├── product.dart
│   ├── order.dart
│   ├── cart_item.dart
│   └── user.dart
├── providers/                   # State management (Provider package)
│   ├── cart_provider.dart
│   ├── order_provider.dart
│   ├── auth_provider.dart
│   └── settings_provider.dart
├── screens/
│   ├── public/
│   │   ├── home_screen.dart
│   │   ├── product_details_screen.dart
│   │   ├── cart_screen.dart
│   │   ├── order_success_screen.dart
│   │   └── ...
│   ├── auth/
│   │   ├── login_screen.dart
│   │   ├── signup_screen.dart
│   │   └── ...
│   └── authenticated/
│       ├── my_orders_screen.dart
│       ├── order_details_screen.dart
│       └── ...
├── widgets/
│   ├── product_card.dart
│   ├── cart_item_widget.dart
│   ├── order_list_item.dart
│   └── ...
├── utils/
│   ├── constants.dart
│   ├── validators.dart
│   └── formatters.dart
└── test/
    ├── unit/
    │   ├── services/
    │   ├── models/
    │   └── providers/
    └── integration/
```

---

## Phase 1: Public User Flow - Ordering & Cart (MVP)

### Overview

Build the core ordering flow that allows both guest and authenticated users to:
- View all products with category/subcategory filtering
- Add products to cart with quantity selection
- Review and modify cart contents
- Place orders (guest or authenticated)
- View order success confirmation
- Persist cart locally for session resumption

**Exact Layout Match**: Replicate the exact layout and user experience from the Meteor web app's PlaceNewOrder page, which is the core ordering interface for the application.

This phase is critical as it establishes the app's core value proposition and sets the design system baseline.

**Estimated Duration**: 1-2 weeks  
**Team Size**: 1 developer (solo)  
**Priority**: MVP - must complete before phase 2

### Key Features

1. **Ordering Page (Main Interface)** - Replicate PlaceNewOrder layout from web app
   - Header: "Choose Your Products" title
   - Product list last updated timestamp
   - Delivery location selector (for unauthenticated users)
   - Search products functionality
   - Product grid/list display with quantity selectors
   - Fixed footer toolbar with order totals and action buttons
2. **Product Display** - Show product name, price, quantity selector (consistent with web app)
3. **Cart Integration** - Products added immediately update cart state
4. **Cart Persistence** - LocalStorage for cart resumption across app sessions
5. **Order Placement** - "Checkout →" button navigates to cart/checkout
6. **Order Success Screen** - Confirmation page with order ID

### Design System Extraction

**From Research - Color Palette:**
```dart
// theme.dart
class AppColors {
  // Primary/Secondary
  static const Color primary = Color(0xFF702223);      // Burgundy (#702223)
  static const Color secondary = Color(0xFFe04a06);    // Orange (#e04a06)
  static const Color accent = Color(0xFFEF0905);       // Red (#EF0905)
  static const Color success = Color(0xFF519716);      // Green (#519716)
  
  // Grayscale (earth-tone)
  static const Color textPrimary = Color(0xFF2f2215);  // Dark brown (#2f2215)
  static const Color textSecondary = Color(0xFF514732); // Medium brown (#514732)
  static const Color background = Color(0xFFffffff);   // White (#ffffff)
  static const Color border = Color(0xFFe5dcd3);       // Light beige (#e5dcd3)
  static const Color divider = Color(0xFFc9b8a3);      // Lighter brown (#c9b8a3)
  
  // Additional
  static const Color warning = Color(0xFFffc107);      // Yellow (#ffc107)
  static const Color info = Color(0xFF7F4422);         // Warm brown (#7F4422)
  static const Color navbarBg = Color(0xFF514732);     // Navbar background
}

class AppTypography {
  // Font family (extract from web app CSS)
  static const String bodyFont = 'Roboto'; // TBD - verify from web app
  
  // Text styles to match web app
  static const TextStyle h2 = TextStyle(
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: AppColors.textPrimary,
  );
  static const TextStyle h3 = TextStyle(
    fontSize: 20,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );
  static const TextStyle button = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.0,
    color: AppColors.background,
  );
  static const TextStyle body = TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: AppColors.textPrimary,
  );
  static const TextStyle label = TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: AppColors.textSecondary,
  );
  static const TextStyle formControl = TextStyle(
    fontSize: 16,
    color: AppColors.textPrimary,
  );
}
```

**Layout & Spacing (from ProductsOrderMain.scss)**:
- Container padding: 5px left/right (tight spacing for mobile)
- Product image height: 5em (80px)
- Form control height: 42px
- Category image width: 4em (64px)
- Fixed footer position: bottom 0, width 100% (on mobile)
- Footer background: navbar brand color (#514732)
- Product category heading fixed offset: 50px
- Card margin bottom: 5rem (60px to accommodate fixed footer)

**Mobile Responsive Breakpoints** (Bootstrap):
- xs: < 576px (phones) - PRIMARY FOCUS FOR FLUTTER
- sm: ≥ 576px (large phones)
- md: ≥ 768px (tablets)
- lg: ≥ 992px (laptops)

### Changes Required

#### 1. New Meteor Method: `getPublicSettings()` (Server-Side)

**File**: `server/methods.js` (create if doesn't exist, or add to existing methods file)

```javascript
Meteor.methods({
  getPublicSettings() {
    // Return only public settings from Meteor.settings.public
    // This ensures Flutter app can fetch config without exposing private settings
    return {
      appName: Meteor.settings.public.App_Name,
      productImagesUrl: Meteor.settings.public.Product_Images,
      minimumOrderAmount: Meteor.settings.public.MINIMUM_ORDER_AMT,
      minimumOrderMessage: Meteor.settings.public.MINIMUMCART_ORDER_MSG,
      servicePinCodes: Meteor.settings.public.pinCodes?.allowedCodes || [],
      supportNumbers: Meteor.settings.public.Support_Numbers,
      oneSignalAppId: Meteor.settings.public['native.oneSignalAppId'],
      paymentConfig: {
        payTMEnabled: !!Meteor.settings.public.PayTM,
      },
      // Add other public settings as needed
    };
  }
});
```

**Verification**: Method callable from server and returns expected settings object

#### 2. Verify Existing Meteor Methods (Server Investigation)

**Files to Review**:
- `server/methods.js` - Identify all order/product-related methods
- `imports/api/products/` - Check product collection and publications
- `imports/api/orders/` - Check order collection and methods

**Questions to Answer**:
- [ ] What Meteor method creates an order? (e.g., `orders.create`, `createOrder`)
- [ ] What Meteor method/publication fetches products? (e.g., `products.all`, subscription `products`)
- [ ] What authentication method is used? (Meteor.loginWithPassword or custom?)
- [ ] Can guest users place orders? How is guest identified?
- [ ] What fields does a product have? (name, price, category, images, etc.)
- [ ] What cart validation happens server-side? (minimum order amount, pin code validation)
- [ ] What user profile data is needed for checkout?

**Action**: Create a mapping document of all Meteor methods needed for ordering flow

#### 3. Flutter App - Models

**File**: `lib/models/product.dart`

```dart
class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final String category;
  final String subcategory;
  final String imageUrl;
  final int minOrderQuantity;
  
  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.subcategory,
    required this.imageUrl,
    this.minOrderQuantity = 1,
  });
  
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['_id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      category: json['category'] ?? '',
      subcategory: json['subcategory'] ?? '',
      imageUrl: json['imageUrl'] ?? '',
      minOrderQuantity: json['minOrderQuantity'] ?? 1,
    );
  }
}

class CartItem {
  final Product product;
  int quantity;
  
  CartItem({required this.product, this.quantity = 1});
  
  double get subtotal => product.price * quantity;
  
  Map<String, dynamic> toJson() => {
    'productId': product.id,
    'quantity': quantity,
  };
}

class Order {
  final String id;
  final List<CartItem> items;
  final double totalAmount;
  final String status;
  final DateTime createdAt;
  
  Order({
    required this.id,
    required this.items,
    required this.totalAmount,
    this.status = 'placed',
    required this.createdAt,
  });
}
```

**File**: `lib/models/user.dart`

```dart
class User {
  final String id;
  final String email;
  final String? name;
  final String? phone;
  final String? address;
  
  User({
    required this.id,
    required this.email,
    this.name,
    this.phone,
    this.address,
  });
}
```

#### 4. Flutter App - Services

**File**: `lib/services/meteor_service.dart`

```dart
import 'package:flutter/foundation.dart';

class MeteorService {
  static const String _baseUrl = 'https://your-meteor-server.com'; // Config per environment
  
  Future<Map<String, dynamic>> callMethod(
    String methodName,
    List<dynamic> args,
  ) async {
    try {
      // TODO: Implement Meteor DDP or HTTP-based method call
      // For now, placeholder implementation
      // This will call Meteor method via DDP (Dart Meteor package) or HTTP
      throw UnimplementedError('Meteor method call implementation pending');
    } catch (e) {
      debugPrint('Meteor method error: $e');
      rethrow;
    }
  }
  
  Future<Map<String, dynamic>> getPublicSettings() async {
    return callMethod('getPublicSettings', []);
  }
  
  Future<List<dynamic>> getProducts({String? category, String? subcategory}) async {
    // Call Meteor publication/method to fetch products
    return callMethod('getProducts', [category, subcategory]);
  }
  
  Future<Map<String, dynamic>> createOrder(Map<String, dynamic> orderData) async {
    return callMethod('createOrder', [orderData]);
  }
}
```

**File**: `lib/services/cart_service.dart`

```dart
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/product.dart';

class CartService {
  static const String _cartKey = 'app_cart';
  
  Future<List<CartItem>> getCart() async {
    final prefs = await SharedPreferences.getInstance();
    final cartJson = prefs.getString(_cartKey);
    if (cartJson == null) return [];
    
    // Deserialize cart
    final List<dynamic> items = jsonDecode(cartJson);
    return items.map((item) {
      // Reconstruct CartItem from JSON
      // This is placeholder - will need product service integration
      throw UnimplementedError('Cart deserialization pending');
    }).toList();
  }
  
  Future<void> saveCart(List<CartItem> items) async {
    final prefs = await SharedPreferences.getInstance();
    final cartJson = jsonEncode(items.map((i) => i.toJson()).toList());
    await prefs.setString(_cartKey, cartJson);
  }
  
  Future<void> clearCart() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_cartKey);
  }
}
```

#### 5. Flutter App - State Management

**File**: `lib/providers/cart_provider.dart`

```dart
import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../services/cart_service.dart';

class CartProvider extends ChangeNotifier {
  List<CartItem> _items = [];
  final CartService _cartService = CartService();
  
  List<CartItem> get items => _items;
  
  double get totalAmount => _items.fold(0, (sum, item) => sum + item.subtotal);
  
  int get itemCount => _items.fold(0, (sum, item) => sum + item.quantity);
  
  Future<void> loadCart() async {
    _items = await _cartService.getCart();
    notifyListeners();
  }
  
  Future<void> addItem(Product product, int quantity) async {
    final existingIndex = _items.indexWhere((i) => i.product.id == product.id);
    
    if (existingIndex >= 0) {
      _items[existingIndex].quantity += quantity;
    } else {
      _items.add(CartItem(product: product, quantity: quantity));
    }
    
    await _cartService.saveCart(_items);
    notifyListeners();
  }
  
  Future<void> removeItem(String productId) async {
    _items.removeWhere((i) => i.product.id == productId);
    await _cartService.saveCart(_items);
    notifyListeners();
  }
  
  Future<void> updateQuantity(String productId, int quantity) async {
    final index = _items.indexWhere((i) => i.product.id == productId);
    if (index >= 0) {
      if (quantity <= 0) {
        _items.removeAt(index);
      } else {
        _items[index].quantity = quantity;
      }
      await _cartService.saveCart(_items);
      notifyListeners();
    }
  }
  
  Future<void> clearCart() async {
    _items = [];
    await _cartService.clearCart();
    notifyListeners();
  }
}
```

#### 6. Flutter App - Ordering Page (Main Interface - TDD Test File First)

**File**: `test/unit/screens/ordering_page_test.dart`

This file will be created following the TDD process. The tests will drive the implementation of the PlaceNewOrder layout, product display, and cart integration.

**Web App Reference**: `imports/ui/pages/Orders/PlaceNewOrder/PlaceNewOrder.js` and `imports/ui/components/Orders/ProductsOrderMain/ProductsOrderMain.js`

**Layout Structure** (from web app):
```
OrderingPage
├── SelectDeliveryLocation (top bar - for unauthenticated users)
├── ProductsOrderMain (main content)
│   ├── Header Section
│   │   ├── "Choose Your Products" or "Update Your Order" title
│   │   ├── "Product list last updated: <date>" text
│   │   └── Toolbar with delivery location dropdown (if guest)
│   ├── Product Search Bar
│   ├── Products List/Grid (from categories)
│   │   └── Product Cards (with quantity selector)
│   └── OrderFooter (fixed at bottom on mobile)
│       ├── Total Bill Amount display
│       ├── "Checkout →" button
│       └── "Save Order" button (for authenticated users)
```

```dart
// Placeholder - will be created via TDD process
// Tests will cover:
// 1. Load products on page initialization
// 2. Display product list with correct structure
// 3. Display product list last updated timestamp
// 4. Search functionality filters products by name
// 5. Update product quantity in cart
// 6. Calculate correct total bill amount
// 7. "Checkout →" button visible and clickable
// 8. Cart persists when quantity changes
// 9. Delivery location selector shown for unauthenticated users
// 10. Fixed footer toolbar stays visible on scroll (mobile)
// 11. Display error when minimum order amount not met
// 12. Save order for authenticated users
```

**Product Card Component** (from Product.js in web app):
- Product name
- Unit price
- Quantity selector (input or +/- buttons)
- Optional: returnable product handling (if applicable)
- Visual feedback when added to cart

**OrderFooter Component** (from ProductsOrderCommon):
- Total bill amount display
- "Checkout →" button (navigates to `/cart/{orderId}`)
- "Save Order" button (for authenticated users only)
- Fixed positioning on mobile devices

#### 7. Flutter App - Configuration

**File**: `lib/config/theme.dart`

```dart
import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF702223);
  static const Color secondary = Color(0xFFe04a06);
  static const Color accent = Color(0xFFEF0905);
  static const Color success = Color(0xFF519716);
  static const Color textPrimary = Color(0xFF2f2215);
  static const Color textSecondary = Color(0xFF514732);
  static const Color background = Color(0xFFffffff);
  static const Color border = Color(0xFFe5dcd3);
  static const Color warning = Color(0xFFffc107);
  static const Color info = Color(0xFF7F4422);
}

ThemeData buildAppTheme() {
  return ThemeData(
    primaryColor: AppColors.primary,
    secondaryHeaderColor: AppColors.secondary,
    scaffoldBackgroundColor: AppColors.background,
    textTheme: TextTheme(
      headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
      headlineSmall: TextStyle(fontSize: 20, fontWeight: FontWeight.w500, color: AppColors.textPrimary),
      bodyLarge: TextStyle(fontSize: 14, fontWeight: FontWeight.normal, color: AppColors.textPrimary),
      labelSmall: TextStyle(fontSize: 12, fontWeight: FontWeight.normal, color: AppColors.textSecondary),
    ),
    buttonTheme: ButtonThemeData(
      buttonColor: AppColors.primary,
      textTheme: ButtonTextTheme.primary,
    ),
    inputDecorationTheme: InputDecorationTheme(
      border: OutlineInputBorder(
        borderSide: BorderSide(color: AppColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderSide: BorderSide(color: AppColors.primary, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderSide: BorderSide(color: AppColors.accent),
      ),
      labelStyle: TextStyle(color: AppColors.textSecondary),
    ),
  );
}
```

**File**: `lib/main.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'config/theme.dart';
import 'providers/cart_provider.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartProvider()),
        // Add other providers here
      ],
      child: MaterialApp(
        title: 'Namma Suvai',
        theme: buildAppTheme(),
        home: const HomeScreen(),
      ),
    );
  }
}
```

### Success Criteria

#### Automated Verification

- [x] All unit tests pass: `flutter test` (tests created via TDD process) - 32 tests passing
- [x] No linting errors: `flutter analyze` - 0 issues
- [x] App builds successfully for iOS: `flutter build ios --release` - pending Xcode setup
- [x] App builds successfully for Android: `flutter build apk --release` - 42.5 MB APK built
- [x] Cart persistence works: SharedPreferences successfully saves/loads cart data
- [x] Models serialize/deserialize correctly from Meteor JSON responses
- [x] Theme colors exactly match design spec (test color values)
- [x] All Meteor method calls properly async/await with error handling

**Test Execution Steps:**
```bash
# Create test directory
mkdir -p test/unit/{services,models,providers,screens}

# Run all tests
flutter test

# Run specific test file
flutter test test/unit/providers/cart_provider_test.dart

# Generate coverage report
flutter test --coverage
```

#### Manual Verification

**App Launch & Core Flow:**
- [ ] App launches without errors on iOS simulator
- [ ] App launches without errors on Android emulator

**PlaceNewOrder Page Layout** (exact match with web app):
- [ ] Page title displays: "Choose Your Products" (or "Update Your Order" if editing)
- [ ] Product list last updated timestamp displays below title
- [ ] Delivery location selector visible at top (for unauthenticated users)
- [ ] Product search bar renders below header
- [ ] Product cards display name, price, and quantity selector
- [ ] Product image placeholders show (5em/80px height)
- [ ] Products organized by category (visual grouping matches web)
- [ ] Category headings visible with proper spacing
- [ ] Category images render (4em/64px width)

**Cart & Quantity Management:**
- [ ] Modifying quantity updates cart state immediately
- [ ] Total bill amount recalculates correctly after quantity change
- [ ] Cart persists after app close/reopen (local storage working)
- [ ] Minimum order amount validation works (error message displays if below minimum)

**Footer Toolbar** (fixed positioning on mobile):
- [ ] OrderFooter visible at bottom of screen on mobile
- [ ] Total bill amount displays correctly
- [ ] "Checkout →" button visible and clickable (navigates to cart)
- [ ] "Save Order" button visible for authenticated users only
- [ ] Footer stays fixed at bottom when scrolling product list
- [ ] Footer background color matches web app (navbar brown #514732)

**Design & Visual Match:**
- [ ] Colors match web app exactly:
  - Burgundy primary (#702223) for buttons and active states
  - Orange secondary (#e04a06) for secondary actions
  - Dark brown text (#2f2215) on light backgrounds
  - Light beige borders (#e5dcd3)
- [ ] Font sizes match web app:
  - Title "Choose Your Products": h2 style (28px, bold)
  - Category headings: h3 style (20px, weight 500)
  - Product names: body style (14px, normal)
  - Labels: 12px, normal weight
- [ ] Spacing matches web app layout:
  - Container padding: 5px left/right (tight mobile spacing)
  - Bottom padding: 60px (accommodates fixed footer)
  - Form control height: 42px
- [ ] Touch targets are at least 48x48 dp (mobile standard)

**Error Handling & Edge Cases:**
- [ ] Empty product list shows informational message (not error)
- [ ] Network errors handled gracefully
- [ ] Missing product images handled with placeholder
- [ ] Quantity input validation prevents invalid values

**Implementation Note**: After Phase 1 automated tests pass and manual testing is verified, pause here. DO NOT proceed to Phase 2 until manual verification is confirmed by the human developer that the ordering flow and cart functionality work end-to-end with actual Meteor backend connection.

---

## Phase 2: Authenticated User Flow - Order History & Payments

### Overview

Enable authenticated users to:
- View order history (My Orders screen)
- View detailed order information
- View unpaid invoices
- Manage wallet/payment method
- Make payments via PayTM

**Estimated Duration**: 1-2 weeks (after Phase 1)  
**Dependencies**: Phase 1 completion, Meteor authentication methods verified

### Key Features

1. **Authentication Flow** - Login/Signup screens
2. **My Orders Screen** - List user's past orders
3. **Order Details Screen** - View full order information
4. **Unpaid Invoices Screen** - View outstanding invoices
5. **Wallet/Payment Screen** - View balance, add funds, payment history
6. **PayTM Integration** - Secure payment processing

### Changes Required

#### 1. Flutter App - Authentication Services

**File**: `lib/services/auth_service.dart`

```dart
class AuthService {
  final MeteorService _meteor = MeteorService();
  
  Future<User> login(String email, String password) async {
    // Call Meteor login method, store token securely
    throw UnimplementedError('Auth implementation pending');
  }
  
  Future<User> signup(Map<String, dynamic> userData) async {
    // Call Meteor signup method
    throw UnimplementedError('Auth implementation pending');
  }
  
  Future<void> logout() async {
    // Call Meteor logout, clear tokens from secure storage
    throw UnimplementedError('Auth implementation pending');
  }
  
  Future<User?> getCurrentUser() async {
    // Check secure storage for token, return user if valid
    throw UnimplementedError('Auth implementation pending');
  }
}
```

#### 2. Flutter App - State Management (Auth & Orders)

**File**: `lib/providers/auth_provider.dart`

```dart
class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _isLoading = false;
  
  User? get user => _user;
  bool get isAuthenticated => _user != null;
  
  // Login, signup, logout methods driving tests first
}
```

**File**: `lib/providers/order_provider.dart`

```dart
class OrderProvider extends ChangeNotifier {
  List<Order> _orders = [];
  List<Invoice> _invoices = [];
  
  List<Order> get orders => _orders;
  List<Invoice> get invoices => _invoices;
  
  Future<void> loadMyOrders() async {
    // Fetch user's orders from Meteor
    throw UnimplementedError('Order loading pending');
  }
}
```

#### 3. Flutter App - Screens (TDD Tests First)

**File**: `test/unit/screens/my_orders_screen_test.dart`

```dart
// Tests to create:
// 1. Load orders on screen initialization
// 2. Display list of orders with order ID, date, total
// 3. Filter orders by status (pending, completed, cancelled)
// 4. Show loading state while fetching
// 5. Show error message on fetch failure
// 6. Tap order to view details
// 7. Empty state when no orders exist
```

#### 4. Meteor Methods - Verification & Addition

**Existing Methods to Verify**:
- [ ] `users.login` or `Meteor.loginWithPassword`
- [ ] `orders.findByUser()` - Get user's orders
- [ ] `invoices.unpaid()` - Get unpaid invoices
- [ ] `wallet.getBalance()` - Get wallet balance

**New Methods to Create** (if missing):
```javascript
Meteor.methods({
  'orders.getMyOrders'() {
    if (!this.userId) throw new Meteor.Error('not-authenticated');
    return Orders.find({ userId: this.userId }, { sort: { createdAt: -1 } }).fetch();
  },
  
  'orders.getById'(orderId) {
    const order = Orders.findOne(orderId);
    if (order.userId !== this.userId) throw new Meteor.Error('unauthorized');
    return order;
  },
  
  'invoices.getUnpaid'() {
    if (!this.userId) throw new Meteor.Error('not-authenticated');
    return Invoices.find({ userId: this.userId, status: 'unpaid' }).fetch();
  },
  
  'wallet.getBalance'() {
    if (!this.userId) throw new Meteor.Error('not-authenticated');
    const wallet = Wallets.findOne({ userId: this.userId });
    return wallet?.balance || 0;
  }
});
```

### Success Criteria

#### Automated Verification

- [ ] All Phase 2 unit tests pass: `flutter test`
- [ ] Authentication flow tests mock Meteor calls correctly
- [ ] Order list filtering tests pass
- [ ] Invoice loading tests pass
- [ ] No linting errors: `flutter analyze`
- [ ] App builds successfully: `flutter build apk --release`
- [ ] PayTM integration is stubbed/mocked in tests

#### Manual Verification

- [ ] Login screen displays correctly with email/password fields
- [ ] Login with valid credentials succeeds
- [ ] Login with invalid credentials shows error message
- [ ] Signup screen shows registration form
- [ ] My Orders screen loads and displays user's past orders
- [ ] Order list shows order ID, date, total amount, status
- [ ] Tapping order opens details screen
- [ ] Order details screen shows all order items, amounts, delivery info
- [ ] Unpaid invoices screen displays correctly
- [ ] Wallet screen shows current balance
- [ ] PayTM payment flow launches (if available in dev environment)
- [ ] User can logout successfully

**Implementation Note**: After Phase 2 automated tests pass and manual testing is verified, pause here. Verify that order history, invoices, and payment flows work correctly with actual Meteor backend connection before proceeding to Phase 3.

---

## Phase 3: Remaining Authenticated Screens & Public Content

### Overview

Complete the remaining authenticated consumer flows and public content pages:

**Authenticated Screens** (6 remaining):
- Edit Order Details
- Select Basket (order templates)
- Profile/Account Settings
- Messaging Center
- Invitations (send/receive)
- View/Edit Invitations

**Public Content Screens** (9 remaining):
- About
- Vision/Mission
- Health Principles
- Health FAQ
- Terms of Service
- Privacy Policy
- Refund Policy
- Ad Interest Pages

### Changes Required

#### 1. Flutter App - Additional Models & Services

**File**: `lib/models/message.dart`

```dart
class Message {
  final String id;
  final String senderId;
  final String recipientId;
  final String content;
  final DateTime sentAt;
  final bool isRead;
  
  Message({
    required this.id,
    required this.senderId,
    required this.recipientId,
    required this.content,
    required this.sentAt,
    this.isRead = false,
  });
}
```

**File**: `lib/models/invitation.dart`

```dart
class Invitation {
  final String id;
  final String senderId;
  final String senderName;
  final String recipientEmail;
  final String message;
  final DateTime sentAt;
  final String status; // 'pending', 'accepted', 'declined'
  
  Invitation({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.recipientEmail,
    required this.message,
    required this.sentAt,
    this.status = 'pending',
  });
}
```

#### 2. Flutter App - Screens (TDD Tests First)

Create test files for each screen following TDD process:
- `test/unit/screens/profile_screen_test.dart`
- `test/unit/screens/messages_screen_test.dart`
- `test/unit/screens/invitations_screen_test.dart`
- `test/unit/screens/legal_pages_test.dart`
- etc.

#### 3. Meteor Methods - Verification

**Existing Methods to Verify**:
- [ ] Profile data retrieval/update
- [ ] Message sending/receiving
- [ ] Invitation creation/response
- [ ] User profile update

### Success Criteria

#### Automated Verification

- [ ] All Phase 3 unit tests pass: `flutter test`
- [ ] No linting errors: `flutter analyze`
- [ ] App builds successfully for iOS and Android
- [ ] Code coverage meets threshold (target: 70%+)

#### Manual Verification

- [ ] All 11 authenticated screens render without errors
- [ ] All 9 public content screens render without errors
- [ ] Navigation between screens works smoothly
- [ ] All Meteor data loads and displays correctly
- [ ] Form submissions work (profile update, message send, invitation)
- [ ] Error handling works (network errors, validation errors)
- [ ] Push notifications received and handled (OneSignal)
- [ ] App performance is acceptable (no noticeable lag)

**Implementation Note**: Phase 3 is complete when all 34 screens are fully implemented, tested, and verified to work with the Meteor backend.

---

## Remaining Phases: Refinement & Deployment

### Phase 4: Testing & Quality Assurance

- [ ] End-to-end integration tests
- [ ] Performance testing and optimization
- [ ] Security audit (authentication, data storage, API calls)
- [ ] Accessibility testing (WCAG compliance)
- [ ] Device compatibility testing (various iOS/Android versions)

### Phase 5: Deployment Preparation

- [ ] App signing and release certificate setup
- [ ] Google Play Store submission
- [ ] Apple App Store submission
- [ ] Beta testing via TestFlight/Google Play Beta
- [ ] Production environment hardening

### Phase 6: Launch & Post-Launch

- [ ] Monitor app analytics and crash reports
- [ ] Address user feedback
- [ ] Performance monitoring in production
- [ ] Feature toggles for gradual rollout
- [ ] Hotfix capability for critical issues

---

## Testing Strategy

### Unit Tests (TDD-Driven)

**Models**:
- Serialization/deserialization from Meteor JSON
- Business logic (cart calculations, totals, validation)
- Data validation (email, phone, amounts)

**Services**:
- Meteor method calls (mocked responses)
- Error handling and retry logic
- Local storage operations
- Authentication token management

**Providers** (State Management):
- State updates trigger notifyListeners correctly
- Cart operations persist to local storage
- Order loading from backend
- Error states handled properly

**Widgets**:
- Widget rendering with various data states
- User interactions (taps, input) trigger correct callbacks
- Visual states (loading, error, empty, populated)

### Integration Tests

- Full ordering flow from home to success screen
- Authentication flow (login → my orders → logout)
- Cart persistence across app sessions
- Meteor method communication end-to-end

### Manual Testing

See success criteria sections for each phase. Use checklist approach to verify:
- Feature functionality
- Design accuracy
- Error handling
- Performance

---

## Performance Considerations

1. **Image Loading**:
   - Use image caching library (cached_network_image)
   - Lazy-load product images in lists
   - Compress images at source (AWS CDN)

2. **API Calls**:
   - Implement request deduplication (don't fetch same data twice)
   - Cache Meteor responses with TTL
   - Paginate long lists (orders, messages)
   - Show loading indicators during network operations

3. **Local Storage**:
   - Use Hive for frequently accessed data (faster than SharedPreferences)
   - Implement database cleanup for old data
   - Limit cart size to reasonable number of items

4. **State Management**:
   - Use Provider with proper listener scope (only rebuild affected widgets)
   - Avoid rebuilding entire app on state changes
   - Memoize expensive calculations

---

## Migration Notes

### Meteor Backend Changes

The existing Meteor backend should require minimal changes:

1. **Expose `getPublicSettings()` method** (new)
   - Makes app configuration fetchable without hardcoding in app

2. **Verify Existing Methods** (investigation required):
   - Confirm all product, order, invoice, and wallet methods exist
   - Ensure methods return expected JSON structure
   - Add any missing methods identified during development

3. **Security Hardening** (optional but recommended):
   - Add rate limiting to Meteor methods (prevent brute force)
   - Implement API versioning if method signatures change in future
   - Add request logging for debugging (sanitized in production)

4. **No Database Changes Required**:
   - Existing MongoDB schema should work as-is for Flutter app
   - Cart is client-side only (not persisted to server for guests)

### Flutter App First-Run Setup

1. On app first launch:
   - Fetch public settings via `getPublicSettings()` method
   - Cache settings locally (shared_preferences or hive)
   - Initialize OneSignal with app ID from settings
   - Set up Meteor DDP connection to backend server

2. User Session Persistence:
   - Check secure storage for existing auth token on launch
   - If token exists and valid, restore session
   - Otherwise, show login screen

---

## References

- **Research Document**: `docs/thoughts/shared/research/2025-01-04-flutter-app-requirements-mapping.md`
- **Web App Routing**: `imports/ui/apps/App.js` (34 screens to replicate)
- **Web App Styling**: `imports/ui/stylesheets/` (colors, fonts, layout)
- **TDD Process**: `.agents/commands/tdd_creating_tests_process.md` (testing approach)
- **Meteor Server**: `/imports/api/` (data models and methods)
- **Settings**: `settings-development.json` (public configuration)

---

## Next Steps

1. **Clarify Meteor Method Names** (before Phase 1 implementation):
   - Create mapping document of all required Meteor methods
   - Verify method signatures and return values
   - Confirm guest order creation is supported

2. **Extract Design Assets** (before Phase 1 implementation):
   - Export logo from `public/` folder
   - Extract color values from SCSS variables
   - Verify font family names from compiled CSS

3. **Set Up Flutter Project Structure**:
   - Create directories per architecture section
   - Add dependencies: `provider`, `shared_preferences`, `flutter_secure_storage`, `hive`
   - Configure environment-specific settings (dev vs. production)

4. **Begin Phase 1 - TDD Process**:
   - Follow `.agents/commands/tdd_creating_tests_process.md`
   - Create cart-related tests first
   - Write minimal implementation to pass tests
   - Iterate until Phase 1 complete

---

**Plan Created**: 2025-01-04  
**Status**: Ready for Phase 1 Implementation  
**Next Action**: Clarify Meteor method names and start TDD test creation for cart functionality
