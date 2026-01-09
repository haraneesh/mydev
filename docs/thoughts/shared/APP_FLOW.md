# Suvai App - Complete Flow Diagram

## Screen Hierarchy & Navigation

```
┌─────────────────────────────────────────────────────────────┐
│                        SUVAI APP                             │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. SPLASH SCREEN                                     │   │
│  │  ───────────────────────────────────────────────────  │   │
│  │  [Suvai Logo]                                        │   │
│  │  White Background                                     │   │
│  │  ~1.2 seconds                                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                         ↓                                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  2. HOME SCREEN                                       │   │
│  │  ───────────────────────────────────────────────────  │   │
│  │                                                        │   │
│  │  AppBar: "Suvai"  [🛒 5]                            │   │
│  │  ────────────────────────────────────────────────   │   │
│  │                                                        │   │
│  │  Category Filter:                                     │   │
│  │  [All] [Biryani] [Breakfast] → (scroll)             │   │
│  │                                                        │   │
│  │  Product Grid (2 columns):                           │   │
│  │  ┌─────────┐  ┌─────────┐                           │   │
│  │  │Biryani  │  │Dosa     │                           │   │
│  │  │₹250 [+] │  │₹80  [+] │                           │   │
│  │  └─────────┘  └─────────┘                           │   │
│  │  ┌─────────┐  ┌─────────┐                           │   │
│  │  │Idli     │  │(empty)  │                           │   │
│  │  │₹60  [+] │  │         │                           │   │
│  │  └─────────┘  └─────────┘                           │   │
│  │                                                        │   │
│  │  Interactions:                                        │   │
│  │  • Tap category → filter products                   │   │
│  │  • Tap [+] button → Add to cart + snackbar         │   │
│  │  • Tap cart icon → Navigate to CartScreen          │   │
│  └──────────────────────────────────────────────────────┘   │
│              ↙  (product click)    ↘  (cart click)          │
│  (feedback msg)              Navigate to Cart             │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  3. CART SCREEN                                       │   │
│  │  ───────────────────────────────────────────────────  │   │
│  │                                                        │   │
│  │  AppBar: "Your Cart"                                 │   │
│  │  ────────────────────────────────────────────────   │   │
│  │                                                        │   │
│  │  Cart Items:                                          │   │
│  │  ┌──────────────────────────────────────────┐       │   │
│  │  │ Biryani                    ₹250 each     │       │   │
│  │  │ Subtotal: ₹500                          │       │   │
│  │  │                  [-] 2 [+]  [🗑]       │       │   │
│  │  └──────────────────────────────────────────┘       │   │
│  │  ┌──────────────────────────────────────────┐       │   │
│  │  │ Dosa                     ₹80 each        │       │   │
│  │  │ Subtotal: ₹80                           │       │   │
│  │  │                  [-] 1 [+]  [🗑]       │       │   │
│  │  └──────────────────────────────────────────┘       │   │
│  │                                                        │   │
│  │  Footer:                                              │   │
│  │  3 items                              ₹580          │   │
│  │  ┌──────────────────────────────────────────┐       │   │
│  │  │        [CHECKOUT]                        │       │   │
│  │  └──────────────────────────────────────────┘       │   │
│  │                                                        │   │
│  │  Interactions:                                        │   │
│  │  • Tap [-]/[+] → Update quantity                    │   │
│  │  • Tap [🗑] → Remove item                          │   │
│  │  • Tap CHECKOUT → Navigate to CheckoutScreen      │   │
│  └──────────────────────────────────────────────────────┘   │
│                             ↓                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  4. CHECKOUT SCREEN                                   │   │
│  │  ───────────────────────────────────────────────────  │   │
│  │                                                        │   │
│  │  AppBar: "Checkout"                                   │   │
│  │  ────────────────────────────────────────────────   │   │
│  │                                                        │   │
│  │  Order Summary:                                       │   │
│  │  ┌──────────────────────────────────────────┐       │   │
│  │  │ 3 items                           ₹580  │       │   │
│  │  └──────────────────────────────────────────┘       │   │
│  │                                                        │   │
│  │  Delivery Details:                                    │   │
│  │  ┌──────────────────────────────────────────┐       │   │
│  │  │ Full Name                                 │       │   │
│  │  │ [John Doe______________]                │       │   │
│  │  │                                          │       │   │
│  │  │ Phone Number                            │       │   │
│  │  │ [9876543210______________]              │       │   │
│  │  │ *must be 10 digits                      │       │   │
│  │  │                                          │       │   │
│  │  │ Delivery Address                        │       │   │
│  │  │ [123 Main St, City_________]           │       │   │
│  │  │ [_______________________________]       │       │   │
│  │  │ [_______________________________]       │       │   │
│  │  └──────────────────────────────────────────┘       │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────┐       │   │
│  │  │      [PLACE ORDER] (or ⏳ loading)     │       │   │
│  │  └──────────────────────────────────────────┘       │   │
│  │                                                        │   │
│  │  Validation:                                          │   │
│  │  ✓ Name: Required                                    │   │
│  │  ✓ Phone: 10 digits, numeric only                   │   │
│  │  ✓ Address: Required                                │   │
│  │                                                        │   │
│  │  Interactions:                                        │   │
│  │  • Fill form fields                                  │   │
│  │  • Tap PLACE ORDER → Validate & Submit             │   │
│  │  • On success → Navigate to ConfirmationScreen    │   │
│  │  • On error → Show snackbar                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                             ↓                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  5. ORDER CONFIRMATION SCREEN                         │   │
│  │  ───────────────────────────────────────────────────  │   │
│  │                                                        │   │
│  │  AppBar: "Order Confirmation"                         │   │
│  │  ────────────────────────────────────────────────   │   │
│  │                                                        │   │
│  │              ✅ (big green checkmark)               │   │
│  │                                                        │   │
│  │           ORDER CONFIRMED                            │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────┐       │   │
│  │  │ Order ID:          ORD-1735965234567   │       │   │
│  │  │ Customer Name:     John Doe             │       │   │
│  │  │ Total Amount:      ₹580                 │       │   │
│  │  └──────────────────────────────────────────┘       │   │
│  │                                                        │   │
│  │  What happens next?                                   │   │
│  │  ┌──────────────────────────────────────────┐       │   │
│  │  │ • We'll prepare your order              │       │   │
│  │  │ • You'll receive an SMS update          │       │   │
│  │  │ • Delivery will be within 30-45 mins   │       │   │
│  │  └──────────────────────────────────────────┘       │   │
│  │                                                        │   │
│  │  ┌──────────────────────────────────────────┐       │   │
│  │  │    [CONTINUE SHOPPING]                   │       │   │
│  │  └──────────────────────────────────────────┘       │   │
│  │                                                        │   │
│  │  Interactions:                                        │   │
│  │  • Tap CONTINUE SHOPPING → Back to HomeScreen    │   │
│  │  • Cart cleared, ready for new order              │   │
│  └──────────────────────────────────────────────────────┘   │
│                             ↓                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  BACK TO HOME SCREEN (Loop)                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## State Management Flow

```
User Action
    ↓
