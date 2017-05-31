import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import rateLimit from '../../modules/rate-limit';
import constants from '../../modules/constants';

export const findUser = new ValidatedMethod({
  name: 'users.find',
  validate: new SimpleSchema({
    mobileNumber: { type: String },
  }).validator(),
  run(user) {
    if (
      Meteor.isServer &&
      Roles.userIsInRole(Meteor.userId(), constants.Roles.admin.name)
    ) {
      const u = Meteor.users.findOne({ username: user.mobileNumber });
      u.isAdmin = Roles.userIsInRole(u._id, constants.Roles.admin.name);
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
    'profile.name.last': { type: String },
    'profile.name.first': { type: String },
    'profile.whMobilePhone': { type: String },
    'profile.deliveryAddress': { type: String },
    isAdmin: { type: Boolean },
    password: { type: Object, blackbox: true },
  }).validator(),
  run(user) {
    if (
      Meteor.isServer &&
      Roles.userIsInRole(Meteor.userId(), constants.Roles.admin.name)
    ) {
      const cuser = {
        username: user.username,
        email: user.email,
        password: user.password,
        profile: {
          name: {
            first: user.profile.name.first,
            last: user.profile.name.last,
          },
          whMobilePhone: user.profile.whMobilePhone,
          deliveryAddress: user.profile.deliveryAddress,
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
    }
  },
});

export const adminUpdateUser = new ValidatedMethod({
  name: 'users.adminupdateuser',
  validate: new SimpleSchema({
    _id: { type: String },
    username: { type: String, optional: true },
    email: { type: String, optional: true },
    'profile.name.last': { type: String, optional: true },
    'profile.name.first': { type: String, optional: true },
    'profile.whMobilePhone': { type: String, optional: true },
    'profile.deliveryAddress': { type: String, optional: true },
    isAdmin: { type: Boolean },
    password: { type: Object, optional: true, blackbox: true },
  }).validator(),
  run(usr) {
    let user = usr;
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
    let user = usr;
    if (user.email) {
      let email = [];
      email.push({ address: user.email, verified: 'false' });
      delete user.email;
      user.emails = email;
    }
    return Meteor.users.update({ _id: Meteor.userId() }, { $set: user });
  },
});

rateLimit({
  methods: [updateUser, adminUpdateUser, findUser, createUser],
  limit: 5,
  timeRange: 1000,
});
