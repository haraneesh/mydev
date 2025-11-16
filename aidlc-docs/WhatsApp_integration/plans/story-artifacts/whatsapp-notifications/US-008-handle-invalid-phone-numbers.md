# US-008: Handle Invalid or Missing Phone Numbers

**Story ID**: US-008  
**Epic**: System Integration & Error Handling  
**Priority**: Must-Have (MVP)  
**Status**: Draft

---

## User Story

**As a** system  
**I want** to gracefully handle invalid or missing customer phone numbers  
**So that** notification failures don't disrupt order processing

---

## Acceptance Criteria

### AC1: Detect Missing Phone Numbers
- **Given** an order is placed by a customer
- **When** the system attempts to send a WhatsApp notification
- **And** the customer profile has no phone number (`user.profile.whMobilePhone` is null/undefined)
- **Then** the system should detect this before calling the API

### AC2: Detect Invalid Phone Number Format
- **Given** an order is placed by a customer
- **When** the system attempts to send a WhatsApp notification
- **And** the customer phone number is invalid format
- **Then** the system should validate and detect the issue

### AC3: Log Missing Phone Number Errors
- **Given** a customer has no phone number
- **When** a notification is attempted
- **Then** the system should log to console:
  - Error message: "WhatsApp notification skipped - missing phone number"
  - Order ID
  - User ID
  - Timestamp

**Console Log Format**:
```javascript
console.warn('[WhatsApp Notification] Skipped - missing phone number', {
  orderId: order._id,
  userId: order.owner,
  orderNumber: order.orderNumber,
  notificationType: 'order_placed',
  timestamp: new Date()
});
```

### AC4: Log Invalid Phone Number Errors
- **Given** a customer has invalid phone number format
- **When** WhatsApp API rejects the number
- **Then** the system should log to console:
  - Error message: "WhatsApp notification failed - invalid phone number"
  - Order ID
  - User ID
  - Phone number (masked for privacy: show only last 4 digits)
  - API error response
  - Timestamp

**Console Log Format**:
```javascript
console.error('[WhatsApp Notification] Failed - invalid phone number', {
  orderId: order._id,
  userId: order.owner,
  phoneNumber: '****' + phone.slice(-4),
  error: error.message,
  timestamp: new Date()
});
```

### AC5: Store Failed Notification Status
- **Given** a phone number is missing or invalid
- **When** the notification cannot be sent
- **Then** the system should:
  - Store notification status as 'failed' in orders collection
  - Store error type as 'missing_phone' or 'invalid_phone'
  - Store error message

### AC6: Skip Notification Gracefully
- **Given** a phone number issue is detected
- **When** the error is handled
- **Then** the system should:
  - Skip sending the notification
  - NOT throw an error
  - Continue order processing normally

### AC7: Phone Number Validation
- **Given** a phone number exists
- **When** validating before sending notification
- **Then** check:
  - Not empty/null/undefined
  - Contains only digits and allowed characters (+, -, spaces)
  - Minimum length (10 digits for Indian numbers)
  - Starts with country code or can be prefixed (e.g., +91)

---

## Technical Notes

### Pre-send Validation
```javascript
function validatePhoneNumber(user) {
  const phone = user?.profile?.whMobilePhone || user?.profile?.mobilePhone;
  
  if (!phone) {
    return { valid: false, reason: 'missing_phone' };
  }
  
  // Remove spaces, hyphens
  const cleanPhone = phone.replace(/[\s\-]/g, '');
  
  // Check if it's all digits (possibly with + prefix)
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { valid: false, reason: 'invalid_format' };
  }
  
  return { valid: true, phone: cleanPhone };
}
```

### Error Handling Flow
```javascript
async function sendOrderNotification(order) {
  const user = await Meteor.users.findOneAsync(order.owner);
  const validation = validatePhoneNumber(user);
  
  if (!validation.valid) {
    // Log and skip
    if (validation.reason === 'missing_phone') {
      console.warn('[WhatsApp Notification] Skipped - missing phone', {
        orderId: order._id,
        userId: user._id
      });
    } else {
      console.error('[WhatsApp Notification] Failed - invalid phone', {
        orderId: order._id,
        userId: user._id
      });
    }
    
    // Store failure
    await Orders.updateAsync(order._id, {
      $push: {
        whatsappNotifications: {
          status: 'failed',
          errorType: validation.reason,
          error: 'Phone number validation failed',
          attemptedAt: new Date()
        }
      }
    });
    
    return; // Skip notification, continue order processing
  }
  
  // Proceed with notification
  await sendWhatsAppMessage(validation.phone, order);
}
```

### Phone Number Masking for Logs
```javascript
function maskPhoneNumber(phone) {
  if (!phone || phone.length < 4) return '****';
  return '****' + phone.slice(-4);
}
```

---

## Definition of Done

- [ ] Missing phone numbers detected before API call
- [ ] Invalid phone number format validated
- [ ] Appropriate errors logged to console (warn for missing, error for invalid)
- [ ] Phone numbers masked in logs for privacy
- [ ] Failed status stored in database with error type
- [ ] Notifications skipped gracefully without throwing errors
- [ ] Order processing continues normally
- [ ] Tested with: no phone, invalid format, valid Indian numbers

---

## Dependencies

- US-001 completed
- User profile schema documentation

---

## Notes

- Indian phone numbers: 10 digits, country code +91
- Some users may have only email, not phone
- Future enhancement: admin alert for customers with missing phones
- Future enhancement: prompt users to add phone during signup
- Privacy: never log full phone numbers, always mask
