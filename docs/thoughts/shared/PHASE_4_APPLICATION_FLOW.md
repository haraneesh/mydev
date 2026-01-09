# Phase 4 Application Flow - Backend Integration

**Date**: January 5, 2025  
**Focus**: Data flow, state transitions, backend communication  
**Status**: ✅ Complete

---

## Overview

This document describes how the Suvai app flows data from the user interface through services to the Meteor backend, and back again.

---

## 1. Application Startup Flow

```
User launches app
    ↓
Android/iOS launches Flutter engine
    ↓
main.dart: runApp(SuvaiApp)
    ↓
MaterialApp initializes
    ↓
MultiProvider wraps with ChangeNotifierProvider<CartProvider>
    ↓
SuvaiHome screen loads
    ↓
SuvaiHome -> navigates to HomeScreen
    ↓
HomeScreen.initState() called
    ↓
ProductService instance created
    ↓
productService.connect()
    ├─ Connects to Meteor via WebSocket
    ├─ Opens persistent connection
    └─ Sets _isConnected = true
    ↓
productService.fetchProducts()
    ├─ Subscribes to 'products.list' publication
    ├─ Waits for subscription.ready()
    ├─ Retrieves products from collection
    └─ Returns List<Product>
    ↓
setState(products = fetchedProducts)
    ↓
HomeScreen rebuilds with real products
    ↓
User sees product grid with categories
```

**Duration**: ~1-2 seconds

**User Experience**:
1. Splash screen (0.5s)
2. Loading indicator (0.5-1.5s while fetching)
3. Product grid appears

---

## 2. Product Browsing Flow

```
HomeScreen Displayed with Products
    ↓
User sees 6 products: Biryani, Dosa, Idli
    ↓
User selects "Breakfast" category filter
    ├─ Calls productService.fetchProducts(category: 'Breakfast')
    ├─ Filters products locally or refetches from server
    └─ setState() rebuilds grid
    ↓
User sees filtered products: Dosa (2 types), Idli (2 types)
    ↓
User scrolls to see more products
    ├─ Grid uses lazy loading
    ├─ Images load on demand
    └─ Smooth scroll experience
    ↓
User taps product card to view details
    ├─ Shows product name, description, price
    ├─ Shows quantity selector
    └─ Shows "Add to Cart" button
    ↓
User taps "Add to Cart" with quantity 2
    ├─ ProductCard emits onAddToCart callback
    ├─ HomeScreen calls context.read<CartProvider>().addItem()
    └─ CartProvider adds CartItem and calls notifyListeners()
    ↓
CartProvider notifies all listeners
    ├─ HomeScreen.CartIcon rebuilds (shows badge "1")
    ├─ CartScreen rebuilds if open
    ├─ OrderFooter rebuilds if visible
    └─ All Consumer<CartProvider> widgets rebuild
    ↓
CartService saves cart to local storage (SharedPreferences)
    ├─ Serializes CartProvider.items
    ├─ Writes to device local storage
    └─ Survives app restart
    ↓
Snackbar shows: "Masala Dosa (x2) added to cart"
    ↓
User continues browsing or taps cart icon
```

**Data Flow**:
```
User Input (Tap Button)
    ↓
ProductCard → HomeScreen → CartProvider.addItem()
    ↓
CartProvider.notifyListeners()
    ↓
All listeners rebuild
    ├─ HomeScreen (cart badge updates)
    ├─ CartScreen (cart list updates)
    └─ OrderFooter (total updates)
    ↓
CartService.saveCart() → SharedPreferences
    ↓
Data persisted locally
```

---

## 3. Cart Management Flow

