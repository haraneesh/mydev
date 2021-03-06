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

export const upsertProductList = new ValidatedMethod({
  name: 'productLists.upsert',
  applyOptions: {
    noRetry: true,
  },
  validate: new SimpleSchema({
    _id: { type: String, optional: true },
    activeStartDateTime: { type: Date },
    activeEndDateTime: { type: Date },
  }).validator(),
  run(params) {
    if (Meteor.isServer) {
      if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
        // user not authorized. do not publish secrets
        handleMethodException('Access denied', 401);
      }

      const startDate = params.activeStartDateTime;
      const endDate = params.activeEndDateTime;
      const productListsId = params._id;

      const orderableProducts = Products.find(
        { $or: [{ availableToOrder: true }, { availableToOrderWH: true }] },
        {
          sort: {
            type: 1, category: 1, /* displayOrder: 1, */ name: 1,
          },
        },
      ).fetch();

      const productList = {
        activeStartDateTime: params.activeStartDateTime,
        activeEndDateTime: params.activeEndDateTime,
      };

      if (!productListsId) {
        const overlappingProductList = ProductLists.findOne(
          {
            $and: [{ activeStartDateTime: { $lte: endDate } },
              { activeEndDateTime: { $gte: startDate } }],
          },
        );

        if (overlappingProductList) {
          handleMethodException(' Another Product List is active during this period. Product List was not created.', 417);
        }
        productList.products = updateWithTotQuantityOrdered(orderableProducts);
        return ProductLists.insert(productList);
      }

      const currentProductList = ProductLists.findOne({ _id: productListsId });
      const currentProductHashMap = currentProductList.products.reduce((map, obj) => {
        map[obj._id] = obj;
        return map;
      }, {});
      productList.products = updateWithTotQuantityOrdered(
        orderableProducts, currentProductHashMap,
      );

      const { products } = productList;
      productList.products = [];

      ProductLists.update({ _id: productListsId }, { $set: productList });

      products.forEach((prod) => {
        ProductLists.update({ _id: productListsId }, { $push: { products: prod } });
      });

      /* Meteor.defer(() => {
        console.log(`start ${new Date()}`);
        ProductLists.upsert({ _id: productListsId }, { $set: productList });
        console.log(`end ${new Date()}`);
      });

      Jobs.run('updateProductList', { productListsId, productList });
      */
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
    upsertProductList,
    'getProductList.view',
  ],
  limit: 5,
  timeRange: 1000,
});
