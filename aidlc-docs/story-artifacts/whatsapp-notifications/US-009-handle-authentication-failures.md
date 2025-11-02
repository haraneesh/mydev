# US-009: Handle WhatsApp API Authentication Failures

**Story ID**: US-009  
**Epic**: System Integration & Error Handling  
**Priority**: Must-Have (MVP)  
**Status**: Draft

---

## User Story

**As a** system  
**I want** to gracefully handle WhatsApp API authentication failures  
**So that** configuration issues are logged and don't crash the application

---

## Acceptance Criteria

### AC1: Detect Authentication Errors
- **Given** the system attempts to send a WhatsApp notification
- **When** the WhatsApp API returns an authentication error (HTTP 401, 403)
- **Then** the system should detect and handle it appropriately

### AC2: Log Authentication Errors with Details
- **Given** an authentication error occurs
- **When** the error is caught
- **Then** the system should log to console:
  - Error message: "WhatsApp API authentication failed"
  - Error type (401 Unauthorized vs 403 Forbidden)
  - API endpoint attempted
  - Timestamp
  - Configuration hint (which env variable to check)
  - Order ID that triggered the attempt

**Console Log Format**:
```javascript
console.error('[WhatsApp Notification] Authentication failed', {
  errorType: error.response.status === 401 ? 'Unauthorized' : 'Forbidden',
  errorMessage: error.message,
  apiEndpoint: error.config.url,
  orderId: order._id,
  orderNumber: order.orderNumber,
  timestamp: new Date(),
  hint: 'Check WHATSAPP_API_KEY and WHATSAPP_PHONE_NUMBER_ID environment variables'
});
```

### AC3: Validate Configuration on Startup
- **Given** the server starts
- **When** the WhatsApp notification module initializes
- **Then** it should validate that required environment variables exist:
  - `WHATSAPP_API_KEY`
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_BUSINESS_ACCOUNT_ID` (if required by provider)
- **And** log warning if any are missing

**Startup Validation Log**:
```javascript
console.warn('[WhatsApp Notification] Missing configuration', {
  missingVars: ['WHATSAPP_API_KEY', 'WHATSAPP_PHONE_NUMBER_ID'],
  message: 'WhatsApp notifications will not be sent until configuration is provided',
  timestamp: new Date()
});
```

### AC4: Store Authentication Failure Status
- **Given** an authentication error occurs
- **When** the notification fails
- **Then** the system should:
  - Store notification status as 'failed' in orders collection
  - Store error type as 'auth_failure'
  - Store error message
  - Include HTTP status code

### AC5: Skip Notifications if Not Configured
- **Given** required environment variables are missing
- **When** an order status changes
- **Then** the system should:
  - Skip WhatsApp notification attempts
  - Log once that notifications are disabled
  - Continue order processing normally

### AC6: Continue Order Processing
- **Given** a WhatsApp notification fails due to authentication
- **When** the error is handled
- **Then** the order processing workflow should continue normally
- **And** the order status should not be rolled back

### AC7: Expired/Invalid Token Detection
- **Given** the API key or token has expired
- **When** multiple authentication failures occur
- **Then** log a consolidated error message suggesting token renewal

---

## Technical Notes

### Startup Configuration Validation
```javascript
// In server startup
Meteor.startup(() => {
  const requiredEnvVars = [
    'WHATSAPP_API_KEY',
    'WHATSAPP_PHONE_NUMBER_ID'
  ];
  
  const missing = requiredEnvVars.filter(
    varName => !process.env[varName]
  );
  
  if (missing.length > 0) {
    console.warn('[WhatsApp Notification] Configuration incomplete', {
      missingVars: missing,
      message: 'WhatsApp notifications disabled until configuration provided'
    });
    
    // Set flag to skip notifications
    global.WHATSAPP_NOTIFICATIONS_ENABLED = false;
  } else {
    global.WHATSAPP_NOTIFICATIONS_ENABLED = true;
    console.info('[WhatsApp Notification] Service initialized successfully');
  }
});
```

### Authentication Error Handling
```javascript
async function sendWhatsAppNotification(order, messageType) {
  // Check if service is enabled
  if (!global.WHATSAPP_NOTIFICATIONS_ENABLED) {
    return; // Skip silently
  }
  
  try {
    const response = await whatsappAPI.sendMessage({
      apiKey: process.env.WHATSAPP_API_KEY,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      to: customer.phone,
      template: messageTemplate
    });
    
    // Success handling
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('[WhatsApp Notification] Authentication failed', {
        errorType: error.response.status === 401 ? 'Unauthorized' : 'Forbidden',
        errorMessage: error.message,
        orderId: order._id,
        hint: 'Check WHATSAPP_API_KEY and credentials in environment variables',
        timestamp: new Date()
      });
      
      // Store failure
      await Orders.updateAsync(order._id, {
        $push: {
          whatsappNotifications: {
            status: 'failed',
            errorType: 'auth_failure',
            httpStatus: error.response.status,
            error: error.message,
            attemptedAt: new Date()
          }
        }
      });
    } else {
      // Handle other errors
      throw error;
    }
  }
}
```

### Configuration Helper
```javascript
function getWhatsAppConfig() {
  return {
    apiKey: process.env.WHATSAPP_API_KEY,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0'
  };
}
```

---

## Definition of Done

- [ ] Authentication errors (401, 403) detected and caught
- [ ] Detailed errors logged to console with configuration hints
- [ ] Startup validation checks for required environment variables
- [ ] Warning logged if configuration missing
- [ ] Notifications skipped gracefully when not configured
- [ ] Failed status stored in database with error details
- [ ] Order processing continues despite authentication failures
- [ ] No application crashes
- [ ] Tested with: missing config, invalid API key, expired token

---

## Dependencies

- US-001 completed
- WhatsApp Business API credentials documentation
- Environment variable configuration guide

---

## Notes

- Authentication failures are critical configuration issues
- Should be caught early in deployment
- Future enhancement: health check endpoint to verify WhatsApp API connectivity
- Future enhancement: admin notification when auth failures detected
- Different providers (Twilio, MessageBird, Meta) may have different auth patterns
