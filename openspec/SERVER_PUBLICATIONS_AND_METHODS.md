# Meteor Server Publications and Methods

## Quick Reference for Flutter Mobile App

This document lists all available Meteor server publications and methods that can be called from the Flutter app.

---

## ORDERS API

### Publications

#### `orders.mylist`
**Description:** Fetch all orders for the logged-in user (most relevant for mobile).
- **Location:** `/imports/api/Orders/server/publications.js` (line 55)
- **Parameters:** None
- **Returns:** Orders collection documents sorted by `createdAt` (descending), limit 50
- **User:** Logged-in customers only
- **Usage in Flutter:** Currently used in `OrderService.fetchMyOrders()`
```dart
await _meteorClient.subscribe('orders.mylist');
```

---

#### `orders.list.status`
**Description:** Fetch orders filtered by status(es) for the logged-in user.
- **Location:** `/imports/api/Orders/server/publications.js` (line 40)
- **Parameters:** 
  - `orderStatuses` (Array of strings): e.g., `['Pending', 'Processing', 'Awaiting_Fulfillment', 'Shipped', 'Partially_Completed', 'Completed', 'Cancelled', 'Returned']`
- **Returns:** Orders collection sorted by `createdAt` (descending), limit 250
- **User:** Logged-in customers only
- **Note:** Useful for filtering orders by specific statuses
```dart
// Example usage (not currently used, but available)
await _meteorClient.subscribe('orders.list.status', 
  params: {'orderStatuses': ['Pending', 'Processing']}
);
```

---

#### `orders.list` (Admin only)
**Description:** Fetch all orders (admin view).
- **Location:** `/imports/api/Orders/server/publications.js` (line 7)
- **Parameters:** 
  - `options.isWholeSale` (Boolean)
  - `options.limit` (Number)
  - `options.skip` (Number)
  - `options.sort` (Object with fields like `createdAt`, `order_status`, `total_bill_amount`)
- **Returns:** Orders filtered by wholesale/retail
- **User:** Admins only
- **Note:** Not needed for mobile customer app

---

#### `orders.orderDetails` (Admin or Order Owner)
**Description:** Fetch details for a specific order.
- **Location:** `/imports/api/Orders/server/publications.js` (line 63)
- **Parameters:** 
  - `id` (String): Order ID
- **Returns:** Single order document
- **User:** Admin OR customer who owns the order
- **Alternative:** Use `orders.mylist` and find the order locally (current approach in Flutter)

---

### Methods (RPC Calls)

#### `orders.upsert`
**Description:** Create or update an order.
- **Location:** `/imports/api/Orders/methods.js` (line 237)
- **Parameters:**
  ```
  {
    _id: String or null (null for new orders),
    order_status: String (required, default: 'Pending'),
    comments: String (optional),
    loggedInUserId: String,
    deliveryPincode: String (optional),
    basketId: String (optional),
    issuesWithPreviousOrder: String (optional),
    products: Array of product objects,
    customer_details: Object (auto-filled if not provided),
    payCashWithThisDelivery: Boolean,
    collectRecyclablesWithThisDelivery: Boolean
  }
  ```
- **Returns:** Order ID (string)
- **Used in Flutter:** `OrderService.submitOrder()` calls this
- **Note:** Server calculates `total_bill_amount` automatically based on current product prices

---

#### `orders.create` (Alternative)
**Description:** Create a new order (simpler validation).
- **Location:** `/imports/api/Orders/methods.js` (line 703)
- **Parameters:**
  ```
  {
    name: String,
    phone: String (10 digits),
    address: String,
    items: Array of { productId, productName, quantity, price, subtotal },
    totalAmount: Number
  }
  ```
- **Returns:** `{ orderId, success }`
- **Note:** Simpler alternative to `orders.upsert`, good for basic order creation

---

---

## USERS API

### Publications

#### `users.userData`
**Description:** Fetch current user's profile and settings.
- **Location:** `/imports/api/Users/server/publications.js` (line 31)
- **Parameters:** None
- **Returns:** User document with fields: emails, profile, settings, wallet, globalStatuses, productReturnables
- **User:** Current logged-in user only

---

#### `users.editProfile`
**Description:** Fetch user's profile for editing.
- **Location:** `/imports/api/Users/server/publications.js` (line 12)
- **Parameters:** None
- **Returns:** User document with fields: emails, profile, services, settings
- **User:** Current logged-in user only

