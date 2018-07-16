import { Meteor } from 'meteor/meteor';
import { retWalletAndSyncIfNecessary } from '../../ZohoSyncUps/zohoContactsMethods';

Meteor.publish('users.editProfile', function usersProfile() {
  return Meteor.users.find(this.userId, {
    fields: {
      emails: 1,
      profile: 1,
      services: 1,
    },
  });
});

Meteor.publish('users.userWallet', function user() {
  retWalletAndSyncIfNecessary(this.userId);

  return Meteor.users.find(this.userId, {
    fields: {
      wallet: 1,
    },
  });
});
