import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

// Create the Notifications collection to track player IDs and notification history
const Notifications = new Mongo.Collection('Notifications');

export default Notifications;

// Schema for player ID tracking
const PlayerIdSchema = new SimpleSchema({
  userId: {
    type: String,
    label: 'User ID',
  },
  playerId: {
    type: String,
    label: 'OneSignal Player ID',
  },
  deviceType: {
    type: String,
    label: 'Device Type',
    optional: true,
    allowedValues: ['android', 'ios', 'web'],
  },
  lastActive: {
    type: Date,
    label: 'Last Active',
    autoValue() {
      return new Date();
    },
  },
  createdAt: {
    type: Date,
    label: 'Created At',
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      return this.unset();
    },
  },
  updatedAt: {
    type: Date,
    label: 'Updated At',
    autoValue() {
      return new Date();
    },
  },
});

Notifications.attachSchema(PlayerIdSchema);

// Allow/Deny rules
Notifications.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Notifications.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

// Create indexes on server
if (Meteor.isServer) {
  Notifications.rawCollection().createIndex(
    { userId: 1, playerId: 1 },
    { unique: true, name: 'userId_1_playerId_1' }
  );
  Notifications.rawCollection().createIndex(
    { playerId: 1 },
    { name: 'playerId_1' }
  );
}
