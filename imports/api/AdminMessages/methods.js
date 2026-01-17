import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import AdminMessages from './AdminMessages';
import Notifications from '../Notifications/Notifications';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

// Import the pre-initialized OneSignal client from Notifications module
let oneSignalClient;
if (Meteor.isServer) {
  // Import the already-initialized client to avoid duplicate initialization
  try {
    const notificationsModule = require('../Notifications/methods.js');
    oneSignalClient = notificationsModule.oneSignalClient;
    console.log('AdminMessages: OneSignal client imported from Notifications module');
  } catch (error) {
    console.error('AdminMessages: Failed to import OneSignal client:', error.message);
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

      // Construct logo URL from settings
      const baseImageUrl = Meteor.settings.public?.Product_Images;
      const imageVersion = Meteor.settings.public?.Product_Images_Version;
      const logoUrl = baseImageUrl && imageVersion ? `${baseImageUrl}logo-nm.png?${imageVersion}` : null;

      // Create test notification
      const notification = {
        headings: { en: title },
        contents: { en: message },
        include_player_ids: playerIds,
        priority: 10,  // High priority for both platforms
        android_accent_color: '5f1d1c',  // Suvai brand color
      };
      
      // Add small icon badge if logo URL is available
      if (logoUrl) {
        notification.large_icon = logoUrl;
      }

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
        console.error('AdminMessages: OneSignal client not initialized in sendTestMessageToAdmin');
        throw new Meteor.Error('onesignal-not-initialized', 'OneSignal client is not properly initialized. Check server logs and API credentials.');
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

      // Construct logo URL from settings
       const baseImageUrl = Meteor.settings.public?.Product_Images;
       const imageVersion = Meteor.settings.public?.Product_Images_Version;
       const logoUrl = baseImageUrl && imageVersion ? `${baseImageUrl}logo-nm.png?${imageVersion}` : null;

       // Create notification for all subscribed users via OneSignal segment
       // This sends to all devices that have OneSignal enabled in the app
       const notification = {
         headings: { en: title },
         contents: { en: message },
         included_segments: ['All'],  // OneSignal built-in segment for all subscribers
         priority: 10,  // High priority for both platforms
         android_accent_color: '5f1d1c',  // Suvai brand color
       };
       
       // Add small icon badge if logo URL is available
       if (logoUrl) {
         notification.large_icon = logoUrl;
       }
      
      console.log('Broadcasting to all OneSignal subscribers via segment');
      console.log('Notification payload:', notification);

      // Send via OneSignal
      if (oneSignalClient) {
        const response = await oneSignalClient.createNotification(notification);
        console.log('Broadcast notification sent:', response.body);

        if (!response.body.id) {
           console.error('OneSignal response missing ID:', response.body);
           console.error('OneSignal errors:', response.body.errors);
           
           const errorMsg = response.body.errors 
             ? (Array.isArray(response.body.errors) ? response.body.errors.join(', ') : JSON.stringify(response.body.errors))
             : 'Unknown error';
           throw new Meteor.Error('onesignal-error', `Failed to send notification via OneSignal: ${errorMsg}`);
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
        console.error('AdminMessages: OneSignal client not initialized in confirmAndSendToAll');
        throw new Meteor.Error('onesignal-not-initialized', 'OneSignal client is not properly initialized. Check server logs and API credentials.');
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
        console.error('AdminMessages: OneSignal client not initialized in refreshMessageDeliveryStatus');
        throw new Meteor.Error('onesignal-not-initialized', 'OneSignal client is not properly initialized. Check server logs and API credentials.');
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
