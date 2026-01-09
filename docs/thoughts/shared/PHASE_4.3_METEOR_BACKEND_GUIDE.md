# Phase 4.3: Meteor Backend Implementation Guide

**Phase**: 4.3 (Order Service & Submission)  
**Date**: January 5, 2025  
**Audience**: Backend developers  
**Status**: Ready for implementation

---

## Overview

Phase 4.3 on the Flutter mobile client is complete. The backend needs to implement one core method: `orders.create` to receive and persist orders.

---

## Implementation Steps

### Step 1: Create Orders Collection Schema

**File**: `server/collections/orders.js` (or `imports/api/orders.js`)

```javascript
import { Mongo } from 'meteor/mongo';

export const Orders = new Mongo.Collection('orders');

// Define schema (if using aldeed:collection2)
Orders.attachSchema(new SimpleSchema({
  name: {
    type: String,
    required: true,
    min: 1,
  },
  phone: {
    type: String,
    required: true,
    regEx: /^[0-9]{10}$/,
  },
  address: {
    type: String,
    required: true,
    min: 5,
  },
  items: {
    type: Array,
    required: true,
    minCount: 1,
  },
  'items.$': {
    type: Object,
  },
  'items.$.productId': {
    type: String,
  },
  'items.$.productName': {
    type: String,
  },
  'items.$.quantity': {
    type: Number,
    min: 1,
  },
  'items.$.price': {
    type: Number,
  },
  'items.$.subtotal': {
    type: Number,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    allowedValues: ['placed', 'confirmed', 'preparing', 'delivered', 'cancelled'],
    defaultValue: 'placed',
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) return new Date();
    },
  },
  updatedAt: {
    type: Date,
    autoValue() {
      return new Date();
    },
  },
}));
```

### Step 2: Implement orders.create Method

**File**: `server/methods/orders.js` (or `imports/api/orders/methods.js`)

```javascript
import { Meteor } from 'meteor/meteor';
import { Orders } from '../collections/orders';
import { Products } from '../collections/products';

Meteor.methods({
  'orders.create'(orderData) {
    // Validate input
    if (!orderData) {
      throw new Meteor.Error('invalid-order', 'Order data is required');
    }

    // Name validation
    if (!orderData.name || orderData.name.trim().length === 0) {
      throw new Meteor.Error('name-required', 'Customer name is required');
    }

    // Phone validation
    if (!orderData.phone) {
      throw new Meteor.Error('phone-required', 'Phone number is required');
    }
    if (!/^[0-9]{10}$/.test(orderData.phone)) {
      throw new Meteor.Error('phone-invalid', 'Phone must be 10 digits');
    }

    // Address validation
    if (!orderData.address || orderData.address.trim().length === 0) {
      throw new Meteor.Error('address-required', 'Delivery address is required');
    }

    // Items validation
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Meteor.Error('items-required', 'Cart must have items');
    }

    // Verify products exist and prices match
    for (const item of orderData.items) {
      const product = Products.findOne({ _id: item.productId });
      if (!product) {
        throw new Meteor.Error(
          'product-not-found',
          `Product ${item.productId} not found`
        );
      }
      
      // Verify price hasn't changed significantly
      if (Math.abs(product.price - item.price) > 0.01) {
        throw new Meteor.Error(
          'price-mismatch',
          `Price for ${product.name} has changed`
        );
      }
    }

    // Total amount validation
    if (!orderData.totalAmount || orderData.totalAmount <= 0) {
      throw new Meteor.Error('total-invalid', 'Total amount must be greater than 0');
    }

    // Verify total matches items
    const calculatedTotal = orderData.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
    if (Math.abs(calculatedTotal - orderData.totalAmount) > 0.01) {
      throw new Meteor.Error('total-mismatch', 'Total amount does not match items');
    }

    // Create order
    try {
      const orderId = Orders.insert({
        name: orderData.name.trim(),
        phone: orderData.phone,
        address: orderData.address.trim(),
        items: orderData.items,
        totalAmount: orderData.totalAmount,
        status: 'placed',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(`Order created: ${orderId}`);

      // Return response
      return {
        orderId,
        success: true,
      };
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Meteor.Error('order-creation-failed', 'Failed to create order');
    }
  },
});
```

### Step 3: Create Publications for Order Retrieval

**File**: `server/publications/orders.js` (or `imports/api/orders/publications.js`)

