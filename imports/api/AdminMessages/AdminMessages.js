import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

// Create the AdminMessages collection to track admin broadcast messages
const AdminMessages = new Mongo.Collection('AdminMessages');

export default AdminMessages;

// Schema for admin messages
const AdminMessagesSchema = new SimpleSchema({
  title: {
    type: String,
    label: 'Message Title',
  },
  message: {
    type: String,
    label: 'Message Body',
  },
  sentBy: {
    type: String,
    label: 'Sent By User ID',
  },
  sentByName: {
    type: String,
    label: 'Sent By Name',
  },
  sentAt: {
    type: Date,
    label: 'Sent At',
  },
  oneSignalNotificationId: {
    type: String,
    label: 'OneSignal Notification ID',
    optional: true,
  },
  testSentAt: {
    type: Date,
    label: 'Test Sent At',
    optional: true,
  },
  broadcastSentAt: {
    type: Date,
    label: 'Broadcast Sent At',
    optional: true,
  },
  deliveryStatus: {
    type: Object,
    label: 'Delivery Status',
    optional: true,
    blackbox: true,
  },
  'deliveryStatus.totalRecipients': {
    type: Number,
    optional: true,
  },
  'deliveryStatus.successful': {
    type: Number,
    optional: true,
  },
  'deliveryStatus.failed': {
    type: Number,
    optional: true,
  },
  'deliveryStatus.converted': {
    type: Number,
    optional: true,
  },
  'deliveryStatus.remaining': {
    type: Number,
    optional: true,
  },
  'deliveryStatus.lastUpdated': {
    type: Date,
    optional: true,
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

AdminMessages.attachSchema(AdminMessagesSchema);

// Allow/Deny rules - all operations must go through methods
AdminMessages.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

AdminMessages.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

// Create indexes on server
if (Meteor.isServer) {
  AdminMessages.rawCollection().createIndex(
    { sentAt: -1 },
    { name: 'sentAt_-1' }
  );
  AdminMessages.rawCollection().createIndex(
    { sentBy: 1 },
    { name: 'sentBy_1' }
  );
}
