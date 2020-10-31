import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import SimpleSchema from 'simpl-schema';
import { Roles } from 'meteor/alanning:roles';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import ProductLists from './ProductLists';
import Suppliers from '../Suppliers/Suppliers';
import Products from '../Products/Products';
import rateLimit from '../../modules/rate-limit';
import constants from '../../modules/constants';
import handleMethodException from '../../modules/handle-method-exception';

const updateWithTotQuantityOrdered = (products, currentProductHash) => {
  const newOrderableProducts = [];

  // get all the suppliers and create a hash

  products.forEach((product) => {
    const key = product._id;
    const prod = { ...product };
    prod.totQuantityOrdered = (
      currentProductHash
      && currentProductHash[key]
      && currentProductHash[key].totQuantityOrdered
    ) ? currentProductHash[key].totQuantityOrdered : 0;

    const newSupplierArray = [];

    if (product.sourceSuppliers) {
      product.sourceSuppliers.map((supplier) => {
        const currSupplier = Suppliers.findOne({ _id: supplier._id });
        if (currSupplier) {
          newSupplierArray.push(currSupplier);
        }
      });
      prod.sourceSuppliers = newSupplierArray;
    }

    newOrderableProducts.push(prod);
  });
  return newOrderableProducts;
};

export const removeProductList = new ValidatedMethod({
  name: 'productLists.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    if (Roles.userIsInRole(this.userId, ['view-secrets', 'admin'])) {
      const productList = ProductLists.findOne({ _id });
      if (productList.order_ids && productList.order_ids.length > 0) {
        throw new Meteor.Error(403, 'Product list cannot be deleted. There are orders associated with this product list.');
      }
      ProductLists.remove(_id);
    } else {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(401, 'Access denied');
    }
  },
});

Meteor.methods({
  'getProductList.view': function getProductsList(productListId) {
    check(productListId, String);
    try {
      return ProductLists.findOne({ _id: productListId }, { fields: { products: 1 } });
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'productLists.upsert': function updateProductList(params) {
    check(params, {
      _id: Match.Maybe(String),
      activeStartDateTime: Date,
      activeEndDateTime: Date,
    });

    if (Meteor.isServer) {
      if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
        handleMethodException('Access denied', 401);
      }

      console.log('------------');
      console.log(`1 ${new Date()}`);

      const startDate = params.activeStartDateTime;
      const endDate = params.activeEndDateTime;
      const productListsId = params._id;
      let orderableProducts = Products.find({ $or: [{ availableToOrder: true }, { availableToOrderWH: true }] }, { sort: { type: 1, /* category: 1, displayOrder: 1, */ name: 1 } }).fetch();
      if (!productListsId) {
        const overlappingProductList = ProductLists.findOne(
          { $and: [{ activeStartDateTime: { $lte: endDate } }, { activeEndDateTime: { $gte: startDate } }] },
        );
        if (overlappingProductList) {
          handleMethodException(' Another Product List is active during this period. Product List was not created.', 417);
        }
        orderableProducts = updateWithTotQuantityOrdered(orderableProducts);
      } else {
        console.log(`ID ${productListsId}`);
        const currentProductList = ProductLists.findOne({ _id: productListsId });
        const currentProductHashMap = currentProductList.products.reduce((map, obj) => {
          map[obj._id] = obj;
          return map;
        }, {});
        console.log(`2 ${new Date()}`);
        orderableProducts = updateWithTotQuantityOrdered(orderableProducts, currentProductHashMap);
        console.log(`3 ${new Date()}`);
      }

      const productList = {
        activeStartDateTime: params.activeStartDateTime,
        activeEndDateTime: params.activeEndDateTime,
        products: orderableProducts,
      };

      // ProductLists.upsert({ _id: productListsId }, { $set: productList });
      console.log(`Product List ${JSON.stringify(productList)}`);
      ProductLists.insert(productList);
      console.log(`4 ${new Date()}`);
    }
  },
});

/*
export const updateProductListWithOrderId = new ValidatedMethod({
  name: 'productLists.updateProductListWithOrderId',
  validate: new SimpleSchema({
    orderId: { type: String },
    productListId: { type: String },
  }).validator(),
  run({ orderId, productListId }) {
      ProductLists.update( { _id:productListId }, { $addToSet:{ order_ids:orderId } })
  },
}) */

rateLimit({
  methods: [
    removeProductList,
    'getProductList.view',
    'productLists.upsert',
  ],
  limit: 5,
  timeRange: 1000,
});