```javascript
import { Meteor } from 'meteor/meteor';
import { Orders } from '../collections/orders';

// Publish single order
Meteor.publish('orders.one', function(params) {
  if (!params || !params.orderId) {
    return this.ready();
  }

  return Orders.find({ _id: params.orderId });
});

// Publish user's orders (for Phase 5)
Meteor.publish('orders.user', function() {
  if (!this.userId) {
    return this.ready();
  }

  return Orders.find(
    { userId: this.userId },
    { sort: { createdAt: -1 } }
  );
});

// Publish recent orders (admin only)
Meteor.publish('orders.recent', function() {
  if (!this.userId) {
    return this.ready();
  }

  // Check if user is admin (implement as needed)
  const user = Meteor.users.findOne(this.userId);
  if (!user || !user.admin) {
    return this.ready();
  }

  return Orders.find(
    {},
    { 
      sort: { createdAt: -1 },
      limit: 100 
    }
  );
});
```

### Step 4: Add to Meteor Startup

**File**: `server/main.js`

```javascript
import { Meteor } from 'meteor/meteor';
import './methods/orders'; // Import methods
import './publications/orders'; // Import publications
import { Orders } from './collections/orders';

Meteor.startup(() => {
  // Create indexes for performance
  Orders.rawCollection().createIndex({ phone: 1 });
  Orders.rawCollection().createIndex({ createdAt: -1 });
  Orders.rawCollection().createIndex({ status: 1 });
  
  console.log('Orders collection initialized');
});
```

---

## Testing the Implementation

### 1. Test with Meteor Shell

```javascript
// In Meteor shell or console
db.orders.insertOne({
  name: "Test User",
  phone: "9876543210",
  address: "123 Test St",
  items: [{productId: "1", quantity: 2, price: 250, subtotal: 500}],
  totalAmount: 500,
  status: "placed",
  createdAt: new Date()
})

// Query
db.orders.findOne()

// Check count
db.orders.countDocuments()
```

### 2. Test with Flutter App

```dart
// In Flutter app
final orderService = OrderService();
final product = Product(...);
final checkoutData = CheckoutData(
  name: 'Test User',
  phone: '9876543210',
  address: '123 Test St',
  items: [CartItem(product: product, quantity: 2)],
  totalAmount: 500.0,
);

try {
  final orderId = await orderService.submitOrder(checkoutData);
  print('Order created: $orderId');
} catch (e) {
  print('Error: $e');
}
```

### 3. Check Logs

```bash
# Meteor server logs
meteor logs

# Should see:
# Order created: ObjectId_string
# Orders collection initialized
```

---

## Validation Rules

### Name
- Required: Yes
- Type: String
- Min Length: 1 character
- Regex: None (allows any characters)

### Phone
- Required: Yes
- Type: String
- Format: Exactly 10 digits
- Regex: `^[0-9]{10}$`

### Address
- Required: Yes
- Type: String
- Min Length: 5 characters
- Max Length: 500 characters

### Items
- Required: Yes
- Type: Array of Objects
- Min Count: 1
- Max Count: 100
- Each item must have:
  - productId: String (exists in Products)
  - productName: String
  - quantity: Number (>= 1)
  - price: Number (must match current price)
  - subtotal: Number (quantity * price)

### Total Amount
- Required: Yes
- Type: Number
- Min: 0.01
- Must equal sum of all item subtotals

### Status
- Allowed values: 'placed', 'confirmed', 'preparing', 'delivered', 'cancelled'
- Default: 'placed'

---

## Error Responses

### Client Validation (Flutter)
```
ArgumentError: Name is required
ArgumentError: Phone must be 10 digits
ArgumentError: Address is required
```

### Server Validation (Meteor)
```javascript
{
  error: "Meteor.Error",
  reason: "name-required",
  message: "Customer name is required"
}

{
  error: "Meteor.Error",
  reason: "phone-invalid",
  message: "Phone must be 10 digits"
}

{
  error: "Meteor.Error",
  reason: "product-not-found",
  message: "Product xyz not found"
}

{
  error: "Meteor.Error",
  reason: "price-mismatch",
  message: "Price for Product has changed"
}

{
  error: "Meteor.Error",
  reason: "total-mismatch",
  message: "Total amount does not match items"
}

{
  error: "Meteor.Error",
  reason: "order-creation-failed",
  message: "Failed to create order"
}
```

---

## Database Schema

### Orders Collection

```javascript
{
  _id: ObjectId,
  
  // Customer info
  name: String,           // "John Doe"
  phone: String,          // "9876543210"
  address: String,        // "123 Main St, City"
  
  // Order content
  items: [
    {
      productId: String,      // "prod_123"
      productName: String,    // "Biryani"
      quantity: Number,       // 2
      price: Number,          // 250
      subtotal: Number,       // 500
    }
  ],
  totalAmount: Number,    // 500
  
  // Status tracking
  status: String,         // 'placed', 'confirmed', etc.
  
  // Timestamps
  createdAt: Date,        // Auto-set
  updatedAt: Date,        // Auto-set on updates
  
  // Future fields (Phase 5+)
  // userId: String,       // Link to user
  // paymentStatus: String,// pending, paid, failed
  // paymentId: String,    // Razorpay/Stripe ID
  // estimatedDelivery: Date,
  // trackingUrl: String,
}
```

