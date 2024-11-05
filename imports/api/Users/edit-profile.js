/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import handleMethodException from '../../modules/handle-method-exception';

const updatePassword = async (userId, newPassword) => {
  try {
    await Accounts.setPasswordAsync(userId, newPassword, { logout: false });
  } catch (exception) {
    handleMethodException(exception);
  }
};

const updateUser = async (userId, { emailAddress, profile, settings }) => {
  try {
    const user = await Meteor.users.findOneAsync({ _id: userId });
    const newProfile = { ...user.profile, ...profile };
    const presentEmailAddress = user && user.emails && user.emails[0].address;

     let result = await Meteor.users.updateAsync({ _id: userId }, {
      $set: {
        username: profile.whMobilePhone,
        'emails.0.address': emailAddress,
        'emails.0.verified': (presentEmailAddress && presentEmailAddress === emailAddress)
          ? user.emails[0].verified : false,
        updatedAt: new Date(),
        newProfile,
      },
    });

    if (settings) {
      result = await Meteor.users.updateAsync({ _id: userId }, {
        $set: {
          settings,
        },
      });
    }

    return result;
  } catch (exception) {
    handleMethodException(exception);
  }
};

const editProfile = async ({ userId, user }) => {
  try {
   await updateUser(userId, user);
    if (user.password && Object.keys(user.password).length !== 0) {
     await updatePassword(userId, user.password);
    }
  } catch (exception) {
    handleMethodException(exception);
  }
};

export default editProfile;
