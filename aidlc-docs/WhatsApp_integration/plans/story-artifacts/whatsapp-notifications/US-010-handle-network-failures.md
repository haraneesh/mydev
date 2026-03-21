# US-010: Handle Network and Connection Failures

**Story ID**: US-010  
**Epic**: System Integration & Error Handling  
**Priority**: Must-Have (MVP)  
**Status**: Draft

---

## User Story

**As a** system  
**I want** to gracefully handle network and connection failures when sending WhatsApp notifications  
**So that** temporary network issues don't crash the application or disrupt order processing

---

## Acceptance Criteria

### AC1: Detect Network Timeout Errors
- **Given** the system attempts to send a WhatsApp notification
- **When** the API request times out (no response within reasonable time)
- **Then** the system should catch the timeout error

### AC2: Detect Connection Refused Errors
- **Given** the system attempts to send a WhatsApp notification
- **When** the connection to WhatsApp API is refused
- **Then** the system should catch the connection error

### AC3: Detect DNS Resolution Failures
- **Given** the system attempts to send a WhatsApp notification
- **When** the API endpoint cannot be resolved
- **Then** the system should catch the DNS error

### AC4: Log Network Errors with Details
- **Given** a network error occurs
- **When** the error is caught
- **Then** the system should log to console:
  - Error message: "WhatsApp notification failed - network error"
  - Error type (timeout, connection refused, DNS failure, etc.)
  - Order ID
  - Timestamp
  - Network error details

**Console Log Format**:
```javascript
console.error('[WhatsApp Notification] Network error', {
  errorType: 'timeout' | 'connection_refused' | 'dns_failure' | 'network_error',
  errorMessage: error.message,
  errorCode: error.code,
  orderId: order._id,
  orderNumber: order.orderNumber,
  notificationType: 'order_placed',
  timestamp: new Date(),
  retryable: true
});
```

### AC5: Store Network Failure Status
- **Given** a network error occurs
- **When** the notification fails
- **Then** the system should:
  - Store notification status as 'failed' in orders collection
  - Store error type as 'network_error'
  - Store error message and code
  - Mark as retryable

### AC6: Set Request Timeout
- **Given** the system sends a WhatsApp notification
- **When** the API request is made
- **Then** set a reasonable timeout (e.g., 10 seconds)
- **And** cancel the request if timeout is exceeded

### AC7: Continue Order Processing
- **Given** a WhatsApp notification fails due to network error
- **When** the error is handled
- **Then** the order processing workflow should continue normally
- **And** the order status should not be rolled back

### AC8: Handle Partial Network Failures
- **Given** the API request starts but connection drops mid-request
- **When** the error occurs
- **Then** handle as a network error and log appropriately

---

## Technical Notes

### Network Error Detection
```javascript
async function sendWhatsAppNotification(order, messageType) {
  try {
    // Set timeout for API request
    const response = await axios.post(apiUrl, payload, {
      timeout: 10000, // 10 seconds
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Success handling
    return handleSuccessResponse(response, order);
    
  } catch (error) {
    // Detect network error types
    if (error.code === 'ECONNREFUSED') {
      handleNetworkError(order, 'connection_refused', error);
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      handleNetworkError(order, 'timeout', error);
    } else if (error.code === 'ENOTFOUND') {
      handleNetworkError(order, 'dns_failure', error);
    } else if (error.code === 'ENETUNREACH' || error.code === 'EHOSTUNREACH') {
      handleNetworkError(order, 'network_unreachable', error);
    } else {
      // Other errors (auth, validation, etc.)
      handleOtherError(order, error);
    }
  }
}
```

### Network Error Handler
```javascript
function handleNetworkError(order, errorType, error) {
  console.error('[WhatsApp Notification] Network error', {
    errorType,
    errorMessage: error.message,
    errorCode: error.code,
    orderId: order._id,
    orderNumber: order.orderNumber,
    timestamp: new Date(),
    retryable: true,
    hint: errorType === 'dns_failure' 
      ? 'Check internet connectivity and DNS settings'
      : 'Temporary network issue, may resolve automatically'
  });
  
  // Store failure in database
  Orders.update(order._id, {
    $push: {
      whatsappNotifications: {
        status: 'failed',
        errorType: 'network_error',
        errorSubType: errorType,
        error: error.message,
        errorCode: error.code,
        retryable: true,
        attemptedAt: new Date()
      }
    }
  });
  
  // Continue order processing - don't throw
}
```

### Timeout Configuration
```javascript
// In configuration file or constants
const WHATSAPP_API_TIMEOUT = parseInt(
  process.env.WHATSAPP_API_TIMEOUT_MS || '10000'
, 10);

// Axios instance with default timeout
const whatsappClient = axios.create({
  timeout: WHATSAPP_API_TIMEOUT,
  baseURL: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0'
});
```

### Error Code Reference
```javascript
// Common network error codes
const NETWORK_ERROR_CODES = {
  ECONNREFUSED: 'Connection refused by server',
  ETIMEDOUT: 'Request timeout',
  ECONNABORTED: 'Connection aborted',
  ENOTFOUND: 'DNS lookup failed',
  ENETUNREACH: 'Network unreachable',
  EHOSTUNREACH: 'Host unreachable',
  ECONNRESET: 'Connection reset by peer'
};
```

---

## Definition of Done

- [ ] Network timeout errors detected and caught
- [ ] Connection refused errors detected and caught
- [ ] DNS resolution failures detected and caught
- [ ] All network errors logged to console with details
- [ ] Failed status stored in database with error codes
- [ ] Request timeout set to 10 seconds
- [ ] Order processing continues despite network failures
- [ ] No application crashes
- [ ] Tested with: simulated timeout, connection refused, DNS failure

---

## Dependencies

- US-001 completed
- HTTP client library (axios or similar)
- Network connectivity for testing

---

## Notes

- Network failures are temporary and often resolve on their own
- These errors are marked as 'retryable' for future enhancement
- Future enhancement: implement retry queue for failed notifications
- Future enhancement: exponential backoff retry strategy
- Future enhancement: circuit breaker to prevent cascade failures
- Monitor frequency of network errors - high frequency indicates infrastructure issue
- Different from API errors (4xx, 5xx) which are application/config issues
