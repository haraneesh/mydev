// import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import SimpleSchema from 'simpl-schema';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import constants from '../../modules/constants';
import rateLimit from '../../modules/rate-limit';
import editProfile from './edit-profile';
import handleMethodException from '../../modules/handle-method-exception';
import UserSignUps from './UserSignUps';
import { syncNewSignUpUserWithZoho } from '../ZohoSyncUps/zohoContactsMethods';
import { Emitter, Events } from '../Events/events';
// import ZohoInventory from '../../zohoSyncUps/ZohoInventory';
const NonEmptyString = (x, name) => {
  check(x, String);
  if (x.length <= 0) {
    throw new Meteor.Error(404, `Please enter ${name} and other fields.`);
  }
  return true;
};

if (Meteor.isServer) {
  Accounts.validateLoginAttempt((options) => {
    const { user } = options;
    if (user && user.status
    && user.status.accountStatus
    && constants.UserAccountStatus.Disabled.name === user.status.accountStatus) {
      // return false;
      throw new Meteor.Error('403', 'Your account appears to have been disabled. Please contact admin.');
    }

    return true;
  });
}

export const editUserProfile = new ValidatedMethod({
  name: 'users.editUserProfile',
  validate: new SimpleSchema({
    emailAddress: String,
    password: { type: Object, optional: true, blackbox: true },
    profile: Object,
    'profile.salutation': String,
    'profile.name': Object,
    'profile.name.first': String,
    'profile.name.last': String,
    'profile.whMobilePhone': String,
    'profile.deliveryAddress': String,
    'profile.deliveryPincode': String,
    settings: Object,
    'settings.dietPreference': {
      type: String,
      optional: true,
      allowedValues: constants.DietaryPreferences.names,
    },
    'settings.packingPreference': {
      type: String,
      allowedValues: constants.PackingPreferences.names,
    },
    'settings.productUpdatePreference': {
      type: String,
      allowedValues: constants.ProductUpdatePreferences.names,
    },
  }).validator(),
  run(profile) {
    editProfile({ userId: this.userId, user: profile });
    Emitter.emit(Events.USER_PROFILE_UPDATED, { userId: this.userId, user: profile });
  },
});

export const findUser = new ValidatedMethod({
  name: 'users.find',
  validate: new SimpleSchema({
    mobileNumber: { type: String },
  }).validator(),
  run(user) {
    if (
      Meteor.isServer
      && Roles.userIsInRole(this.userId, constants.Roles.admin.name)
    ) {
      const u = Meteor.users.findOne({ username: user.mobileNumber });
      if (u) {
        u.isAdmin = Roles.userIsInRole(u._id, constants.Roles.admin.name);
        u.roles = Roles.getRolesForUser(u._id);
      }
      return u;
    }
    new Meteor.Error(403, 'Access Denied');
  },
});

const assignUserRole = (userId, selectedRole) => {
  switch (selectedRole) {
    case constants.Roles.admin.name:
      Roles.setUserRoles(userId, [constants.Roles.admin.name]);
      break;
    case constants.Roles.shopOwner.name:
      Roles.setUserRoles(userId, [constants.Roles.shopOwner.name]);
      break;
    case constants.Roles.supplier.name:
      Roles.setUserRoles(userId, [constants.Roles.supplier.name]);
      break;
    default:
      Roles.setUserRoles(userId, [constants.Roles.customer.name]);
      break;
  }
};

// used by supplier method to create supplier user
export const createNewUser = (user) => {
  const cuser = {
    username: user.username,
    email: user.email || '',
    password: user.password,
    profile: {
      name: {
        first: user.profile.name.first,
        last: user.profile.name.last,
      },
      salutation: user.profile.salutation,
      whMobilePhone: user.profile.whMobilePhone,
      deliveryAddress: user.profile.deliveryAddress,
      eatingHealthyMeaning: user.profile.eatingHealthyMeaning || '',
      deliveryPincode: user.profile.deliveryPincode,
      deliveryAddressLatitude: user.profile.deliveryAddressLatitude,
      deliveryAddressLongitude: user.profile.deliveryAddressLongitude,
    },
  };

  const wallet = {
    unused_retainer_payments_InPaise: 0,
    unused_credits_receivable_amount_InPaise: 0,
    outstanding_receivable_amount_InPaise: 0,
    lastZohoSync: new Date('1/1/2000'),
    isEligibleForDiscount: false,
  };

  const userExists = Meteor.users.findOne({ username: cuser.username });

  if (!userExists) {
    const userId = Accounts.createUser(cuser);
    /* if (user.isAdmin) {
      Roles.addUsersToRoles(userId, [constants.Roles.admin.name]);
    } */
    assignUserRole(userId, user.role);
    Meteor.users.update({ username: cuser.username }, {
      $set: {
        wallet,
        productReturnables: {},
        updatedAt: new Date(),
        'globalStatuses.lastVisitedMessageApp': new Date(),
        status: {
          accountStatus: constants.UserAccountStatus.Active.name,
          statusUpdate: new Date(),
        },
        settings: {
          productUpdatePreference: 'sendMeProductPhotosOnWhatsApp',
          packingPreference: 'noPreference',
        },
      },
    });

    // New User, register with Zoho.
    const userFromDB = Meteor.users.findOne({ username: cuser.username });
    syncNewSignUpUserWithZoho(userFromDB);
    return userFromDB;
  }

  throw new Meteor.Error('500', 'You are already registered with Suvai. Please Sign in to proceed further.');
};

