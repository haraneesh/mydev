import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Baskets from './Baskets';
import { Roles } from 'meteor/alanning:roles';
import constants from '../../modules/constants';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

Meteor.methods({
  'baskets.get': function basketsGet(basketId) {
    check(basketId, String);

    if (Meteor.isServer) {
      try {
        return Baskets.findOne({ _id: basketId, owner: this.userId });
      } catch (exception) {
        handleMethodException(exception);
      }
    } else {
      new Meteor.Error(403, 'Access Denied');
    }
  },
  'baskets.insert': function basketsInsert(basket) {
    check(basket, {
      name: String,
      products: [{
        _id: String,
        quantity: String,
      }] });

    if (Meteor.isServer) {
      try {
        return Baskets.insert({ owner: this.userId, isOwnerAdmin: Roles.userIsInRole(this.userId, constants.Roles.admin.name), ...basket });
      } catch (exception) {
        handleMethodException(exception);
      }
    }
  },
  'baskets.update': function basketsUpdate(basket) {
    check(basket, {
      _id: String,
      title: String,
      body: String,
    });

    try {
      const basketumentId = basket._id;
      Baskets.update(basketumentId, { $set: basket });
      return basketumentId; // Return _id so we can redirect to basketument after update.
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'baskets.remove': function basketsRemove(basketId) {
    check(basketId, String);

    try {
      return Baskets.remove(basketId);
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    'baskets.insert',
    'baskets.update',
    'baskets.remove',
    'baskets.get',
  ],
  limit: 5,
  timeRange: 1000,
});
