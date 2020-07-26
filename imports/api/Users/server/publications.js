import { Meteor } from 'meteor/meteor';
import UserSignUps from '../UserSignUps';
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

Meteor.publish('users.userWallet', function user() {
  try {
    retWalletAndSyncIfNecessary(this.userId);
  } catch (error) {
    console.log(error);
  }

  return Meteor.users.find(this.userId, {
    fields: {
      wallet: 1,
    },
  });
});

Meteor.publish('userSignUps.getUsers', () => UserSignUps.find({ status: { $exists: false } }));