export const createUser = new ValidatedMethod({
  name: 'users.create',
  validate: new SimpleSchema({
    username: { type: String },
    email: { type: String },
    profile: { type: Object },
    'profile.salutation': String,
    'profile.name': { type: Object },
    'profile.name.last': { type: String },
    'profile.name.first': { type: String },
    'profile.whMobilePhone': { type: String },
    'profile.deliveryAddress': { type: String },
    'profile.deliveryPincode': { type: String },
    'profile.deliveryAddressLatitude': { type: String },
    'profile.deliveryAddressLongitude': { type: String },
    password: { type: Object, blackbox: true },
    role: { type: String },
    status: { type: Object },
    'status.accountStatus': { type: String },
  }).validator(),
  run(user) {
    if (Meteor.isServer && Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      return createNewUser(user);
    }
  },
});

export const updateDeliveryPincode = new ValidatedMethod({
  name: 'user.updateDeliveryPincode',
  validate: new SimpleSchema({
    deliveryPincode: { type: String },
  }).validator(),
  run({ deliveryPincode }) {
    if (this.userId) {
      Meteor.users.upsert({ _id: this.userId }, {
        $set: {
          'profile.deliveryPincode': deliveryPincode,
        },
      });
    }
  },
});

export const adminUpdateUser = new ValidatedMethod({
  name: 'users.adminupdateuser',
  validate: new SimpleSchema({
    _id: { type: String },
    username: { type: String, optional: true },
    email: { type: String, optional: true },
    profile: { type: Object },
    'profile.salutation': String,
    'profile.name': { type: Object },
    'profile.name.last': { type: String },
    'profile.name.first': { type: String },
    'profile.whMobilePhone': { type: String },
    'profile.deliveryAddress': { type: String },
    'profile.deliveryPincode': { type: String },
    'profile.deliveryAddressLongitude': { type: String, optional: true },
    'profile.deliveryAddressLatitude': { type: String, optional: true },
    password: { type: Object, optional: true, blackbox: true },
    role: { type: String },
    status: { type: Object },
    'status.accountStatus': { type: String },
  }).validator(),
  run(options) {
    const user = { ...options };
    const userRole = options.role;
    delete user.role;

    if (
      Meteor.isServer
      && Roles.userIsInRole(Meteor.userId(), constants.Roles.admin.name)
    ) {
      const cuser = Meteor.users.findOne({ _id: user._id });

      if (cuser) {
        delete user.email;
        if (options.email && options.email !== cuser.emails[0].address) {
          const emails = [];
          emails.push({ address: options.email, verified: 'false' });
          user.emails = emails;
        }

        // Set password
        if (user.password) {
          Accounts.setPassword(cuser._id, user.password);
          delete user.password;
        }

        if (cuser.username === user.username) {
          delete user.username;
        }

        user.updatedAt = new Date();
        user.status.statusUpdate = new Date();
        const u = Meteor.users.update({ _id: cuser._id }, { $set: user });

        assignUserRole(cuser._id, userRole);
        /*
        if (u && user.isAdmin) {
          Roles.addUsersToRoles(cuser._id, [constants.Roles.admin.name]);
        } else if (u && !user.isAdmin) {
          Roles.removeUsersFromRoles(cuser._id, [constants.Roles.admin.name]);
        } */
        return u;
      }
    }
  },
});

const notifyUserSignUp = (content, subject, customerEmail) => {
  const toEmail = Meteor.settings.private.toOrderCommentsEmail.split(',');
  const fromEmail = Meteor.settings.private.fromInvitationEmail;
  if (Meteor.isDevelopment) {
    console.log(`To Email: ${toEmail} From Email: ${fromEmail} Subject: ${subject} Content: ${content}`);
  } else {
    // Send email to admin
    Email.send({
      to: toEmail,
      from: `Suvai User SignUp ${fromEmail}`,
      subject,
      html: content,
    });

    /*
    if (customerEmail) {
    // Send email to the person signing up
      Email.send({
        to: customerEmail,
        from: `Suvai User SignUp ${fromEmail}`,
        subject,
        html: 'Thank you for signing up with Suvai.',
      });
    }
    */
  }
};