```
User taps Cart Icon
    ↓
Navigator.push() → CartScreen
    ↓
CartScreen.build() → Consumer<CartProvider>
    ├─ Reads current cart from CartProvider
    ├─ Lists all items: name, price, quantity
    ├─ Shows subtotal for each item
    └─ Shows total amount
    ↓
User wants to adjust Masala Dosa quantity: 2 → 3
    ├─ Taps + button on QuantitySelector
    ├─ QuantitySelector emits onChanged(3)
    ├─ CartScreen calls context.read<CartProvider>().updateQuantity()
    └─ CartProvider updates item quantity
    ↓
CartProvider notifies listeners
    ├─ CartScreen rebuilds (shows new quantity)
    ├─ OrderFooter rebuilds (shows new total)
    └─ CartService saves updated cart
    ↓
Screen shows: "Masala Dosa (x3) - ₹240"
    ↓
User wants to remove item
    ├─ Taps delete/remove button
    ├─ CartScreen calls context.read<CartProvider>().removeItem()
    └─ CartProvider removes CartItem
    ↓
CartProvider notifies listeners
    ├─ CartScreen rebuilds (item removed from list)
    ├─ HomeScreen.CartIcon rebuilds (badge updates to "1")
    ├─ OrderFooter rebuilds (total updates)
    └─ CartService saves updated cart
    ↓
Snackbar shows: "Masala Dosa removed from cart"
```

**Cart State Machine**:
```
Empty Cart
    ↓ (add item)
1-5 Items
    ├─ Update quantity → Different quantity
    ├─ Remove item → Back to empty or stay in range
    └─ Add item → More items
    ↓ (proceed to checkout)
Checkout Screen
```

---

## 4. Checkout & Order Submission Flow

```
User taps "Checkout" button in CartScreen
    ↓
Navigator.push() → CheckoutScreen
    ↓
CheckoutScreen displays form:
    ├─ Phone Number input
    ├─ Name input
    ├─ Address textarea
    ├─ Cart summary (read-only)
    └─ "Place Order" button
    ↓
User fills form:
    ├─ Phone: "9876543210"
    ├─ Name: "Ramesh"
    └─ Address: "123 Main St, City"
    ↓
Form validation (client-side)
    ├─ Phone regex: 10 digits → ✅ Valid
    ├─ Name length > 0 → ✅ Valid
    └─ Address length > 0 → ✅ Valid
    ↓
User taps "Place Order"
    ├─ CheckoutScreen validates form again
    ├─ All fields valid → proceed
    ├─ Any field invalid → show error message
    └─ User corrects and retries
    ↓
CheckoutScreen creates CheckoutData
    ├─ items: CartProvider.items
    ├─ totalAmount: CartProvider.totalAmount
    ├─ name: formName
    ├─ phone: formPhone
    └─ address: formAddress
    ↓
CheckoutScreen.setState(isSubmitting: true)
    ├─ Shows loading indicator
    └─ Disables submit button
    ↓
CheckoutScreen calls context.read<CartProvider>().placeOrder(checkoutData)
    ├─ CartProvider.placeOrder() calls OrderService.submitOrder()
    └─ OrderService.submitOrder() calls Meteor method 'orders.create'
    ↓
Meteor Client sends method call via WebSocket
    ├─ serverUrl: ws://localhost:3000/websocket
    ├─ method: 'orders.create'
    └─ args: [checkoutData]
    ↓
Network latency: 100-500ms
    ├─ Network packet sent
    ├─ Server receives
    └─ Server processes
    ↓
Meteor Server (orders.create method)
    ├─ Validates user is authenticated (if required)
    ├─ Validates order data
    │   ├─ Items are valid
    │   ├─ Prices match server prices
    │   └─ Total amount matches
    ├─ Creates order document in Orders collection
    ├─ Generates order ID (MongoDB ObjectId)
    ├─ Returns { orderId: "507f1f77bcf86cd799439011" }
    └─ Saves to database
    ↓
Network latency: 100-500ms
    ├─ Response sent to client
    └─ Client receives
    ↓
OrderService.submitOrder() receives response
    ├─ Extracts orderId from result
    ├─ Returns orderId to CartProvider
    └─ CartProvider.placeOrder() completes
    ↓
CartProvider clears local cart
    ├─ Sets items: []
    ├─ Sets totalAmount: 0
    ├─ Notifies listeners
    └─ CartService clears SharedPreferences
    ↓
CheckoutScreen receives orderId from CartProvider
    ├─ setState(isSubmitting: false)
    ├─ Hides loading indicator
    └─ Navigates to OrderConfirmationScreen
    ↓
Navigator.pushReplacement()
    ├─ Removes CheckoutScreen from stack
    ├─ Pushes OrderConfirmationScreen
    └─ Back button now goes to HomeScreen
    ↓
OrderConfirmationScreen displays
    ├─ Success message: "Order Confirmed!"
    ├─ Order ID: "507f1f77bcf86cd799439011"
    ├─ Itemized receipt
    ├─ Total amount
    └─ "Continue Shopping" button
    ↓
User taps "Continue Shopping"
    ├─ Navigator.pushReplacement() → HomeScreen
    ├─ HomeScreen fetches fresh products
    ├─ Cart is empty and ready for new order
    └─ Cycle repeats
```

