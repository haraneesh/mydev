/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import UserSignUps from '../UserSignUps';
import constants from '../../../modules/constants';
import { rateLimitSubscriptions } from '../../../modules/rate-limit';
import { getPendingOrderDues } from '../../Orders/methods';

import { retWalletAndSyncIfNecessary } from '../../ZohoSyncUps/zohoContactsMethods';

Meteor.publish('users.editProfile', function usersProfile() {
  return Meteor.users.find(this.userId, {
    fields: {
      emails: 1,
      profile: 1,
      services: 1,
      settings: 1,
    },
  });
});

// Server
Meteor.publish('users.getRoles', function getRoles() {
  if (this.userId) {
    return Meteor.roleAssignment.find({ 'user._id': this.userId });
  }
  this.ready();
});

Meteor.publish('users.userData', function userData() {
  if (this.userId) {
    return Meteor.users.find({ _id: this.userId }, {
      fields: {
        emails: 1, profile: 1, settings: 1, wallet: 1, globalStatuses: 1, productReturnables: 1,
      },
    });
  }
  this.ready();
});

Meteor.publish('users.userWallet', function user() {
  try {
    retWalletAndSyncIfNecessary(this.userId);
  } catch (error) {
    console.log(error);
  }

  /* const pendingOrderSummary = getPendingOrderDues(this.userId);

  await Meteor.users.updateAsync({ _id: this.userId }, {
    $set: {
      pendingOrderSummary,
    },
  }); */

  return Meteor.users.find({ _id: this.userId }, {
    fields: {
      wallet: 1,
      pendingOrderSummary: 1,
    },
  });
});

Meteor.publish('userSignUps.getUsers', () => UserSignUps.find({ status: { $exists: false } }));

rateLimitSubscriptions({
  subscriptions: [
    'users.getRoles',
    'users.getUserDetails',
  ],
  limit: 5,
  timeRange: 1000,
});