Meteor.methods({
  'users.getTotalUserCount': function getTotalUserCount() {
    return Meteor.users.find({}).fetch().length;
  },
  'users.getAllUsers': function getAllUsers(options) {
    check(options, {
      limit: Number,
      skip: Number,
      sort: {
        username: Match.Maybe(Number),
        createdAt: Match.Maybe(Number),
        'profile.deliveryAddress': Match.Maybe(Number),
        'profile.name.first': Match.Maybe(Number),
        'profile.name.last': Match.Maybe(Number),
        'status.accountStatus': Match.Maybe(Number),
      },
    });

    if (Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      return Meteor.users.find({}, {
        fields: {
          createdAt: 1,
          username: 1,
          emails: 1,
          profile: 1,
          settings: 1,
          wallet: 1,
          productReturnables: 1,
          status: 1,
        },
        sort: options.sort,
        limit: options.limit,
        skip: options.skip,
      }).fetch();
    }
  },
  'users.signUp': function userSelfSignUp(user) {
    check(user, {
      username: String,
      email: String,
      profile: {
        name: {
          last: String,
          first: String,
        },
        whMobilePhone: String,
        deliveryAddress: String,
        eatingHealthyMeaning: Match.Maybe(String),
        deliveryPincode: String,
      },
      password: String,
    });

    NonEmptyString(user.profile.name.first, 'First name');
    NonEmptyString(user.profile.name.last, 'Last name');
    NonEmptyString(user.email, 'Email address');
    NonEmptyString(user.username, 'Mobile phone');
    NonEmptyString(user.profile.whMobilePhone, 'Mobile phone ');
    NonEmptyString(user.profile.deliveryAddress, 'Delivery address');
    NonEmptyString(user.profile.deliveryPincode, 'Delivery pincode');

    const usr = createNewUser(user);

    notifyUserSignUp(`${user.profile.name.first} ${user.profile.name.last}, 
    First Name: ${user.profile.name.first}
    Last Name:  ${user.profile.name.last}
    Phone number: ${user.profile.whMobilePhone} 
    deliveryAddress: ${user.profile.deliveryAddress}
    eatingHealthyMeaning: ${user.profile.eatingHealthyMeaning}
    deliveryPincode: ${user.profile.deliveryPincode}
    has signed up. This user has been auto approved in the app.`,
    'New user signup', user.email);

    return usr;
  },
  'users.createSelfSignUpsForSpecials': function createSelfSignUpsForSpecials(user) {
    check(user, {
      username: String,
      profile: {
        name: {
          last: String,
          first: String,
        },
        whMobilePhone: String,
        deliveryAddress: String,
        deliveryPincode: String,
        eatingHealthyMeaning: Match.Maybe(String),
      },
      password: String,
    });

    notifyUserSignUp(`${user.profile.name.first} ${user.profile.name.last}, 
    First Name: ${user.profile.name.first}
    Last Name:  ${user.profile.name.last}
    Phone number: ${user.profile.whMobilePhone} 
    deliveryAddress: ${user.profile.deliveryAddress}
    has ordered via specials page.`,
    'Orders Via Special');

    const u = Meteor.users.findOne({ username: user.username });
    if (u) {
      return u;
    }

    const newUser = { ...user };
    newUser.role = constants.Roles.customer.name;
    return createNewUser(newUser);
  },
  'users.accountStatusUpdate': function deactivateUser(args) {
    check(args, { userId: String, accountStatus: String });
    if (Meteor.isServer && Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      Meteor.users.update(
        { _id: args.userId },
        {
          $set: {
            status: {
              accountStatus: constants.UserAccountStatus[args.accountStatus].name,
              statusUpdate: new Date(),
            },
          },
        },
      );

      if (constants.UserAccountStatus.Disabled.name === args.accountStatus) {
        Meteor.users.update({ _id: args.userId }, { $set: { 'services.resume.loginTokens': [] } });
      }
    }
    return Meteor.users.findOne({ _id: args.userId });
  },
  'users.approveSignUp': function usersApproveSignUp(userSignUpId, status) {
    check(userSignUpId, String);
    check(status, String);

    if (Meteor.isServer && Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      const usr = UserSignUps.findOne({ _id: userSignUpId });
      if (status === 'Approve') {
        createNewUser(usr);
      }
      return UserSignUps.update({ _id: userSignUpId }, { $set: { status } });
    }
  },
  'users.sendVerificationEmail': function usersSendVerificationEmail(emailAddress) {
    check(emailAddress, String);
    const { userId } = this;
    Meteor.users.update({ _id: userId }, {
      $set: {
        'emails.0.address': emailAddress,
        'emails.0.verified': false,
      },
    });

    return Accounts.sendVerificationEmail(userId);
  },
  'users.visitedPlaceNewOrder': function lastVisitedPlaceNewOrder() {
    try {
      const { userId } = this;
      const updateDate = new Date();
      Meteor.users.update({ _id: userId }, {
        $set: {
          'globalStatuses.lastVisitedPlaceNewOrder': updateDate,
        },
      });
      Emitter.emit(Events.NAV_PLACEORDER_LANDING, { userId: this.userId });
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    'users.createSelfSignUpsForSpecials',
    'users.sendVerificationEmail',
    'users.visitedPlaceNewOrder',
    'users.getAllUsers',
    'users.approveSignUp',
    'users.getTotalUserCount',
    adminUpdateUser,
    updateDeliveryPincode,
    findUser,
    createUser,
    editUserProfile,
  ],
  limit: 5,
  timeRange: 1000,
});
