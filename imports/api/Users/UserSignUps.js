/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import 'meteor/aldeed:collection2/static';

const UserSignUps = new Mongo.Collection('UserSignUps');

UserSignUps.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

UserSignUps.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

UserSignUps.schema = new SimpleSchema({
  createdAt: {
    type: String,
    label: 'The date a new user signed up.',
    autoValue() {
      if (this.isInsert) return new Date().toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date a new user signed up.',
    autoValue() {
      if (this.isInsert || this.isUpdate || this.isUpsert)
        return new Date().toISOString();
    },
  },
  username: { type: String, label: 'User Name' },
  email: { type: String, label: 'Email Address' },
  profile: { type: Object },
  'profile.name': { type: Object },
  'profile.salutation': { type: String, label: 'Salutation', optional: true },
  'profile.name.first': { type: String, label: 'First Name' },
  'profile.name.last': { type: String, label: 'Last Name' },
  'profile.whMobilePhone': { type: String, label: 'Mobile Phone' },
  'profile.deliveryAddress': { type: String, label: 'Delivery Address' },
  'profile.deliveryPincode': { type: String, label: 'Delivery Pincode.' },
  'profile.eatingHealthyMeaning': {
    type: String,
    label: 'Eating Healthy Meaning',
    optional: true,
  },
  password: { type: String, label: 'Password' },
  status: {
    type: String,
    label: 'Status of the sign up request',
    optional: true,
  },
  /* settings: { type: Object },
  'settings.emailVerified': { type: Object },
  'settings.emailVerified.status': { type: Boolean, label: 'Email Verification'}, */
});

UserSignUps.attachSchema(UserSignUps.schema);

export default UserSignUps;