**Sequence Diagram**:
```
User          CheckoutScreen    CartProvider    OrderService    Meteor Server
  │                 │                │                │               │
  │─ Fill Form ────→ │                │                │               │
  │                 │                │                │               │
  │─ Place Order ───│                │                │               │
  │                 │                │                │               │
  │                 │─ placeOrder() ─→ │                │               │
  │                 │                 │─ submitOrder() ─│               │
  │                 │                 │                 │─ Call DDP ───│
  │                 │                 │                 │               │ Process
  │                 │                 │                 │               │ Validate
  │                 │                 │                 │               │ Insert
  │                 │                 │                 │←─ Response ─│
  │                 │                 │←─ OrderId ─────│               │
  │                 │←─ OrderId ──────│                │               │
  │                 │                 │                │               │
  │           [Show Confirmation]     │                │               │
  │                 │                 │                │               │
  │─ Continue ─────→│                 │                │               │
  │                 │─ Navigate Home ─→ │ (cart cleared) │               │
  │                 │                 │                │               │
```

---

## 5. Error Handling Flow

### Scenario: Network Connection Failed

```
ProductService.connect() fails
    ↓
Exception thrown
    ↓
HomeScreen catches exception in try-catch
    ├─ Sets _isConnected = false
    ├─ Sets errorMessage = 'Network unavailable'
    └─ Shows snackbar with error
    ↓
HomeScreen renders:
    ├─ Error message at top
    ├─ "Retry" button
    └─ Optional: cached products (if available)
    ↓
User taps "Retry"
    ├─ Calls productService.connect() again
    ├─ If succeeds → products load
    └─ If fails → shows error again
```

### Scenario: Order Submission Failed

```
OrderService.submitOrder() throws exception
    ├─ Network timeout
    ├─ Server validation error
    ├─ Server is down
    └─ DDP connection lost
    ↓
CartProvider catches exception
    ├─ Doesn't clear local cart
    ├─ Doesn't clear CheckoutScreen data
    └─ Throws exception to CheckoutScreen
    ↓
CheckoutScreen catches exception
    ├─ setState(isSubmitting: false)
    ├─ Hides loading indicator
    └─ Shows error snackbar: "Order failed. Please try again."
    ↓
User can:
    ├─ Tap "Retry" button to submit again
    ├─ Modify form and resubmit
    └─ Modify quantity and go back to cart
    ↓
Cart data preserved → no data loss
```

### Scenario: Server Validation Error

```
Meteor Server validates order
    ├─ Checks: items exist
    ├─ Checks: prices match
    ├─ Checks: total is correct
    └─ Find invalid: price mismatch
    ↓
Server rejects order
    ├─ Throws Meteor.Error('price-mismatch', 'Total does not match')
    └─ Sends error response to client
    ↓
OrderService receives error
    ├─ Parses MeteorMethodException
    ├─ Extracts error message
    └─ Throws ValidationException with user-friendly message
    ↓
CartProvider catches exception
    ├─ Clears incomplete order
    ├─ Notifies listeners
    └─ Throws to CheckoutScreen
    ↓
CheckoutScreen shows error:
    "Order validation failed: Prices do not match. Please try again."
    ↓
User returns to CartScreen to verify items and prices
    ├─ Products may have changed on server
    ├─ User can update quantities
    └─ User retries checkout
```

