import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Notifications from './Notifications';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

// Import OneSignal Node SDK
let OneSignal;
if (Meteor.isServer) {
  OneSignal = require('onesignal-node');
}

// Initialize OneSignal client on server
let oneSignalClient;
if (Meteor.isServer) {
  const appId = Meteor.settings.private?.Signal?.oneSignalAppId;
  const apiKey = Meteor.settings.private?.Signal?.oneSignalRestApiKey;
  
  if (appId && apiKey) {
    oneSignalClient = new OneSignal.Client(appId, apiKey);
    console.log('OneSignal client initialized successfully');
  } else {
    console.warn('OneSignal credentials not found in settings. Push notifications will not work.');
  }
}

Meteor.methods({
  /**
   * Add or update a player ID for the current user
   * Called from client when OneSignal initializes
   */
  'addPlayerId': async function addPlayerId(params) {
    check(params, {
      playerId: String,
      deviceType: Match.Maybe(String),
    });

    const { playerId, deviceType } = params;

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add a player ID');
    }

    try {
      // Upsert the player ID for this user
      await Notifications.upsertAsync(
        { userId: this.userId, playerId },
        {
          $set: {
            userId: this.userId,
            playerId,
            deviceType: deviceType || 'unknown',
            lastActive: new Date(),
            updatedAt: new Date(),
          },
          $setOnInsert: {
            createdAt: new Date(),
          },
        }
      );

      console.log(`Player ID ${playerId} added/updated for user ${this.userId}`);
      return { success: true };
    } catch (exception) {
      handleMethodException(exception);
    }
  },

  /**
   * Send a push notification to a specific user
   * @param {Object} params - Notification parameters
   * @param {String} params.userId - Target user ID
   * @param {String} params.title - Notification title
   * @param {String} params.message - Notification message
   * @param {Object} params.data - Additional data (e.g., route for deep linking)
   */
  'sendNotification': async function sendNotification({ userId, title, message, data }) {
    check(userId, String);
    check(title, String);
    check(message, String);
    check(data, Match.Maybe(Object));

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    if (!Meteor.isServer) {
      return;
    }

    try {
      // Get all player IDs for this user
      const playerRecords = await Notifications.find({ userId }).fetchAsync();
      
      if (playerRecords.length === 0) {
        throw new Meteor.Error('no-devices', 'User has no registered devices');
      }

      const playerIds = playerRecords.map(record => record.playerId);

      // Create notification
      const notification = {
        headings: { en: title },
        contents: { en: message },
        include_player_ids: playerIds,
      };

      // Add additional data if provided (for deep linking)
      if (data) {
        notification.data = data;
      }

      // Send via OneSignal
      if (oneSignalClient) {
        const response = await oneSignalClient.createNotification(notification);
        console.log('Notification sent:', response.body);
        return { success: true, response: response.body };
      } else {
        throw new Meteor.Error('onesignal-not-configured', 'OneSignal is not properly configured');
      }
    } catch (exception) {
      handleMethodException(exception);
    }
  },

  /**
   * Send a notification to all users
   * Requires admin role
   * @param {Object} params - Notification parameters
   * @param {String} params.title - Notification title
   * @param {String} params.message - Notification message
   * @param {Object} params.data - Additional data (optional)
   */
  'sendNotificationToAll': async function sendNotificationToAll({ title, message, data }) {
    check(title, String);
    check(message, String);
    check(data, Match.Maybe(Object));

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    if (!Meteor.isServer) {
      return;
    }

    // Import Roles only on server
    const { Roles } = require('meteor/alanning:roles');
    const constants = require('../../modules/constants').default;

    // Check if user is admin
    const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
    if (!isAdmin) {
      throw new Meteor.Error('not-authorized', 'Only admins can send notifications to all users');
    }

    try {
      // Create notification for all subscribed users
      const notification = {
        headings: { en: title },
        contents: { en: message },
        included_segments: ['Subscribed Users'], // OneSignal default segment
      };

      // Add additional data if provided
      if (data) {
        notification.data = data;
      }

      // Send via OneSignal
      if (oneSignalClient) {
        const response = await oneSignalClient.createNotification(notification);
        console.log('Broadcast notification sent:', response.body);
        return { success: true, response: response.body };
      } else {
        throw new Meteor.Error('onesignal-not-configured', 'OneSignal is not properly configured');
      }
    } catch (exception) {
      handleMethodException(exception);
    }
  },

  /**
   * Get player IDs for the current user
   */
  'getMyPlayerIds': async function getMyPlayerIds() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      return await Notifications.find({ userId: this.userId }).fetchAsync();
    } catch (exception) {
      handleMethodException(exception);
    }
  },

  /**
   * Remove a player ID (when user logs out or uninstalls)
   */
  'removePlayerId': async function removePlayerId({ playerId }) {
    check(playerId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    try {
      await Notifications.removeAsync({ userId: this.userId, playerId });
      console.log(`Player ID ${playerId} removed for user ${this.userId}`);
      return { success: true };
    } catch (exception) {
      handleMethodException(exception);
    }
  },

  /**
   * Check if user has notifications enabled
   * Used to enforce notification requirement for critical operations (mobile only)
   * @throws {Meteor.Error} If user has no registered player IDs
   */
  'checkNotificationRequired': async function checkNotificationRequired() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    // This check should primarily be done on client side
    // Server-side check is a backup to ensure data integrity
    const playerIds = await Notifications.find({ userId: this.userId }).fetchAsync();
    
    if (playerIds.length === 0) {
      throw new Meteor.Error(
        'notifications-required',
        'Please enable push notifications to continue. You need notifications to receive order updates and delivery alerts.',
        { requiresNotifications: true }
      );
    }

    return { hasNotifications: true, playerIdCount: playerIds.length };
  },
});

// Rate limiting
rateLimit({
  methods: [
    'addPlayerId',
    'sendNotification',
    'sendNotificationToAll',
    'getMyPlayerIds',
    'removePlayerId',
    'checkNotificationRequired',
  ],
  limit: 5,
  timeRange: 1000,
});