---

#### `users.userWallet`
**Description:** Fetch user's wallet balance.
- **Location:** `/imports/api/Users/server/publications.js` (line 42)
- **Parameters:** None
- **Returns:** User document with fields: wallet, pendingOrderSummary
- **User:** Current logged-in user only

---

#### `users.getRoles`
**Description:** Fetch user's assigned roles.
- **Location:** `/imports/api/Users/server/publications.js` (line 24)
- **Parameters:** None
- **Returns:** Role assignments for the user
- **User:** Current logged-in user only

---

---

## INVOICES API

### Publications

#### `zhinvoices.byUser`
**Description:** Fetch invoices for the current user.
- **Location:** `/imports/api/ZhInvoices/server/publications.js` (line 4)
- **Parameters:** None (uses logged-in user's `zh_contact_id`)
- **Returns:** ZhInvoices collection documents matching user's contact ID, sorted by date (descending), limit 1000
- **User:** Current logged-in user only
- **Fields Returned:** invoice_id, reference_number, date, status, total, balance, customer info, line_items, notes, terms, timestamps
- **Used in Flutter:** `OrderService.fetchMyInvoices()` - **Note:** Currently uses a method call, should check if using this publication instead

---

---

## RELATED METHODS (Used with Orders)

### Method: `users.getUserWallet`
**Purpose:** Get and sync user's wallet from external system.
- **Location:** Referenced in `/imports/ui/components/Orders/MyOrdersList/MyOrdersList.js`

### Method: `zhInvoices.getUserInvoices`
**Purpose:** Get user's invoices.
- **Location:** Called from Flutter `OrderService.fetchMyInvoices()`
- **Returns:** Array of invoice documents

---

---

## ORDER STATUS CONSTANTS

From `/imports/modules/constants.js`:

```javascript
const OrderStatus = {
  Saved: { name: 'Saved', display_value: 'Draft', label: 'warning' },
  Pending: { name: 'Pending', display_value: 'Order Placed', label: 'brand-yellow' },
  Processing: { name: 'Processing', display_value: 'Processing', label: 'warning' },
  Awaiting_Fulfillment: { name: 'Awaiting_Fulfillment', display_value: 'Packing', label: 'brand-yellow' },
  Awaiting_Payment: { name: 'Awaiting_Payment', display_value: 'Awaiting Payment', label: 'danger' },
  Completed: { name: 'Completed', display_value: 'Completed', label: 'success' },
  Cancelled: { name: 'Cancelled', display_value: 'Cancelled', label: 'primary' },
  Shipped: { name: 'Shipped', display_value: 'Shipped', label: 'info' },
  Partially_Completed: { name: 'Partially_Completed', display_value: 'Partially Completed', label: 'danger' },
};
```

---

---

## RECOMMENDATIONS FOR FLUTTER APP

### Current Best Practices:

1. **For Order List:** Use `orders.mylist` publication ✓
   - Fetches last 50 orders, sorted by newest first
   - Efficient for paginated list view

2. **For Order Details:** Use existing data from `orders.mylist`
   - Search the local Orders collection instead of new subscription
   - `orders.orderDetails` publication exists but requires re-subscription
   - Current approach in `OrderService.getOrderStatus()` is correct

3. **For Creating Orders:** Use `orders.upsert` method ✓
   - Handles both create and update
   - Server calculates totals automatically
   - Security: validates user ownership before updating

4. **For Invoices:** Use `orders.mylist` or check if `zhInvoices.byUser` publication is better
   - Current method: `zhInvoices.getUserInvoices()`
   - Alternative publication: `zhinvoices.byUser`

---

## CONNECTION NOTES

- **Subscription Timeout:** Default 5 seconds in Flutter client
- **Connection Persistence:** MeteorClient maintains single connection
- **Auth Handling:** `waitForAuth()` should be called before subscriptions
- **Delay:** Add 1000ms delay after subscription to ensure documents are received

---

## Future API Enhancements

Consider checking if the following might be needed:

1. `orders.recentUpdates` - For real-time status updates
2. `orders.byProductOrderList` - For filtering by product list
3. Pagination support for orders.mylist (currently returns only last 50)

---

Generated: January 17, 2026
