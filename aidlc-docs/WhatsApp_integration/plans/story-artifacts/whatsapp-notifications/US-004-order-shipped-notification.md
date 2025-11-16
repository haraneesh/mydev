# US-004: Receive WhatsApp Notification When Order is Shipped

**Story ID**: US-004  
**Epic**: Customer Notification Experience  
**Priority**: Must-Have (MVP)  
**Status**: Draft

---

## User Story

**As a** customer  
**I want** to receive a WhatsApp notification when my order is shipped  
**So that** I know my order is on the way and can track its delivery

---

## Acceptance Criteria

### AC1: Notification Triggered on Shipped Status
- **Given** my order status is "Awaiting_Fulfillment" or earlier
- **When** the order status changes to "Shipped"
- **Then** I should receive a WhatsApp notification within 1 minute

### AC2: Message Template Content
- **Given** my order is shipped
- **When** the WhatsApp notification is sent
- **Then** the message should include:
  - Customer name (greeting)
  - Order number/ID
  - Shipment confirmation
  - Delivery partner information (if available from Porter integration)
  - Estimated delivery date/time
  - Preparation instructions (be available to receive)

**Example Message Template**:
```
Hi {customerName},

Great news! Your order #{orderNumber} has been shipped! 🚚

Your order is on its way and will be delivered by {deliveryDate}.

{deliveryPartnerInfo}

Please be available to receive your delivery.

Thank you for choosing Namma Suvai! 🌿
```

**With Delivery Partner**:
```
Delivery Partner: {partnerName}
Contact: {partnerPhone}
```

**Without Delivery Partner**:
```
Our delivery team will reach you soon.
```

### AC3: Include Porter Details if Available
- **Given** my order has Porter delivery integration
- **When** Porter order is created and tracking info is available
- **Then** the WhatsApp message should include Porter-specific delivery details

### AC4: No Duplicate Notifications
- **Given** my order status was already "Shipped"
- **When** an admin updates other fields
- **Then** I should NOT receive another shipped notification

### AC5: Notification Delivery Tracking
- **Given** a WhatsApp notification is sent
- **When** the API responds
- **Then** the system should log message ID, status, and timestamp

---

## Technical Notes

### Integration Points
- Hook into `updateOrderStatus` and `updateMyOrderStatus` methods
- Trigger when status changes TO "Shipped"
- Check for Porter order details in `order.porterOrder` field
- Event: `Emitter.emit(Events.ORDER_SHIPPED, { orderId, userId, porterDetails })`

### Porter Integration
```javascript
// Check for Porter details
if (order.porterOrder && order.porterOrder.status === 'live') {
  // Include delivery partner info in template
  deliveryPartnerInfo = `Delivery Partner: Porter\nTracking available`
}
```

### Configuration
- Message template from: `/private/wp-templates/order-shipped-en.txt`

### Error Handling
- Log errors to console if notification fails
- Missing Porter details should not prevent notification

---

## Definition of Done

- [ ] Notification sent when status changes to Shipped
- [ ] Message includes all required fields
- [ ] Porter details included when available
- [ ] Graceful handling when Porter details missing
- [ ] No duplicate notifications
- [ ] Delivery status tracked
- [ ] Errors logged to console

---

## Dependencies

- US-001 completed
- Porter integration (optional)
- Message template approved

---

## Notes

- High-value touchpoint - customer expects this notification
- Should trigger anticipation and availability
- Porter integration is optional enhancement