Widget Event Handler
    ↓
CartProvider.methodCall()
    ↓
notifyListeners()
    ↓
Consumer<CartProvider> Rebuilds
    ↓
UI Updates (badges, totals, lists)
    ↓
SharedPreferences.save()
    ↓
Data Persists
```

---

## Validation Flow

```
User submits form
    ↓
FormValidator checks each field
    ↓
All valid? ──→ NO ──→ Show error message
    ↓
   YES
    ↓
Prepare CheckoutData
    ↓
Show loading spinner
    ↓
CartProvider.placeOrder()
    ↓
Clear cart
    ↓
Navigate to ConfirmationScreen
```

---

## Error Handling

```
Operation fails
    ↓
Try-catch block
    ↓
Build error message
    ↓
Show snackbar
    ↓
User sees clear error
    ↓
Can retry or go back
```

---

## Data Persistence

```
Cart data → CartProvider
    ↓
CartService.saveCart()
    ↓
SharedPreferences
    ↓
Persists across app restart
    ↓
CartProvider.loadCart()
    ↓
Restore previous state
```

---

## Summary

The app provides a complete, intuitive ordering experience with:
- Clear visual hierarchy
- Immediate feedback for user actions
- Robust form validation
- Persistent state management
- Smooth navigation between screens

All backed by 36 passing tests and clean, maintainable code.
