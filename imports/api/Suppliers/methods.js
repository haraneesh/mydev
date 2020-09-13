/* eslint-disable func-names */
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Suppliers from './Suppliers';
import { createNewUser } from '../Users/methods';
import editProfile from '../Users/edit-profile';
import rateLimit from '../../modules/rate-limit';
import { Emitter, Events } from '../Events/events';
import handleMethodException from '../../modules/handle-method-exception';
import constants from '../../modules/constants';
import Security from '../../modules/both/security';

Emitter.on(Events.USER_PROFILE_UPDATED, ({ userId }) => {
  const user = Meteor.users.findOne({ _id: userId });
  const usr = {
    username: user.username,
    email: user.emails[0].address,
    profile: { ...user.profile },
  };
  Suppliers.update(
    { userId },
    { $set: { user: usr } },
  );
});

Meteor.methods({
  'suppliers.insert': function (supp) {
    check(supp, {
      name: String,
      description: String,
      marginPercentage: Number,
      zohoAuthtoken: String,
      zohoOrganizationId: String,
      user: {
        username: String,
        email: String,
        profile: {
          salutation: String,
          name: { last: String, first: String },
          whMobilePhone: String,
          deliveryAddress: String,
        },
        password: Match.ObjectIncluding({}),
      },
    });

    try {
      Security.checkUserIsAdmin(this.userId);

      const { user } = supp;
      user.role = constants.Roles.supplier.name;

      const retUser = createNewUser(user);
      return Suppliers.insert({ owner: this.userId, ...supp, userId: retUser._id });
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'suppliers.update': function (supp) {
    check(supp, {
      _id: String,
      userId: String,
      name: String,
      description: String,
      marginPercentage: Number,
      zohoAuthtoken: String,
      zohoOrganizationId: String,
      user: {
        username: String,
        email: String,
        profile: {
          salutation: String,
          name: { last: String, first: String },
          whMobilePhone: String,
          deliveryAddress: String,
        },
        password: Match.ObjectIncluding({}),
      },
    });

    try {
      Security.checkUserIsAdmin(this.userId);

      const supplierId = supp._id;
      const { user, userId } = supp;
      editProfile({ userId, user: { ...user, emailAddress: user.email } });
      Suppliers.update(supplierId, { $set: supp });
      return supplierId; // Return _id so we can redirect to supplier after update.
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'suppliers.remove': function (suppumentId) {
    check(suppumentId, String);

    try {
      Security.checkUserIsAdmin(this.userId);
      return Suppliers.remove(suppumentId);
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'suppliers.list': function () {
    try {
      Security.checkUserIsAdmin(this.userId);
      if (Meteor.isServer) {
        return Suppliers.find(
          { owner: this.userId },
          { fields: { createdAt: 0, updatedAt: 0 } },
        ).fetch();
      }
      return [];
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    'suppliers.insert',
    'suppliers.update',
    'suppliers.remove',
    'suppliers.list',
  ],
  limit: 5,
  timeRange: 1000,
});
