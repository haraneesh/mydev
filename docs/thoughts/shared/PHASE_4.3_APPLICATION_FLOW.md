# Phase 4.3: Order Service & Submission - Application Flow

**Date**: January 5, 2025  
**Phase**: 4.3  
**Status**: Architecture & Flow Design

---

## High-Level Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                 Mobile App (Flutter)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ CheckoutScreen                                       │ │
│  │ • Form: name, phone, address                        │ │
│  │ • Validates inputs                                  │ │
│  │ • Shows loading spinner                             │ │
│  │ • Calls: cartProvider.placeOrder(checkoutData)      │ │
│  └────────────────────┬─────────────────────────────────┘ │
│                       │ (CheckoutData)                     │
│                       ↓                                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ CartProvider (State Management)                      │ │
│  │ • Receives CheckoutData                             │ │
│  │ • Calls: orderService.submitOrder(data)             │ │
│  │ • Clears cart on success                            │ │
│  │ • Returns orderId to screen                         │ │
│  └────────────────────┬─────────────────────────────────┘ │
│                       │ (Submit Order Request)            │
│                       ↓                                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ OrderService (Business Logic)                        │ │
│  │ • Validates phone format                            │ │
│  │ • Validates name (non-empty)                        │ │
│  │ • Validates address (non-empty)                     │ │
│  │ • Calls: meteorClient.call('orders.create', data)   │ │
│  │ • Transforms response                               │ │
│  │ • Returns orderId                                   │ │
│  └────────────────────┬─────────────────────────────────┘ │
│                       │ (RPC: orders.create)              │
│                       ↓                                     │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ MeteorClient (DDP Protocol)                          │ │
│  │ • Encodes method call                               │ │
│  │ • Sends via WebSocket                               │ │
│  │ • Awaits response                                   │ │
│  └────────────────────┬─────────────────────────────────┘ │
│                       │ (WebSocket)                        │
└───────────────────────┼────────────────────────────────────┘
                        │
                        ↓
        ┌───────────────────────────────┐
        │   Meteor Server (Backend)     │
        ├───────────────────────────────┤
        │                               │
        │  Meteor.methods({             │
        │    'orders.create'(data) {    │
        │      // Validate              │
        │      // Create order doc      │
        │      // Save to MongoDB       │
        │      // Return orderId        │
        │    }                          │
        │  })                           │
        │                               │
        └───────────────┬───────────────┘
                        │ (Response: {orderId})
                        ↓
                ┌───────────────────┐
                │ MongoDB (Orders   │
                │ Collection)       │
                │                   │
                │ {                 │
                │   _id: ...        │
                │   name: ...       │
                │   phone: ...      │
                │   address: ...    │
                │   items: [...]    │
                │   total: ...      │
                │   status: placed  │
                │ }                 │
                └───────────────────┘
```

---

## Detailed State & Data Flow

### 1. CheckoutScreen State
```dart
_CheckoutScreenState
  ├─ _formKey (GlobalKey<FormState>)
  ├─ _nameController (TextEditingController)
  ├─ _phoneController (TextEditingController)
  ├─ _addressController (TextEditingController)
  ├─ _isLoading (bool)
  │
  └─ _submitOrder() async
       ├─ Validate form
       ├─ Create CheckoutData
       ├─ Set loading = true
       ├─ Call cartProvider.placeOrder()
       │
       ├─ On success:
       │  ├─ Receive orderId from backend
       │  └─ Navigate to OrderConfirmationScreen(orderId)
       │
       └─ On error:
          ├─ Show snackbar with error
          └─ Set loading = false
```

### 2. CartProvider Flow
```dart
placeOrder(CheckoutData data)
  ├─ Validate cart not empty
  ├─ Call orderService.submitOrder(data)
  │
  ├─ On success:
  │  ├─ Get orderId from OrderService
  │  ├─ Clear cart: _items = []
  │  ├─ Call _cartStorage.clearCart()
  │  ├─ notifyListeners()
  │  └─ Return orderId
  │
  └─ On error:
     └─ Propagate exception
```

### 3. OrderService Flow
```dart
submitOrder(CheckoutData data)
  ├─ Validate inputs
  │  ├─ Phone: 10 digits, numeric
  │  ├─ Name: non-empty
  │  └─ Address: non-empty
  │
  ├─ Call meteorClient.call('orders.create', {
  │    'name': data.name,
  │    'phone': data.phone,
  │    'address': data.address,
  │    'items': data.items.map(...).toList(),
  │    'totalAmount': data.totalAmount,
  │  })
  │
  ├─ On success:
  │  ├─ Extract orderId from response
  │  ├─ Log success
  │  └─ Return orderId
  │
  └─ On error:
     ├─ Log error details
     └─ Throw OrderSubmissionException
```

### 4. MeteorClient RPC Call
```dart
call('orders.create', [orderPayload])
  ├─ Encode DDP message:
  │  {
  │    'msg': 'method',
  │    'method': 'orders.create',
  │    'params': [orderPayload],
  │    'id': 'method_1'
  │  }
  │
  ├─ Send via WebSocket
  ├─ Wait for DDP response: 'result' or 'error'
  │
  ├─ On 'result':
  │  ├─ Extract result payload
  │  └─ Return to OrderService
  │
  └─ On 'error':
     ├─ Create DDP error from response
     └─ Throw error
