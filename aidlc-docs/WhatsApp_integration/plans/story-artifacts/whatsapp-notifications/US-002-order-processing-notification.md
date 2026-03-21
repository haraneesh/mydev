# US-002: Receive WhatsApp Notification When Order is Processing

**Story ID**: US-002  
**Epic**: Customer Notification Experience  
**Priority**: Must-Have (MVP)  
**Status**: Draft

---

## User Story

**As a** customer  
**I want** to receive a WhatsApp notification when my order starts being processed  
**So that** I know my order is actively being prepared

---

## Acceptance Criteria

### AC1: Notification Triggered on Processing Status
- **Given** my order status is "Pending" or "Saved"
- **When** the order status changes to "Processing"
- **Then** I should receive a WhatsApp notification within 1 minute

### AC2: Message Template Content
- **Given** my order is being processed
- **When** the WhatsApp notification is sent
- **Then** the message should include:
  - Customer name (greeting)
  - Order number/ID
  - Status update message
  - What's happening (items being sourced/prepared)
  - Estimated delivery date reminder

**Example Message Template**:
```
Hi {customerName},

Good news! Your order #{orderNumber} is now being processed. 📋

Our team is preparing your items and ensuring the freshest selection for you.

📅 Expected Delivery: {deliveryDate}

Thank you for your patience!

Namma Suvai 🌿
```

### AC3: No Duplicate Notifications
- **Given** my order status was already "Processing"
- **When** an admin updates other order fields
- **Then** I should NOT receive another processing notification

### AC4: Notification Delivery Tracking
- **Given** a WhatsApp notification is sent
- **When** the API responds
- **Then** the system should log the message ID, status, and timestamp in orders collection

---

## Technical Notes

### Integration Points
- Hook into `updateOrderStatus` and `updateMyOrderStatus` methods
- Trigger when status changes TO "Processing" (OrderStatus.Processing.name)
- Check previous status to avoid duplicate notifications
- Event: `Emitter.emit(Events.ORDER_PROCESSING, { orderId, userId })`

### Configuration
- Message template from: `/private/wp-templates/order-processing-en.txt`

### Error Handling
- Log errors to console if notification fails
- Continue order processing workflow regardless of notification status

---

## Definition of Done

- [ ] Notification sent when status changes to Processing
- [ ] Message includes all required template fields
- [ ] No duplicate notifications for same status
- [ ] Delivery status tracked in database
- [ ] Errors logged to console
- [ ] Tested with various status transition scenarios

---

## Dependencies

- US-001 completed (notification infrastructure in place)
- Message template approved by WhatsApp

---

## Notes

- Informational update to keep customer engaged
- Builds confidence that order is actively being handled
