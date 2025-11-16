# US-006: Receive WhatsApp Notification When Order is Cancelled

**Story ID**: US-006  
**Epic**: Customer Notification Experience  
**Priority**: Must-Have (MVP)  
**Status**: Draft

---

## User Story

**As a** customer  
**I want** to receive a WhatsApp notification when my order is cancelled  
**So that** I am informed that my order will not be fulfilled and understand the reason

---

## Acceptance Criteria

### AC1: Notification Triggered on Cancellation
- **Given** my order is in any active status (Pending, Processing, Awaiting_Fulfillment)
- **When** the order status changes to "Cancelled"
- **Then** I should receive a WhatsApp notification within 1 minute

### AC2: Message Template Content
- **Given** my order is cancelled
- **When** the WhatsApp notification is sent
- **Then** the message should include:
  - Customer name (greeting)
  - Order number/ID
  - Cancellation confirmation
  - Reason for cancellation (if available)
  - Apology message
  - Invitation to place a new order
  - Contact information for support

**Example Message Template**:
```
Hi {customerName},

Your order #{orderNumber} has been cancelled.

{cancellationReason}

We sincerely apologize for any inconvenience caused.

If you have any questions or would like to place a new order, please feel free to contact us.

We hope to serve you again soon!

Namma Suvai 🌿
```

**With Reason**:
```
Reason: {reasonText}
```

**Without Reason**:
```
If you have any questions, please contact us.
```

### AC3: Customer-Initiated Cancellation
- **Given** I cancel my own order (via `updateMyOrderStatus`)
- **When** the cancellation is processed
- **Then** I should still receive a confirmation notification

### AC4: Admin-Initiated Cancellation
- **Given** an admin cancels my order
- **When** the cancellation is processed
- **Then** I should receive the notification with reason if provided

### AC5: Cancelled After Shipped
- **Given** my order status is "Shipped" or "Completed"
- **When** someone attempts to cancel
- **Then** notification should NOT be sent (order already in delivery/completed)

### AC6: Notification Delivery Tracking
- **Given** a WhatsApp notification is sent
- **When** the API responds
- **Then** the system should log message ID, status, and timestamp

---

## Technical Notes

### Integration Points
- Hook into `updateOrderStatus` and `updateMyOrderStatus` methods
- Trigger when status changes TO "Cancelled"
- Check previous status - only send if order was active (not already Shipped/Completed)
- Include cancellation reason from `order.cancellationReason` field if available
- Event: `Emitter.emit(Events.ORDER_CANCELLED, { orderId, userId, reason })`

### Cancellation Reason Logic
```javascript
// Include reason if available
let reasonText = "If you have any questions, please contact us.";
if (order.cancellationReason) {
  reasonText = `Reason: ${order.cancellationReason}`;
}
```

### Configuration
- Message template from: `/private/wp-templates/order-cancelled-en.txt`

### Error Handling
- Log errors to console if notification fails
- Missing cancellation reason should not prevent notification

---

## Definition of Done

- [ ] Notification sent when status changes to Cancelled
- [ ] Message includes all required fields
- [ ] Cancellation reason included when available
- [ ] Graceful message when reason not provided
- [ ] Works for both customer and admin cancellations
- [ ] No notification if order already shipped/completed
- [ ] No duplicate notifications
- [ ] Delivery status tracked
- [ ] Errors logged to console

---

## Dependencies

- US-001 completed
- Message template approved

---

## Notes

- Sensitive touchpoint - requires empathetic messaging
- Clear communication prevents customer confusion and support tickets
- Should encourage customer to try again
- Consider tracking cancellation reasons for business insights