---

## 6. Real-time Updates Flow (Phase 4.2+)

```
Meteor Server: Product price updated
    ├─ Admin updates: Biryani ₹250 → ₹260
    └─ Updates Products collection
    ↓
DDP Subscription notifies
    ├─ ProductService.fetchProducts() subscription gets update
    ├─ Changed flag: changed: {price: 260}
    └─ Sends notification to listeners
    ↓
ProductService broadcasts update
    ├─ Refreshes product list
    ├─ Emits update event
    └─ Notifies HomeScreen
    ↓
HomeScreen rebuilds
    ├─ Re-renders product grid
    └─ Shows new price: ₹260
    ↓
If product in cart:
    ├─ Cart still shows old price (user's original purchase)
    ├─ On next session, updated price applies
    ├─ Or: prompt user "Price changed, continue?"
    └─ User decides to proceed or modify
    ↓
Order submitted at checkout:
    ├─ Server validates current prices
    ├─ If mismatch: reject with error
    └─ If match: proceed
    ↓
This ensures:
    ├─ No price manipulation
    ├─ Fair pricing for both parties
    └─ Real-time transparency
```

---

## 7. State Transitions

### CartProvider State Machine

```
┌─────────────────────────────────────────┐
│            Cart States                  │
└─────────────────────────────────────────┘

Initial: Empty Cart
    items: []
    totalAmount: 0.0
    
    ↓ (addItem)
    
Active Cart
    items: [CartItem, CartItem, ...]
    totalAmount: > 0
    
    ├─ (addItem) → More items
    ├─ (updateQuantity) → Same state
    ├─ (removeItem) → Can stay or go to Empty
    └─ (clearCart) → Empty Cart
    
    ↓ (placeOrder)
    
Submitting
    isLoading: true
    items: preserved
    totalAmount: preserved
    
    ├─ (success) → Empty Cart
    └─ (error) → Active Cart (preserved)
    
Empty Cart → ready for next order
```

### HomeScreen State Machine

```
Initial
    isLoading: true
    products: []
    error: null
    
    ↓ (connect)
    
Loading
    isLoading: true
    products: []
    error: null
    
    ├─ (success) → Loaded
    └─ (error) → Error
    
Loaded
    isLoading: false
    products: [Product, Product, ...]
    error: null
    
    ├─ (filterCategory) → Loaded (different subset)
    ├─ (disconnect) → Initial
    └─ (refresh) → Loading
    
Error
    isLoading: false
    products: [] (or partial)
    error: "Network unavailable"
    
    ├─ (retry) → Loading
    └─ (useCached) → Loaded
```

---

## 8. Data Structures

### Product
```dart
class Product {
  final String id;              // '1'
  final String name;            // 'Masala Dosa'
  final String description;     // 'Crispy dosa with...'
  final double price;           // 80.0
  final String category;        // 'Breakfast'
  final String subcategory;     // 'South Indian'
  final String imageUrl;        // ''
  final int minOrderQuantity;   // 1
}
```

### CartItem
```dart
class CartItem {
  final Product product;
  final int quantity;           // 2
  double get subtotal => product.price * quantity;
}
```

### CheckoutData
```dart
class CheckoutData {
  final List<CartItem> items;
  final double totalAmount;
  final String name;            // 'Ramesh'
  final String phone;           // '9876543210'
  final String address;         // '123 Main St'
}
```