```

### 5. Meteor Server Method
```javascript
Meteor.methods({
  'orders.create'(orderData) {
    // Validate
    if (!orderData.name) throw new Error('Name required');
    if (!orderData.phone || orderData.phone.length !== 10) {
      throw new Error('Invalid phone');
    }
    if (!orderData.address) throw new Error('Address required');
    
    // Create document
    const orderId = Orders.insert({
      name: orderData.name,
      phone: orderData.phone,
      address: orderData.address,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      status: 'placed',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    // Return response
    return {
      orderId: orderId,
      success: true,
    };
  }
});
```

---

## Data Structures

### CheckoutData
```dart
class CheckoutData {
  final String name;           // "John Doe"
  final String phone;          // "9876543210"
  final String address;        // "123 Main St, City"
}
```

### Order Payload (sent to backend)
```dart
{
  'name': 'John Doe',
  'phone': '9876543210',
  'address': '123 Main St, City',
  'items': [
    {
      'productId': 'prod_1',
      'quantity': 2,
      'price': 250.0,
      'subtotal': 500.0,
    },
    {
      'productId': 'prod_2',
      'quantity': 1,
      'price': 100.0,
      'subtotal': 100.0,
    }
  ],
  'totalAmount': 600.0,
}
```

### Meteor Orders Document
```javascript
{
  _id: ObjectId(),
  name: 'John Doe',
  phone: '9876543210',
  address: '123 Main St, City',
  items: [
    {
      productId: 'prod_1',
      quantity: 2,
      price: 250.0,
      subtotal: 500.0,
    },
    {
      productId: 'prod_2',
      quantity: 1,
      price: 100.0,
      subtotal: 100.0,
    }
  ],
  totalAmount: 600.0,
  status: 'placed',
  createdAt: ISODate(),
  updatedAt: ISODate(),
}
```

### Order Model (response)
```dart
class Order {
  final String id;              // MongoDB _id
  final List<CartItem> items;   // Order items
  final double totalAmount;     // Total cost
  final String status;          // 'placed', 'confirmed', 'delivered'
  final DateTime createdAt;     // Creation timestamp
  
  Order.fromJson(Map<String, dynamic> json)
    : id = json['_id'],
      items = [], // Would be populated if needed
      totalAmount = json['totalAmount'].toDouble(),
      status = json['status'] ?? 'placed',
      createdAt = DateTime.parse(json['createdAt']);
}
```

---

## Error Handling

### Client-Side Validation
```
Input Error → Show validation message → No network call
```

**Examples**:
- Phone not 10 digits → "Phone must be 10 digits"
- Name empty → "Name is required"
- Address empty → "Address is required"

### Server-Side Validation
```
Invalid data → Server rejects → Show error snackbar → User can retry
```

**Examples**:
- Database error → "Could not save order. Try again."
- Server timeout → "Server did not respond. Try again."

### Network Errors
```
Connection lost → Show error → User can retry
```

**Examples**:
- WebSocket closed → "Network connection lost"
- Timeout → "Request timed out"

---

## Success Scenarios

### Scenario 1: Happy Path
```
User fills form ✓
  ↓
User clicks "Place Order" ✓
  ↓
Form validates ✓
  ↓
OrderService validates ✓
  ↓
Call sent to Meteor ✓
  ↓
Meteor creates order ✓
  ↓
Return orderId ✓
  ↓
Cart cleared ✓
  ↓
Navigate to confirmation ✓
  ↓
Show real order ID ✓
```

### Scenario 2: Invalid Phone
```
User enters "abc" for phone
  ↓
Form validator rejects
  ↓
Show error: "Phone must be 10 digits"
  ↓
User corrects
  ↓
Submit succeeds
```

### Scenario 3: Network Error
```
User clicks "Place Order"
  ↓
Network fails during call
  ↓
OrderService catches error
  ↓
CartProvider propagates to screen
  ↓
Screen shows snackbar: "Network error"
  ↓
Loading spinner stops
  ↓
User can retry
```

---

## Integration Points Summary

| Layer | Component | Responsibility |
|-------|-----------|-----------------|
| **UI** | CheckoutScreen | Form validation, submit, navigation |
| **State** | CartProvider | Order orchestration, cart clearing |
| **Service** | OrderService | Input validation, API call |
| **Transport** | MeteorClient | DDP protocol, WebSocket |
| **Backend** | Meteor Method | Database persistence, response |
| **Storage** | MongoDB | Order persistence |

---

## Key Design Decisions

1. **Validation at Both Ends**
   - Client: Fast feedback
   - Server: Security & data integrity

2. **Service Layer Separation**
   - OrderService handles order logic
   - ProductService handles product logic
   - CartProvider coordinates between them

3. **Real Order IDs**
   - Generated by MongoDB (_id field)
   - Returned immediately to client
   - Enables order tracking

4. **Cart Clearing**
   - Done after successful order
   - Cleared from both memory and storage
   - Prevents accidental duplicates

5. **Error Messages**
   - Client errors: Validation messages (immediate)
   - Server errors: Generic + log details
   - Network errors: Retry-friendly

---

**Status**: Flow Architecture Complete  
**Ready**: Begin Implementation
