# US-001: Receive WhatsApp Notification When Order is Placed

**Story ID**: US-001  
**Epic**: Customer Notification Experience  
**Priority**: Must-Have (MVP)  
**Status**: Draft

---

## User Story

**As a** customer  
**I want** to receive a WhatsApp notification immediately after I place an order  
**So that** I have confirmation that my order was received and know when to expect delivery

---

## Acceptance Criteria

### AC1: Notification Triggered on Order Placement
- **Given** I am a customer with a valid mobile number in my profile
- **When** I successfully place an order (order status changes to "Pending")
- **Then** I should receive a WhatsApp notification within 1 minute

### AC2: Message Template Content
- **Given** my order is placed
- **When** the WhatsApp notification is sent
- **Then** the message should include:
  - Customer name (greeting)
  - Order confirmation message
  - Order number/ID
  - Order date/time
  - Brief summary of items ordered (or item count)
  - Estimated delivery date
  - Order total amount
  - Thank you message

**Example Message Template**:
```
Hi {customerName},

Thank you for your order! 🎉

Your order #{orderNumber} has been placed successfully.

📦 Order Summary:
- {itemCount} items
- Total: ₹{orderTotal}

📅 Expected Delivery: {deliveryDate}

We'll keep you updated as we prepare your order.

Thank you for choosing Namma Suvai! 🌿
```

### AC3: Admin Placed Orders
- **Given** an admin places an order on my behalf
- **When** the order status is set to "Pending"
- **Then** I should still receive the same WhatsApp notification

### AC4: All Users Opted In
- **Given** I am a registered customer
- **When** I place an order
- **Then** I should receive the notification without needing to opt-in

### AC5: Notification Delivery Tracking
- **Given** a WhatsApp notification is sent
- **When** the API responds with delivery status
- **Then** the system should:
  - Log the WhatsApp message ID in the orders collection
  - Store notification delivery status (sent/failed)
  - Store timestamp of notification sent

---

## Technical Notes

### Integration Points
- Hook into `upsertOrder` method in `/imports/api/Orders/methods.js`
- Trigger when order status is set to "Pending" (OrderStatus.Pending.name)
- Use existing Meteor event system: `Emitter.emit(Events.ORDER_PLACED, { orderId, userId })`

### Database Changes
```javascript
// Add to Orders collection schema
{
  whatsappNotifications: [{
    messageId: String,        // WhatsApp API message ID
    status: String,           // 'sent', 'delivered', 'failed'
    statusType: String,       // 'order_placed', 'processing', etc.
    sentAt: Date,
    deliveredAt: Date,
    error: String             // Error message if failed
  }]
}
```

### Configuration
- WhatsApp API credentials from environment variables:
  - `WHATSAPP_API_KEY`
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_BUSINESS_ACCOUNT_ID`
- Message template from: `/private/wp-templates/order-placed-en.txt`

### Error Handling
- If user phone number is missing/invalid: Log error to console, skip notification
- If WhatsApp API fails: Log error to console with order ID and error details
- Do not block order placement if notification fails

---

## Definition of Done

- [ ] User story implemented and code committed
- [ ] WhatsApp notification sent within 1 minute of order placement
- [ ] Message includes all required fields from template
- [ ] Notification delivery status tracked in database
- [ ] Works for both customer-placed and admin-placed orders
- [ ] Errors logged to console
- [ ] Message template loaded from wp-templates folder
- [ ] Tested with valid and invalid phone numbers
- [ ] No order placement blocking if notification fails

---

## Dependencies

- WhatsApp Business API account setup
- Message template approved by WhatsApp
- Environment variables configured
- `wp-templates/order-placed-en.txt` template file created

---

## Notes

- First touchpoint with customer after order placement
- Critical for customer confidence and order confirmation
- Template variables must be properly escaped/sanitized
- Consider rate limiting for bulk order scenarios
