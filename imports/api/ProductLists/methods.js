import { Roles } from 'meteor/alanning:roles';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Match, check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import constants from '../../modules/constants';
import handleMethodException from '../../modules/handle-method-exception';
import rateLimit from '../../modules/rate-limit';
import Products from '../Products/Products';
import ProductLists from './ProductLists';

const updateWithTotQuantityOrdered = (products, currentProductHash) => {
  const newOrderableProducts = [];

  // get all the suppliers and create a hash

  products.forEach((product) => {
    const key = product._id;
    const prod = { ...product };
    prod.totQuantityOrdered =
      currentProductHash &&
      currentProductHash[key] &&
      currentProductHash[key].totQuantityOrdered
        ? currentProductHash[key].totQuantityOrdered
        : 0;

    newOrderableProducts.push(prod);
  });
  return newOrderableProducts;
};

export const removeProductList = new ValidatedMethod({
  name: 'productLists.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    if (await Roles.userIsInRoleAsync(this.userId, ['view-secrets', 'admin'])) {
      const productList = await ProductLists.findOneAsync({ _id });
      if (productList.order_ids && productList.order_ids.length > 0) {
        throw new Meteor.Error(
          403,
          'Product list cannot be deleted. There are orders associated with this product list.',
        );
      }
      await ProductLists.removeAsync(_id);
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
  async run(params) {
    if (Meteor.isServer) {
      if (
        !(await Roles.userIsInRoleAsync(
          this.userId,
          constants.Roles.admin.name,
        ))
      ) {
        // user not authorized. do not publish secrets
        handleMethodException('Access denied', 401);
      }

      const startDate = params.activeStartDateTime;
      const endDate = params.activeEndDateTime;
      const productListsId = params._id;

      const orderableProducts = await Products.find(
        { $or: [{ availableToOrder: true }, { availableToOrderWH: true }] },
        {
          sort: {
            type: 1,
            category: 1,
            /* displayOrder: 1, */ name: 1,
          },
        },
      ).fetchAsync();

      const productList = {
        activeStartDateTime: params.activeStartDateTime,
        activeEndDateTime: params.activeEndDateTime,
      };

      console.log('Product List Id ' + productListsId);

      if (!productListsId) {
        const overlappingProductList = await ProductLists.findOneAsync({
          $and: [
            { activeStartDateTime: { $lte: endDate } },
            { activeEndDateTime: { $gte: startDate } },
          ],
        });

        if (overlappingProductList) {
          handleMethodException(
            ' Another Product List is active during this period. Product List was not created.',
            417,
          );
        }
        productList.products = updateWithTotQuantityOrdered(orderableProducts);
        return await ProductLists.insertAsync(productList);
      }

      const currentProductList = await ProductLists.findOneAsync({
        _id: productListsId,
      });
      const currentProductHashMap = currentProductList.products.reduce(
        (map, obj) => {
          map[obj._id] = obj;
          return map;
        },
        {},
      );

      const products = updateWithTotQuantityOrdered(
        orderableProducts,
        currentProductHashMap,
      );

      /* productList.products = updateWithTotQuantityOrdered(
        orderableProducts, currentProductHashMap,
        ); */
      // const { products } = productList;
      productList.products = [];

      await ProductLists.updateAsync(
        { _id: productListsId },
        { $set: productList },
      );

      for (const prod of products) {
        await ProductLists.updateAsync(
          { _id: productListsId },
          { $push: { products: prod } },
        );
      }

      /* Meteor.defer(() => {
        console.log(`start ${new Date()}`);
        await ProductLists.upsertAsync({ _id: productListsId }, { $set: productList });
        console.log(`end ${new Date()}`);
      });

      Jobs.run('updateProductList', { productListsId, productList });
      */
    }
  },
});

Meteor.methods({
  'getProductList.view': async function getProductsList(productListId) {
    check(productListId, String);
    try {
      return await ProductLists.findOneAsync(
        { _id: productListId },
        { fields: { products: 1 } },
      );
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
  async run({ orderId, productListId }) {
      await ProductLists.updateAsync( { _id:productListId }, { $addToSet:{ order_ids:orderId } })
  },
}) */

rateLimit({
  methods: [removeProductList, upsertProductList, 'getProductList.view'],
  limit: 5,
  timeRange: 1000,
});
