/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import handleMethodException from '../../modules/handle-method-exception';

const updatePassword = (userId, newPassword) => {
  try {
    Accounts.setPassword(userId, newPassword, { logout: false });
  } catch (exception) {
    handleMethodException(exception);
  }
};

const updateUser = (userId, { emailAddress, profile, settings }) => {
  try {
    const user = Meteor.users.findOne({ _id: userId });
    const presentEmailAddress = user && user.emails && user.emails[0].address;

    Meteor.users.update(userId, {
      $set: {
        username: profile.whMobilePhone,
        'emails.0.address': emailAddress,
        'emails.0.verified': (presentEmailAddress && presentEmailAddress === emailAddress)
          ? user.emails[0].verified : false,
        updatedAt: new Date(),
        profile,
      },
    });

    if (settings) {
      Meteor.users.update(userId, {
        $set: {
          settings,
        },
      });
    }
  } catch (exception) {
    handleMethodException(exception);
  }
};

const editProfile = ({ userId, user }) => {
  try {
    updateUser(userId, user);
    if (user.password && Object.keys(user.password).length !== 0) {
      updatePassword(userId, user.password);
    }
  } catch (exception) {
    handleMethodException(exception);
  }
};

export default editProfile;
