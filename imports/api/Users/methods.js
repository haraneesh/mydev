// import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import SimpleSchema from 'simpl-schema';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import rateLimit from '../../modules/rate-limit';
import constants from '../../modules/constants';
import editProfile from './edit-profile';
import handleMethodException from '../../modules/handle-method-exception';
import UserSignUps from './UserSignUps';
// import ZohoInventory from '../../zohoSyncUps/ZohoInventory';

export const editUserProfile = new ValidatedMethod({
  name: 'users.editUserProfile',
  validate: new SimpleSchema({
    emailAddress: String,
    password: { type: Object, optional: true, blackbox: true },
    profile: Object,
    'profile.name': Object,
    'profile.name.first': String,
    'profile.name.last': String,
    'profile.whMobilePhone': String,
    'profile.deliveryAddress': String,
  }).validator(),
  run(profile) {
    return editProfile({ userId: this.userId, profile })
      .then(response => response)
      .catch((exception) => {
        handleMethodException(exception);
      });
  },
});

const createZohoContact = usr => ({
  contact_name: usr.username,
  billing_address: {
    street: usr.profile.deliveryAddress,
  },
  contact_persons: [{
    first_name: usr.profile.name.first,
    last_name: usr.profile.name.last,
    email: usr.email,
    mobile: usr.profile.whMobilePhone,
    is_primary_contact: true,
  }],
});

export const findUser = new ValidatedMethod({
  name: 'users.find',
  validate: new SimpleSchema({
    mobileNumber: { type: String },
  }).validator(),
  run(user) {
    if (
      Meteor.isServer &&
      Roles.userIsInRole(this.userId, constants.Roles.admin.name)
    ) {
      const u = Meteor.users.findOne({ username: user.mobileNumber });
      if (u) {
        u.isAdmin = Roles.userIsInRole(u._id, constants.Roles.admin.name);
      }
      return u;
    }
    new Meteor.Error(403, 'Access Denied');
  },
});

export const createUser = new ValidatedMethod({
  name: 'users.create',
  validate: new SimpleSchema({
    username: { type: String },
    email: { type: String },
    profile: { type: Object },
    'profile.name': { type: Object },
    'profile.name.last': { type: String },
    'profile.name.first': { type: String },
    'profile.whMobilePhone': { type: String },
    'profile.deliveryAddress': { type: String },
    isAdmin: { type: Boolean },
    password: { type: Object, blackbox: true },
  }).validator(),
  run(user) {
    if (Meteor.isServer && Roles.userIsInRole(this.userId, constants.Roles.admin.name))      {
      const cuser = {
        username: user.username,
        email: user.email,
        password: user.password,
        updatedAt: new Date(),
        profile: {
          name: {
            first: user.profile.name.first,
            last: user.profile.name.last,
          },
          whMobilePhone: user.profile.whMobilePhone,
          deliveryAddress: user.profile.deliveryAddress,
        },
        wallet: {
          unused_retainer_payments_InPaise: 0,
          unused_credits_receivable_amount_InPaise: 0,
          outstanding_receivable_amount_InPaise: 0,
          lastZohoSync: new Date('1/1/2000'),
        },
      };

      const userExists = Meteor.users.findOne({ username: cuser.username });

      if (!userExists) {
        const userId = Accounts.createUser(cuser);
        if (user.isAdmin) {
          Roles.addUsersToRoles(userId, [constants.Roles.admin.name]);
        }
        return Meteor.users.findOne({ username: cuser.username });
      }

      throw new Meteor.Error('500', 'A user with this username already exists.');
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
    'profile.name': { type: Object },
    'profile.name.last': { type: String },
    'profile.name.first': { type: String },
    'profile.whMobilePhone': { type: String },
    'profile.deliveryAddress': { type: String },
    isAdmin: { type: Boolean },
    password: { type: Object, optional: true, blackbox: true },
  }).validator(),
  run(usr) {
    const user = usr;
    if (
      Meteor.isServer &&
      Roles.userIsInRole(Meteor.userId(), constants.Roles.admin.name)
    ) {
      const cuser = Meteor.users.findOne({ _id: user._id });

      if (cuser) {
        if (user.email && user.email !== cuser.email) {
          const email = [];
          email.push({ address: user.email, verified: 'false' });
          delete user.email;
          user.emails = email;
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
        const u = Meteor.users.update({ _id: cuser._id }, { $set: user });

        if (u && user.isAdmin) {
          Roles.addUsersToRoles(cuser._id, [constants.Roles.admin.name]);
        } else if (u && !user.isAdmin) {
          Roles.removeUsersFromRoles(cuser._id, [constants.Roles.admin.name]);
        }
        return u;
      }
    }
  },
});

export const updateUser = new ValidatedMethod({
  name: 'users.update',
  validate: new SimpleSchema({
    username: { type: String, optional: true },
    email: { type: String, optional: true },
    'profile.name.last': { type: String, optional: true },
    'profile.name.first': { type: String, optional: true },
    'profile.whMobilePhone': { type: String, optional: true },
    'profile.deliveryAddress': { type: String, optional: true },
    // password: { type: String, optional:true }
  }).validator(),
  run(usr) {
    const user = usr;
    if (user.email) {
      const email = [];
      email.push({ address: user.email, verified: 'false' });
      delete user.email;
      user.emails = email;
    }
    if (Meteor.isServer) {
      /* }
      const authtoken = Meteor.settings.private.zoho_authtoken;
      const organizationId = Meteor.settings.private.zoho_organization_id;

      const zh = new ZohoInventory(authtoken, organizationId);
      zh.getRecords('contacts');
      zh.getRecords('items');
      zh.getRecords('bills');
      zh.getRecords('users'); */
      // console.log(zh.getContacts('contacts'));
    }
    return Meteor.users.update({ _id: Meteor.userId() }, { $set: user });
  },
});

Meteor.methods({
  'users.signUp': function userSelfSignUp(user) {
    check(user, {
      username: String,
      email: String,
      'profile.name.last': String,
      'profile.name.first': String,
      'profile.whMobilePhone': String,
      'profile.deliveryAddress': String,
    });
   return UserSignUps.insert(user);
  },
  'users.sendVerificationEmail': function usersSendVerificationEmail() {
    return Accounts.sendVerificationEmail(this.userId);
  },
});

rateLimit({
  methods: [
    'users.sendVerificationEmail',
    updateUser,
    adminUpdateUser,
    findUser,
    createUser,
    editUserProfile,
  ],
  limit: 5,
  timeRange: 1000,
});
