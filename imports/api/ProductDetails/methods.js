import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import ProductDetails from './ProductDetails';
import rateLimit from '../../modules/rate-limit.js';
import constants from '../../modules/constants';
import handleMethodException from '../../modules/handle-method-exception';
import Product from '../Products/Products';

Meteor.methods({
  'productDetails.getProductDetails': function getProductDetails(productId) {
    check(productId, String);

    if (Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      try {
        return ProductDetails.find({ productId }).fetch();
      } catch (exception) {
        handleMethodException(exception);
      }
    }
    return {};
  },
  'productDetails.upsertProductDetails': function upsertProductDetails(productDetails) {
    check(productDetails, {
      title: Match.Maybe(String),
      productId: String,
      description: Match.Maybe(String),
      imageUrl: Match.Maybe(String),
    });

    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    if (Product.findOne({ _id: productDetails.productId }, { fields: { _id: 1 } }).length < 1) {
      throw new Meteor.Error(403, 'Product does not exist');
    }
    try {
      ProductDetails.upsert({ productId: productDetails.productId }, { $set: productDetails });
      Product.update({ _id: productDetails.productId }, { $set: { hasDetails: true } });
    } catch (exception) {
      handleMethodException(exception);
    }

    return {};
  },
  'productDetails.removeProductDetails': function removeProductDetails(productId) {
    check(productId, String);
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    try {
      ProductDetails.remove({ productId });
      Product.update({ _id: productId }, { $set: { hasDetails: false } });
    } catch (exception) {
      handleMethodException(exception);
    }

    return {};
  },
});

rateLimit({
  methods: [
    'productDetails.getProductDetails',
    'productDetails.removeProductDetails',
    'productDetails.upsertProductDetails',
  ],
  limit: 5,
  timeRange: 1000,
});
