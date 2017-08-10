import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import ProductLists from './ProductLists';
import Products from '../../api/Products/Products';
import rateLimit from '../../modules/rate-limit';
import constants from '../../modules/constants';


export const upsertProductList = new ValidatedMethod({
  name: 'productLists.upsert',
  validate: new SimpleSchema({
    _id: { type: String, optional: true },
    activeStartDateTime: { type: Date },
    activeEndDateTime: { type: Date },
  }).validator(),
  run(params) {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(401, 'Access denied');
    }

    const startDate = params.activeStartDateTime;
    const endDate = params.activeEndDateTime;
    const productListsId = params._id;

    /* $or: [
                { $and:  [ {activeStartDateTime:{ $gte: startDate}} , { activeStartDateTime:{ $lte: endDate }} ] },
                { $and:  [ {activeEndDateTime:{ $gte: startDate}} , {activeEndDateTime:{ $lte: endDate }} ] },
                { $and:  [ {activeStartDateTime:{ $lte: startDate}} , {activeEndDateTime:{ $gte: endDate }} ] }
                ]
    */
    if (!productListsId) {
      const overlappingProductList = ProductLists.findOne(
          { $and: [{ activeStartDateTime: { $lte: endDate } }, { activeEndDateTime: { $gte: startDate } }] },
        );
      if (overlappingProductList) {
        throw new Meteor.Error(417, ' Another Product List is active during this period. Product List was not created.');
      }
    }

    const OrderableProducts = Products.find({ availableToOrder: true }).fetch();

    const productList = {
      activeStartDateTime: params.activeStartDateTime,
      activeEndDateTime: params.activeEndDateTime,
      products: OrderableProducts,
    };

    return ProductLists.upsert({ _id: productListsId }, { $set: productList });
  },
});

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
})*/


rateLimit({
  methods: [
    upsertProductList,
    removeProductList,
  ],
  limit: 5,
  timeRange: 1000,
});
