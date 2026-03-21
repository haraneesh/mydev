import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import AdminMessages from './AdminMessages';
import Notifications from '../Notifications/Notifications';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

// Import OneSignal Node SDK
let OneSignal;
if (Meteor.isServer) {
  OneSignal = require('onesignal-node');
}

// Initialize OneSignal client on server (same pattern as Notifications/methods.js)
let oneSignalClient;
if (Meteor.isServer) {
  const appId = Meteor.settings.private?.Signal?.oneSignalAppId;
  const apiKey = Meteor.settings.private?.Signal?.oneSignalRestApiKey;
  
  console.log('AdminMessages: Initializing OneSignal client...');
  console.log('AdminMessages: App ID:', appId ? 'Found' : 'NOT FOUND');
  console.log('AdminMessages: API Key:', apiKey ? 'Found' : 'NOT FOUND');
  
  if (appId && apiKey) {
    oneSignalClient = new OneSignal.Client(appId, apiKey);
    console.log('AdminMessages: OneSignal client initialized successfully');
  } else {
    console.error('AdminMessages: OneSignal credentials not found in Meteor.settings.private.Signal');
  }
}

Meteor.methods({
  /**
   * Send a test notification to the admin user
   * @param {Object} params - Message parameters
   * @param {String} params.title - Notification title
   * @param {String} params.message - Notification message
   */
  'sendTestMessageToAdmin': async function sendTestMessageToAdmin(params) {
    check(params, {
      title: String,
      message: String,
    });

    const { title, message } = params;

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
      throw new Meteor.Error('not-authorized', 'Only admins can send messages');
    }

    try {
      // Get admin's player IDs
      const playerRecords = await Notifications.find({ userId: this.userId }).fetchAsync();
      
      if (playerRecords.length === 0) {
        // Instead of throwing error, return status so UI can prompt for broadcast
        return { 
          sent: false, 
          reason: 'no-devices',
          message: 'You have no registered admin devices.' 
        };
      }

      const playerIds = playerRecords.map(record => record.playerId);

      // Create test notification
      const notification = {
        headings: { en: title },
        contents: { en: message },
        include_player_ids: playerIds,
      };

      // Send via OneSignal
      if (oneSignalClient) {
        const response = await oneSignalClient.createNotification(notification);
        console.log('Test notification sent to admin:', response.body);
        
        return { 
          sent: true, 
          recipients: response.body.recipients,
          message: 'Test notification sent to your device(s).'
        };
      } else {
        console.warn('OneSignal client not initialized');
        return { sent: false, reason: 'client-not-ready' };
      }
    } catch (exception) {
      handleMethodException(exception);
      return { sent: false, reason: 'error', error: exception.message };
    }
  },

  /**
   * Confirm and send message to all users
   * @param {Object} params - Message parameters
   * @param {String} params.title - Notification title
   * @param {String} params.message - Notification message
   */
  'confirmAndSendToAll': async function confirmAndSendToAll(params) {
    check(params, {
      title: String,
      message: String,
    });

    const { title, message } = params;

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
      throw new Meteor.Error('not-authorized', 'Only admins can send messages to all users');
    }

    try {
      // Get admin user info
      const adminUser = await Meteor.users.findOneAsync({ _id: this.userId });
      const adminName = adminUser?.profile?.name || adminUser?.emails?.[0]?.address || adminUser?.username || 'Admin';
      
      console.log('Admin user:', adminUser);
      console.log('Admin name resolved to:', adminName);

      // Get all subscribed player IDs from our database
      const Notifications = require('../Notifications/Notifications').default;
      const allSubscriptions = await Notifications.find({}, { fields: { playerId: 1 } }).fetchAsync();
      
      if (allSubscriptions.length === 0) {
        throw new Meteor.Error('no-subscribers', 'No users have subscribed to notifications yet.');
      }

      const playerIds = allSubscriptions.map(sub => sub.playerId);
      console.log(`Broadcasting to ${playerIds.length} devices`);
      console.log('Player IDs:', playerIds);

      // Create notification for all subscribed users
      const notification = {
        headings: { en: title },
        contents: { en: message },
        include_player_ids: playerIds,
      };

      // Send via OneSignal
      if (oneSignalClient) {
        const response = await oneSignalClient.createNotification(notification);
        console.log('Broadcast notification sent:', response.body);

        if (!response.body.id) {
          console.error('OneSignal response missing ID:', response.body);
          console.error('OneSignal errors:', response.body.errors);
          
          // Check if the error is due to invalid player IDs
          if (response.body.errors && response.body.errors.invalid_player_ids) {
            const invalidIds = response.body.errors.invalid_player_ids;
            console.log('Invalid player IDs detected:', invalidIds);
            
            // Filter out invalid player IDs and retry
            const validPlayerIds = playerIds.filter(id => !invalidIds.includes(id));
            
            if (validPlayerIds.length === 0) {
              throw new Meteor.Error('no-valid-subscribers', 'All player IDs are invalid. Please check the Notification Subscribers page and ensure devices are properly registered.');
            }
            
            console.log(`Retrying broadcast with ${validPlayerIds.length} valid player IDs (removed ${invalidIds.length} invalid)`);
            
            // Retry with valid player IDs only
            const retryNotification = {
              headings: { en: title },
              contents: { en: message },
              include_player_ids: validPlayerIds,
            };
            
            const retryResponse = await oneSignalClient.createNotification(retryNotification);
            console.log('Retry broadcast notification sent:', retryResponse.body);
            
            if (!retryResponse.body.id) {
              const errorMsg = retryResponse.body.errors 
                ? (Array.isArray(retryResponse.body.errors) ? retryResponse.body.errors.join(', ') : JSON.stringify(retryResponse.body.errors))
                : 'Unknown error';
              throw new Meteor.Error('onesignal-error', `Failed to get notification ID from OneSignal after retry: ${errorMsg}`);
            }
            
            // Use the retry response for the rest of the flow
            response.body = retryResponse.body;
          } else {
            const errorMsg = response.body.errors 
              ? (Array.isArray(response.body.errors) ? response.body.errors.join(', ') : JSON.stringify(response.body.errors))
              : 'Unknown error';
            throw new Meteor.Error('onesignal-error', `Failed to get notification ID from OneSignal: ${errorMsg}`);
          }
        }

        // Store message in database
        const messageId = await AdminMessages.insertAsync({
          title,
          message,
          sentBy: this.userId,
          sentByName: String(adminName), // Ensure it's a string
          sentAt: new Date(),
          broadcastSentAt: new Date(),
          oneSignalNotificationId: response.body.id,
          deliveryStatus: {
            totalRecipients: response.body.recipients || 0,
            successful: 0,
            failed: 0,
            converted: 0,
            remaining: response.body.recipients || 0,
            lastUpdated: new Date(),
          },
        });

        return { 
          success: true, 
          messageId,
          notificationId: response.body.id,
          recipients: response.body.recipients 
        };
      } else {
        throw new Meteor.Error('onesignal-not-configured', 'OneSignal is not properly configured');
      }
    } catch (exception) {
      handleMethodException(exception);
    }
  },

  /**
   * Refresh delivery status for a specific message from OneSignal
   * @param {String} messageId - The message ID to refresh
   */
  'refreshMessageDeliveryStatus': async function refreshMessageDeliveryStatus(messageId) {
    check(messageId, String);

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
      throw new Meteor.Error('not-authorized', 'Only admins can refresh delivery status');
    }

    try {
      // Get the message
      const adminMessage = await AdminMessages.findOneAsync({ _id: messageId });
      
      if (!adminMessage) {
        throw new Meteor.Error('not-found', 'Message not found');
      }

      if (!adminMessage.oneSignalNotificationId) {
        return {
          success: false,
          error: 'no-notification-id',
          reason: 'No OneSignal notification ID found for this message'
        };
      }

      // Fetch notification details from OneSignal
      if (oneSignalClient) {
        const notificationDetails = await oneSignalClient.viewNotification(adminMessage.oneSignalNotificationId);
        
        // Update delivery status in database
        await AdminMessages.updateAsync(
          { _id: messageId },
          {
            $set: {
              deliveryStatus: {
                totalRecipients: notificationDetails.body.recipients || 0,
                successful: notificationDetails.body.successful || 0,
                failed: notificationDetails.body.failed || 0,
                converted: notificationDetails.body.converted || 0,
                remaining: notificationDetails.body.remaining || 0,
                lastUpdated: new Date(),
              },
              updatedAt: new Date(),
            },
          }
        );

        return {
          success: true,
          deliveryStatus: {
            totalRecipients: notificationDetails.body.recipients || 0,
            successful: notificationDetails.body.successful || 0,
            failed: notificationDetails.body.failed || 0,
            converted: notificationDetails.body.converted || 0,
            remaining: notificationDetails.body.remaining || 0,
          },
        };
      } else {
        throw new Meteor.Error('onesignal-not-configured', 'OneSignal is not properly configured');
      }
    } catch (exception) {
      handleMethodException(exception);
    }
  },

  /**
   * Delete a message
   * @param {String} messageId - The message ID to delete
   */
  'deleteMessage': async function deleteMessage(messageId) {
    check(messageId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in');
    }

    // Import Roles only on server
    const { Roles } = require('meteor/alanning:roles');
    const constants = require('../../modules/constants').default;

    // Check if user is admin
    const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
    if (!isAdmin) {
      throw new Meteor.Error('not-authorized', 'Only admins can delete messages');
    }

    try {
      await AdminMessages.removeAsync({ _id: messageId });
      return { success: true };
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

// Rate limiting
rateLimit({
  methods: [
    'sendTestMessageToAdmin',
    'confirmAndSendToAll',
    'refreshMessageDeliveryStatus',
  ],
  limit: 5,
  timeRange: 1000,
});
