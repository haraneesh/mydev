# US-005: Receive WhatsApp Notification When Order is Completed

**Story ID**: US-005  
**Epic**: Customer Notification Experience  
**Priority**: Must-Have (MVP)  
**Status**: Draft

---

## User Story

**As a** customer  
**I want** to receive a WhatsApp notification when my order is delivered/completed  
**So that** I have confirmation of successful delivery and can provide feedback if needed

---

## Acceptance Criteria

### AC1: Notification Triggered on Completed Status
- **Given** my order status is "Shipped" or earlier
- **When** the order status changes to "Completed"
- **Then** I should receive a WhatsApp notification within 1 minute

### AC2: Message Template Content
- **Given** my order is completed
- **When** the WhatsApp notification is sent
- **Then** the message should include:
  - Customer name (greeting)
  - Order number/ID
  - Delivery confirmation
  - Thank you message
  - Invitation to provide feedback (optional)
  - Encouragement for next order

**Example Message Template**:
```
Hi {customerName},

Your order #{orderNumber} has been delivered successfully! ✅

We hope you enjoy your fresh, healthy products from Namma Suvai.

🌱 Check out our returnable containers - please keep them safe for collection!

Thank you for your order. We look forward to serving you again!

Namma Suvai 🌿
```

### AC3: Returnable Containers Reminder
- **Given** my order includes returnable containers
- **When** the completion notification is sent
- **Then** the message should include a reminder about returning containers

### AC4: No Duplicate Notifications
- **Given** my order status was already "Completed"
- **When** an admin updates other fields
- **Then** I should NOT receive another completion notification

### AC5: Notification Delivery Tracking
- **Given** a WhatsApp notification is sent
- **When** the API responds
- **Then** the system should log message ID, status, and timestamp

---

## Technical Notes

### Integration Points
- Hook into `updateOrderStatus` method
- Trigger when status changes TO "Completed"
- Check for returnables in order: `order.productReturnables`
- Event: `Emitter.emit(Events.ORDER_COMPLETED, { orderId, userId })`

### Returnable Logic
```javascript
// Check if order has returnables
if (order.productReturnables && order.productReturnables.length > 0) {
  // Include returnable reminder in template
  returnableReminder = "🌱 Check out our returnable containers - please keep them safe for collection!"
}
```

### Configuration
- Message template from: `/private/wp-templates/order-completed-en.txt`

### Error Handling
- Log errors to console if notification fails
- Missing returnables data should not prevent notification

---

## Definition of Done

- [ ] Notification sent when status changes to Completed
- [ ] Message includes all required fields
- [ ] Returnable reminder included when applicable
- [ ] Thank you and encouragement for next order
- [ ] No duplicate notifications
- [ ] Delivery status tracked
- [ ] Errors logged to console

---

## Dependencies

- US-001 completed
- Message template approved

---

## Notes

- Final touchpoint in order lifecycle
- Opportunity to build loyalty and encourage repeat orders
- Returnable containers are important business model element
- Consider future enhancement: feedback request link
