/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const UserEvents = new Mongo.Collection('UserEvents');
export default UserEvents;

if (Meteor.isServer) {
  UserEvents._ensureIndex([{ owner: 1 }, { eventType: 1 }]);
}

UserEvents.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

UserEvents.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

UserEvents.schema = new SimpleSchema({
  eventType: {
    type: String,
    label: 'The type of event that we are a logging.',
  },
  owner: {
    type: String,
    label: 'The user for whom the event was logged.',
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset();  // Prevent user from supplying their own value
    },
    optional: true,
  },
});

UserEvents.attachSchema(UserEvents.schema);
