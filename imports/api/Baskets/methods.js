import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Baskets from './Baskets';
import { Roles } from 'meteor/alanning:roles';
import constants from '../../modules/constants';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

Meteor.methods({
  'baskets.getOne': function basketsGetOne(basketId) {
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
  'baskets.getAll': function basketsGetAll() {

    if (Meteor.isServer) {
      try {
        return Baskets.find({ $or: [{ owner: this.userId }, { isOwnerAdmin: true }] }, { sort: { name: 1 } }).fetch()
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
      description: Match.Maybe(String),
      products: [{
        _id: String,
        quantity: Number,
      }]
    });

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
      name: String,
      description: Match.Maybe(String),
      products: [{
        _id: String,
        quantity: Number,
      }]
    });

    try {
      const savedBasket = Baskets.findOne({ _id: basket._id });

      if (Meteor.isServer && !Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
        try {

          if (savedBasket.owner !== this.userId) {
            throw new Meteor.Error('111', 'Basket was created by a different user');
          }
        } catch (exception) {
          handleMethodException(exception);
        }
      }

      return Baskets.update({ _id: basket._id }, { $set: basket });
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
    'baskets.getOne',
    'baskets.getAll',
  ],
  limit: 5,
  timeRange: 1000,
});
