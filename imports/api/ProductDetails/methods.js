import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import ProductDetails from './ProductDetails';
import rateLimit from '../../modules/rate-limit.js';
import constants from '../../modules/constants';
import handleMethodException from '../../modules/handle-method-exception';
import Product from '../Products/Products';

Meteor.methods({
  'productDetails.getProductDetails': async function getProductDetails(productId) {
    check(productId, String);

    if (await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name)) {
      try {
        return await ProductDetails.findOneAsync({ productId },{
            fields:{ _id:0, productId: 1, title: 1, description: 1, imageUrl: 1}});
      } catch (exception) {
        handleMethodException(exception);
      }
    }
    return {};
  },
  'productDetails.upsertProductDetails': async function upsertProductDetails(productDetails) {
    check(productDetails, {
      title: Match.Maybe(String),
      productId: String,
      description: Match.Maybe(String),
      imageUrl: Match.Maybe(String),
    });

    const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
    if (!isAdmin) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    const product = await Product.findOneAsync({ _id: productDetails.productId });
    if (product.length < 1) {
      throw new Meteor.Error(403, 'Product does not exist');
    }
    try {
      await ProductDetails.upsertAsync({ productId: productDetails.productId }, { $set: productDetails });
      await Product.updateAsync({ _id: productDetails.productId }, { $set: { hasDetails: true } });
    } catch (exception) {
      handleMethodException(exception);
    }

    return {};
  },
  'productDetails.removeProductDetails': async function removeProductDetails(productId) {
    check(productId, String);

    const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);

    if (!isAdmin) {
      throw new Meteor.Error(403, 'Access Denied');
    }
    try {
      await ProductDetails.removeAsync({ productId });
      await Product.updateAsync({ _id: productId }, { $set: { hasDetails: false } });
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
