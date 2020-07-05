/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

let action;

const updatePassword = (userId, newPassword) => {
  try {
    Accounts.setPassword(userId, newPassword, { logout: false });
  } catch (exception) {
    action.reject(`[editProfile.updatePassword] ${exception}`);
  }
};

const updateUser = (userId, { emailAddress, profile }) => {
  try {
    const user = Meteor.users.findOne({ _id: userId });
    const presentEmailAddress = user && user.emails && user.emails[0].address;

    Meteor.users.update(userId, {
      $set: {
        'emails.0.address': emailAddress,
        'emails.0.verified': (presentEmailAddress && presentEmailAddress === emailAddress) ?
          user.emails[0].verified : false,
        updatedAt: new Date(),
        profile,
      },
    });
  } catch (exception) {
    action.reject(`[editProfile.updateUser] ${exception}`);
  }
};

const editProfile = ({ userId, profile }, promise) => {
  try {
    action = promise;
    updateUser(userId, profile);
    if (profile.password) updatePassword(userId, profile.password);

    action.resolve();
  } catch (exception) {
    action.reject(`[editProfile.handler] ${exception}`);
  }
};

export default options =>
  new Promise((resolve, reject) =>
    editProfile(options, { resolve, reject }));
