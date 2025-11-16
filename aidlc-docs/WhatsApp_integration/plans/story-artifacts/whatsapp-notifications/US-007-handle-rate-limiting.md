# US-007: Handle WhatsApp API Rate Limiting

**Story ID**: US-007  
**Epic**: System Integration & Error Handling  
**Priority**: Must-Have (MVP)  
**Status**: Draft

---

## User Story

**As a** system  
**I want** to gracefully handle WhatsApp API rate limiting  
**So that** notifications continue to be processed without causing application errors

---

## Acceptance Criteria

### AC1: Detect Rate Limit Errors
- **Given** the system sends multiple WhatsApp notifications in quick succession
- **When** the WhatsApp API returns a rate limit error (HTTP 429 or specific error code)
- **Then** the system should detect and handle it appropriately

### AC2: Log Rate Limit Errors
- **Given** a rate limit error is detected
- **When** the error occurs
- **Then** the system should log to console:
  - Error message: "WhatsApp API rate limit exceeded"
  - Order ID that triggered the error
  - Timestamp
  - Retry attempt number (if applicable)
  - Rate limit details from API response

**Console Log Format**:
```javascript
console.error('[WhatsApp Notification] Rate limit exceeded', {
  orderId: order._id,
  orderNumber: order.orderNumber,
  notificationType: 'order_placed',
  timestamp: new Date(),
  rateLimitInfo: error.response.data,
  retryAfter: error.response.headers['retry-after']
});
```

### AC3: Store Failed Notification Status
- **Given** a rate limit error occurs
- **When** the notification fails
- **Then** the system should:
  - Store notification status as 'failed' in orders collection
  - Store error type as 'rate_limit'
  - Store error message
  - NOT retry immediately (to avoid further rate limiting)

### AC4: Continue Order Processing
- **Given** a WhatsApp notification fails due to rate limiting
- **When** the error is handled
- **Then** the order processing workflow should continue normally
- **And** the order status should not be rolled back

### AC5: Bulk Order Scenarios
- **Given** admin performs bulk order status updates
- **When** multiple notifications need to be sent
- **Then** implement basic throttling (e.g., 1 notification per second)
- **And** log if throttling is applied

---

## Technical Notes

### Detection
```javascript
try {
  // Send WhatsApp notification
  const response = await whatsappAPI.sendMessage(params);
} catch (error) {
  if (error.response?.status === 429 || 
      error.code === 'RATE_LIMIT_EXCEEDED') {
    // Handle rate limiting
    handleRateLimitError(orderId, error);
  }
}
```

### Rate Limit Handling
```javascript
function handleRateLimitError(orderId, error) {
  console.error('[WhatsApp Notification] Rate limit exceeded', {
    orderId,
    error: error.message,
    retryAfter: error.response?.headers['retry-after'],
    timestamp: new Date()
  });
  
  // Store failure in database
  Orders.update(orderId, {
    $push: {
      whatsappNotifications: {
        status: 'failed',
        errorType: 'rate_limit',
        error: error.message,
        attemptedAt: new Date()
      }
    }
  });
}
```

### Basic Throttling
```javascript
// Implement simple delay for bulk operations
const NOTIFICATION_DELAY_MS = 1000; // 1 second between notifications

async function sendBulkNotifications(orders) {
  for (const order of orders) {
    await sendWhatsAppNotification(order);
    await new Promise(resolve => setTimeout(resolve, NOTIFICATION_DELAY_MS));
  }
}
```

---

## Definition of Done

- [ ] Rate limit errors detected and caught
- [ ] Errors logged to console with all relevant details
- [ ] Failed status stored in database
- [ ] Order processing continues despite notification failure
- [ ] Basic throttling for bulk operations
- [ ] No application crashes due to rate limiting
- [ ] Tested with simulated rate limit scenarios

---

## Dependencies

- US-001 completed (notification infrastructure)
- WhatsApp API error response documentation

---

## Notes

- WhatsApp Business API has rate limits that vary by plan/provider
- Future enhancement: implement retry queue with exponential backoff
- Future enhancement: monitoring dashboard for rate limit occurrences
- Consider implementing circuit breaker pattern for sustained failures