---

## Indexes for Performance

```javascript
// Create in startup
Orders.rawCollection().createIndex({ phone: 1 });
Orders.rawCollection().createIndex({ createdAt: -1 });
Orders.rawCollection().createIndex({ status: 1 });

// Future (Phase 5)
Orders.rawCollection().createIndex({ userId: 1, createdAt: -1 });
Orders.rawCollection().createIndex({ paymentStatus: 1 });
```

---

## Logging & Monitoring

### Log Orders Created
```javascript
const orderId = Orders.insert({...});
console.log(`[ORDER] Created: ${orderId} for ${orderData.phone}`);

// For analytics
Meteor.call('analytics.logOrderCreated', orderId, orderData);
```

### Monitor Orders Table
```bash
# Check total orders
db.orders.countDocuments()

# Orders by status
db.orders.aggregate([
  { $group: { _id: '$status', count: { $sum: 1 } } }
])

# Revenue
db.orders.aggregate([
  { $group: { _id: null, total: { $sum: '$totalAmount' } } }
])

# Recent orders
db.orders.find().sort({ createdAt: -1 }).limit(10)
```

---

## Security Considerations

✅ **Input Validation**: All fields validated
✅ **Type Safety**: Strict type checking
✅ **Price Verification**: Compare against current prices
✅ **Total Verification**: Verify math is correct
✅ **Error Messages**: Generic (no internals exposed)
✅ **Logging**: Detailed for debugging
✅ **Error Handling**: Try-catch for database errors

⚠️ **Future Enhancements** (Phase 5+):
- User authentication (link orders to users)
- Rate limiting (prevent spam)
- Duplicate detection (same order twice)
- Fraud detection (unusual patterns)
- Payment verification (if payment-based)

---

## Integration Timeline

### Phase 4.3 (This Week)
- ✅ Flutter client ready
- 📋 Meteor backend implementation (THIS)
- 📋 Integration testing
- 📋 Verification

### Phase 5 (Next 2 weeks)
- Add user authentication
- Link orders to users
- Add order history API
- Implement order status tracking

### Phase 6 (Following weeks)
- Payment integration
- Real-time order updates
- SMS notifications
- Order tracking page

---

## File Structure Reference

```
server/
├── main.js                      (import methods & publications)
├── methods/
│   └── orders.js               (orders.create implementation)
├── publications/
│   └── orders.js               (orders.one, orders.user, orders.recent)
├── collections/
│   └── orders.js               (Orders collection & schema)
└── startup.js                  (indexes, initialization)
```

---

## Deployment Checklist

Before deploying, ensure:

- [ ] Orders collection exists in MongoDB
- [ ] orders.create method implemented
- [ ] Input validation complete
- [ ] Price verification working
- [ ] Indexes created
- [ ] Logging configured
- [ ] Error handling tested
- [ ] Publications implemented
- [ ] Method tested locally
- [ ] Flutter app can connect
- [ ] End-to-end flow tested
- [ ] Performance acceptable

---

## Troubleshooting

### "Collection already exists" error
**Solution**: Drop and recreate
```bash
meteor mongo
db.orders.drop()
# Method will recreate on next insert
```

### "Index already exists" error
**Solution**: Check existing indexes
```bash
db.orders.getIndexes()
db.orders.dropIndex('index_name')
```

### Method not found on client
**Solution**: Ensure methods are in server directory
```
server/methods/orders.js  ← Must be in server/
```

### Orders not persisting
**Solution**: Check MongoDB connection
```bash
meteor logs
# Should see MongoDB connection info
```

### Invalid DDP response
**Solution**: Check method returns correct format
```javascript
return {
  orderId: 'string',      // ← MUST have this
  success: true,          // ← MUST have this
};
```

---

## Performance Optimization

### Indexing
```javascript
// Fast queries by phone (customer lookup)
Orders.rawCollection().createIndex({ phone: 1 });

// Fast sorting by creation time
Orders.rawCollection().createIndex({ createdAt: -1 });

// Fast filtering by status
Orders.rawCollection().createIndex({ status: 1 });
```

### Pagination (for later)
```javascript
Meteor.publish('orders.paginated', function(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  return Orders.find({}, { skip, limit, sort: { createdAt: -1 } });
});
```

---

## Reference Documentation

- Meteor Docs: https://docs.meteor.com/
- MongoDB Docs: https://docs.mongodb.com/
- Collection2 Schema: https://github.com/aldeed/meteor-collection2/

---

**Status**: Ready for Implementation  
**Confidence**: High  
**Estimated Time**: 1-2 hours  
**Difficulty**: Medium

---

**Last Updated**: January 5, 2025  
**Target Audience**: Backend Developers  
**Phase**: 4.3
