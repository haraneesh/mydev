/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import 'meteor/aldeed:collection2/static';

const Settings = new Mongo.Collection('Settings');

Settings.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Settings.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Settings.schema = new SimpleSchema({
  _id: { type: String, label: 'The default _id of a row', optional: true },
  key: {
    type: String,
    label: 'Key Name',
  },
  value: {
    type: Object,
    label: 'Key Value',
    blackbox: true,
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      }
      if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset(); // Prevent user from supplying their own value
    },
    optional: true,
  },
  // Force value to be current date (on server) upon update
  // and don't allow it to be set upon insert.
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isInsert || this.isUpdate || this.isUpsert) {
        return new Date();
      }
    },
    optional: true,
  },
});
if (Meteor.isServer) {
  Settings.rawCollection().createIndex({ key: 1 });
}

Settings.attachSchema(Settings.schema);

export default Settings;
