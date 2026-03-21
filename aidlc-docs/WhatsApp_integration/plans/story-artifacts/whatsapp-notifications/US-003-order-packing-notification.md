# US-003: Receive WhatsApp Notification When Order is Being Packed

**Story ID**: US-003  
**Epic**: Customer Notification Experience  
**Priority**: Must-Have (MVP)  
**Status**: Draft

---

## User Story

**As a** customer  
**I want** to receive a WhatsApp notification when my order is being packed  
**So that** I know my order is almost ready for delivery and can prepare to receive it

---

## Acceptance Criteria

### AC1: Notification Triggered on Packing Status
- **Given** my order status is "Processing" or earlier
- **When** the order status changes to "Awaiting_Fulfillment"
- **Then** I should receive a WhatsApp notification within 1 minute

### AC2: Message Template Content
- **Given** my order is being packed
- **When** the WhatsApp notification is sent
- **Then** the message should include:
  - Customer name (greeting)
  - Order number/ID
  - Status update (packing in progress)
  - Next step information (will be shipped soon)
  - Estimated delivery date reminder

**Example Message Template**:
```
Hi {customerName},

Your order #{orderNumber} is being packed! 📦

We're carefully packing your items and they'll be ready for shipment soon.

📅 Expected Delivery: {deliveryDate}

Almost there!

Namma Suvai 🌿
```

### AC3: No Duplicate Notifications
- **Given** my order status was already "Awaiting_Fulfillment"
- **When** an admin updates other order fields
- **Then** I should NOT receive another packing notification

### AC4: Notification Delivery Tracking
- **Given** a WhatsApp notification is sent
- **When** the API responds
- **Then** the system should log the message ID, status, and timestamp

---

## Technical Notes

### Integration Points
- Hook into `updateOrderStatus` and `updateMyOrderStatus` methods
- Trigger when status changes TO "Awaiting_Fulfillment"
- Event: `Emitter.emit(Events.ORDER_PACKING, { orderId, userId })`

### Configuration
- Message template from: `/private/wp-templates/order-packing-en.txt`

### Error Handling
- Log errors to console if notification fails
- Continue fulfillment workflow regardless of notification status

---

## Definition of Done

- [ ] Notification sent when status changes to Awaiting_Fulfillment
- [ ] Message includes all required template fields
- [ ] No duplicate notifications
- [ ] Delivery status tracked
- [ ] Errors logged to console
- [ ] Tested with status transitions

---

## Dependencies

- US-001 completed
- Message template approved

---

## Notes

- Critical touchpoint - customer should prepare for imminent delivery
- Packing preferences should be respected as per user profile