### Order (on server)
```javascript
{
  _id: ObjectId,                // '507f1f77bcf86cd799439011'
  items: [
    {
      productId: ObjectId,
      name: String,
      quantity: Number,
      price: Number,
      subtotal: Number,
    }
  ],
  customer: {
    name: String,
    phone: String,
    address: String,
  },
  totalAmount: Number,
  status: String,               // 'pending', 'confirmed', etc.
  createdAt: Date,
  updatedAt: Date,
}
```

---

## 9. Data Persistence

### Local (SharedPreferences)
```
CartProvider
    ↓ (addItem, updateQuantity, etc.)
    ↓
CartService.saveCart()
    ↓
SharedPreferences
    ├─ Key: 'cart_items'
    ├─ Value: JSON array of CartItems
    └─ Survives app restart
    
On app restart:
    ↓
CartProvider.init()
    ↓
CartService.loadCart()
    ↓
SharedPreferences
    ↓
CartProvider restored
```

### Remote (Meteor)
```
OrderService.submitOrder()
    ↓
Meteor Method: orders.create
    ↓
Orders Collection (MongoDB)
    ├─ Insert document
    ├─ Persist to disk
    └─ Replicated (if configured)
    
Query:
    ↓
OrderService.getOrderStatus(orderId)
    ↓
Meteor Subscription: orders.one
    ↓
Orders Collection
    ↓
Real-time updates via DDP
```

---

## 10. Key Design Patterns

### Provider Pattern
```
CartProvider: ChangeNotifier
    ├─ Holds state
    ├─ Notifies listeners on change
    └─ Used in:
        ├─ CartScreen (Consumer)
        ├─ OrderFooter (Consumer)
        └─ HomeScreen (context.read)
```

### Service Pattern
```
ProductService
    ├─ Abstracts backend communication
    ├─ Handles connection
    ├─ Provides typed methods
    └─ Used in: HomeScreen.initState()

OrderService
    ├─ Abstracts order operations
    ├─ Submits orders
    ├─ Retrieves status
    └─ Used in: CartProvider.placeOrder()
```

### Repository Pattern
```
CartService (Local)
    ├─ Saves cart to SharedPreferences
    └─ Loads cart from storage

ProductService (Remote)
    ├─ Fetches from Meteor
    └─ Caches locally
```

---

## 11. Performance Considerations

### Network Optimization
- Connect once on app start
- Reuse connection for all operations
- Minimize number of subscriptions
- Use field projection on server

### UI Optimization
- Use FutureBuilder for async operations
- Use StreamBuilder for subscriptions
- Rebuild only necessary widgets (Consumer)
- Cache image assets

### Data Optimization
- Paginate large product lists
- Cache products in memory
- Lazy load images
- Debounce category filter changes

---

## 12. Error Recovery

### Network Disconnection
```
App connected
    ↓ (network fails)
ConnectionState → reconnecting
    ├─ Exponential backoff
    ├─ Max retry: infinite (until manual disconnect)
    └─ User sees "Reconnecting..." indicator
    ↓ (network restored)
ConnectionState → connected
    ├─ Re-subscribe to products
    ├─ Refresh cart
    └─ Resume normal operation
```

### Server Error
```
Meteor Server returns error
    ├─ 500 Internal Server Error
    ├─ 403 Forbidden
    └─ Custom validation error
    ↓
Client catches MeteorMethodException
    ├─ Logs error
    ├─ Extracts user-friendly message
    └─ Shows snackbar to user
    ↓
User can:
    ├─ Retry operation
    ├─ Modify data and retry
    └─ Contact support
```

---

## Conclusion

The Suvai app flow follows a clean architecture:

```
UI → Provider → Service → Backend
```

Each layer has clear responsibilities:
- **UI**: Display and user input
- **Provider**: State management
- **Service**: Business logic and communication
- **Backend**: Data persistence and validation

This separation ensures:
- ✅ Testability
- ✅ Maintainability
- ✅ Scalability
- ✅ Resilience

---

**Last Updated**: January 5, 2025  
**Status**: ✅ Complete & Ready for Phase 4 Implementation
