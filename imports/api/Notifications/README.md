# OneSignal Push Notifications Integration

This directory contains the implementation for push notifications using OneSignal in the NammaSuvai mobile application.

## Overview

OneSignal is integrated to send push notifications to users on Android and iOS devices. The implementation includes:

- **Client-side**: Automatic player ID registration when the app starts
- **Server-side**: Methods to send notifications to specific users or broadcast to all users
- **Database**: MongoDB collection to track player IDs (device tokens) for each user

## Setup Instructions

### 1. Create OneSignal Account

1. Go to [onesignal.com](https://onesignal.com) and create a free account
2. Create a new app for each environment (development, staging, production)
3. Configure the app for Android:
   - Go to Settings → Platforms → Google Android (FCM)
   - Add your Firebase Server Key and Sender ID (if using FCM)
   - Or use OneSignal's default configuration

### 2. Get Your Credentials

For each OneSignal app, you'll need:

- **App ID**: Found in Settings → Keys & IDs
- **REST API Key**: Found in Settings → Keys & IDs

### 3. Configure Settings Files

Add the OneSignal credentials to your Meteor settings files (e.g., `settings-development.json`):

```json
{
  "public": {
    "native": {
      "oneSignalAppId": "your-onesignal-app-id",
      "oneSignalRestApiKey": "your-rest-api-key",
      "appleItunesAppId": "your-apple-app-id",
      "appleTeamId": "your-apple-team-id",
      "appleBundleId": "com.nammasuvai.development",
      "googlePlayAppId": "com.nammasuvai.development"
    },
    "oneSignalGcmSenderId": "your-gcm-sender-id"
  }
}
```

### 4. Update mobile-config.js

The `mobile-config.js` file already has OneSignal configuration. Update the `oneSignalAppId` for each environment:

```javascript
case 'com.nammasuvai.production':
  oneSignalAppId = 'your-production-app-id';
  break;
case 'com.nammasuvai.staging':
  oneSignalAppId = 'your-staging-app-id';
  break;
default:
  oneSignalAppId = 'your-development-app-id';
  break;
```

## How It Works

### Client-Side Flow

1. **App Startup**: When the app starts, `imports/infra/one-signal.js` initializes OneSignal
2. **Player ID Generation**: OneSignal generates a unique player ID for the device
3. **User Login**: When a user logs in, the player ID is sent to the server via `addPlayerId` method
4. **Notification Handling**: 
   - Notifications received while app is open are handled by `notificationReceivedCallback`
   - Notifications tapped by user are handled by `notificationOpenedCallback`
   - Deep linking is supported via `additionalData.route` parameter

### Server-Side Flow

1. **Player ID Storage**: The `addPlayerId` method stores the player ID in the `Notifications` collection
2. **Sending Notifications**: Use the `sendNotification` or `sendNotificationToAll` methods
3. **OneSignal API**: The server uses the `onesignal-node` package to communicate with OneSignal's REST API

## Usage Examples

### Send Notification to a Specific User

```javascript
// From server-side code or Meteor shell
Meteor.call('sendNotification', {
  userId: 'user-id-here',
  title: 'Order Confirmed',
  message: 'Your order #12345 has been confirmed',
  data: {
    route: '/orders/12345'  // Deep link to order details
  }
}, (error, result) => {
  if (error) {
    console.error('Error sending notification:', error);
  } else {
    console.log('Notification sent:', result);
  }
});
```

### Send Notification to All Users (Admin Only)

```javascript
// From server-side code (requires admin role)
Meteor.call('sendNotificationToAll', {
  title: 'New Products Available',
  message: 'Check out our fresh organic vegetables!',
  data: {
    route: '/products'
  }
}, (error, result) => {
  if (error) {
    console.error('Error sending notification:', error);
  } else {
    console.log('Broadcast notification sent:', result);
  }
});
```

### Get User's Player IDs

```javascript
// From client-side code
Meteor.call('getMyPlayerIds', (error, playerIds) => {
  if (error) {
    console.error('Error fetching player IDs:', error);
  } else {
    console.log('My devices:', playerIds);
  }
});
```

### Send Notification from Server Event

```javascript
// Example: Send notification when order status changes
import { Emitter, Events } from '../Events/events';

Emitter.on(Events.SHOPKEEPER_ORDER_UPDATED, async ({ userId, order }) => {
  if (order.status === 'delivered') {
    try {
      await Meteor.callAsync('sendNotification', {
        userId: order.customerId,
        title: 'Order Delivered',
        message: `Your order #${order.orderNumber} has been delivered!`,
        data: {
          route: `/orders/${order._id}`
        }
      });
    } catch (error) {
      console.error('Error sending delivery notification:', error);
    }
  }
});
```

## Deep Linking

Notifications can include deep links to specific screens in the app. When a user taps a notification, the app will navigate to the specified route.

**Example:**

```javascript
{
  title: 'New Message',
  message: 'You have a new message from support',
  data: {
    route: '/messages/123'  // Will navigate to this route when tapped
  }
}
```

The route should be a valid React Router path in your application.

## Testing

### 1. Test on Development Build

```bash
# Build and run on Android
MOBILE_APP_ID=com.nammasuvai.development meteor run android --settings settings-development.json
```

### 2. Verify Player ID Registration

1. Open the app on your device
2. Log in with a user account
3. Check the MongoDB `Notifications` collection:
   ```javascript
   db.notifications.find({ userId: "your-user-id" })
   ```
4. You should see a document with your player ID

### 3. Send Test Notification

**Option A: From Meteor Shell**

```bash
meteor shell
```

```javascript
Meteor.call('sendNotification', {
  userId: 'your-user-id',
  title: 'Test Notification',
  message: 'This is a test',
  data: { route: '/home' }
})
```

**Option B: From OneSignal Dashboard**

1. Log in to OneSignal dashboard
2. Go to Messages → New Push
3. Select your app
4. Compose your message
5. Select "Send to Test Device" and enter your player ID
6. Send the notification

### 4. Verify Notification Receipt

- **App in foreground**: Check console logs for "Notification received"
- **App in background**: Notification should appear in notification tray
- **App closed**: Notification should appear in notification tray
- **Tap notification**: App should open and navigate to the specified route

## Troubleshooting

### Player ID Not Being Registered

**Symptoms**: No player ID in database after login

**Solutions**:
1. Check that OneSignal App ID is correctly set in `mobile-config.js`
2. Check console logs for OneSignal initialization errors
3. Verify the Cordova plugin is installed: `meteor list-platforms`
4. Ensure user is logged in when player ID is generated

### Notifications Not Received

**Symptoms**: Notification sent but not received on device

**Solutions**:
1. Verify the player ID exists in the database
2. Check OneSignal dashboard for delivery status
3. Ensure the device has internet connection
4. Check that notifications are enabled in device settings
5. Verify OneSignal App ID and REST API Key are correct

### TypeScript Errors in IDE

**Symptoms**: TypeScript errors about `window.plugins` or `window.device`

**Solution**: These are expected in Cordova environments. The properties exist at runtime but TypeScript doesn't know about them. You can safely ignore these errors or add type declarations if needed.

### "OneSignal is not properly configured" Error

**Symptoms**: Error when trying to send notifications

**Solutions**:
1. Check that `oneSignalAppId` and `oneSignalRestApiKey` are in your settings file
2. Verify the credentials are correct in OneSignal dashboard
3. Restart the Meteor server after updating settings

## API Reference

### Methods

#### `addPlayerId({ playerId, deviceType })`

Stores a player ID for the current user.

- **Parameters**:
  - `playerId` (String): OneSignal player ID
  - `deviceType` (String, optional): Device platform ('android', 'ios', 'web')
- **Returns**: `{ success: true }`
- **Requires**: User must be logged in

#### `sendNotification({ userId, title, message, data })`

Sends a push notification to a specific user.

- **Parameters**:
  - `userId` (String): Target user ID
  - `title` (String): Notification title
  - `message` (String): Notification message
  - `data` (Object, optional): Additional data for deep linking
- **Returns**: `{ success: true, response: {...} }`
- **Requires**: User must be logged in

#### `sendNotificationToAll({ title, message, data })`

Broadcasts a notification to all users.

- **Parameters**:
  - `title` (String): Notification title
  - `message` (String): Notification message
  - `data` (Object, optional): Additional data for deep linking
- **Returns**: `{ success: true, response: {...} }`
- **Requires**: Admin role

#### `getMyPlayerIds()`

Gets all player IDs for the current user.

- **Returns**: Array of player ID documents
- **Requires**: User must be logged in

#### `removePlayerId({ playerId })`

Removes a player ID for the current user.

- **Parameters**:
  - `playerId` (String): Player ID to remove
- **Returns**: `{ success: true }`
- **Requires**: User must be logged in

### Publications

#### `notifications.myPlayerIds`

Publishes player IDs for the current user.

#### `notifications.allPlayerIds`

Publishes all player IDs (admin only).

## Database Schema

### Notifications Collection

```javascript
{
  _id: String,
  userId: String,           // Meteor user ID
  playerId: String,         // OneSignal player ID (unique per device)
  deviceType: String,       // 'android', 'ios', or 'web'
  lastActive: Date,         // Last time this device was active
  createdAt: Date,          // When player ID was first registered
  updatedAt: Date           // Last update timestamp
}
```

**Indexes**:
- `{ userId: 1, playerId: 1 }` (unique)
- `{ playerId: 1 }`

## Security

- Player IDs can only be added by authenticated users
- Only admins can send notifications to all users
- Users can only view their own player IDs
- Rate limiting is applied to all methods (5 requests per second)

## Additional Resources

- [OneSignal Documentation](https://documentation.onesignal.com/)
- [OneSignal Cordova Plugin](https://github.com/OneSignal/OneSignal-Cordova-SDK)
- [OneSignal Node.js SDK](https://github.com/OneSignal/onesignal-node)
