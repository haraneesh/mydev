import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import Baskets from './Baskets';
import constants from '../../modules/constants';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

export async function basketsGetOne(basketId) {
    check(basketId, String);

    if (Meteor.isServer) {
      try {
        return await Baskets.findOneAsync({ $and: [{ _id: basketId }, { $or: [{ owner: this.userId }, { isOwnerAdmin: true }] }] });
      } catch (exception) {
        handleMethodException(exception);
      }
    } else {
      throw new Meteor.Error(403, 'Access Denied');
    }
  }

export async function basketsGetAll() {
    if (Meteor.isServer) {
      try {
        return await Baskets.find({ $or: [{ owner: this.userId }, { isOwnerAdmin: true }] }, { sort: { name: 1 } }).fetchAsync();
      } catch (exception) {
        handleMethodException(exception);
      }
    } else {
      throw new Meteor.Error(403, 'Access Denied');
    }
  }

export async function basketsInsert(basket) {
    check(basket, {
      name: String,
      description: Match.Maybe(String),
      products: [{
        _id: String,
        quantity: Number,
      }],
    });

    if (Meteor.isServer) {
      try {
        return await Baskets.insertAsync({ owner: this.userId, isOwnerAdmin: await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name), ...basket });
      } catch (exception) {
        handleMethodException(exception);
      }
    }
  }

  export async function basketsUpdate(basket) {
    check(basket, {
      _id: String,
      name: String,
      description: Match.Maybe(String),
      products: [{
        _id: String,
        quantity: Number,
      }],
    });

    try {
      const savedBasket = await Baskets.findOneAsync({ _id: basket._id });

      const isInRole =  await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
      if (Meteor.isServer && !isInRole) {
        try {
          if (savedBasket.owner !== this.userId) {
            throw new Meteor.Error('111', 'Basket was created by a different user');
          }
        } catch (exception) {
          handleMethodException(exception);
        }
      }

      return await Baskets.updateAsync({ _id: basket._id }, { $set: basket });
    } catch (exception) {
      handleMethodException(exception);
    }
  }

  export async function basketsRemove(basketId) {
    check(basketId, String);

    try {
      return await Baskets.removeAsync(basketId);
    } catch (exception) {
      handleMethodException(exception);
    }
  }

Meteor.methods({
  'baskets.getOne': basketsGetOne,
  'baskets.getAll': basketsGetAll,
  'baskets.insert': basketsInsert,
  'baskets.update': basketsUpdate,
  'baskets.remove': basketsRemove,
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
