import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Orders from './Orders';
import constants from '../../modules/constants.js';
import ProductLists from '../ProductLists/ProductLists';
import rateLimit from '../../modules/rate-limit';

const _calculateOrderTotal = function (order, productListId) {
  // Get Product List for cost
  // Get Order for list of items
  // calculate Total and return

  const productList = ProductLists.findOne({ _id: productListId });

  const productArray = productList.products.reduce((map, obj) => {
    map[obj._id] = obj;
    return map;
  }, {});

  let totalBillAmount = 0;
  order.products.forEach((product) => {
    const key = product._id;
    const quantity = product.quantity ? product.quantity : 0;
    totalBillAmount += quantity * productArray[key].unitprice;
  });

  return totalBillAmount;
};


export const upsertOrder = new ValidatedMethod({
  name: 'orders.upsert',
  validate: new SimpleSchema({
    _id: { type: String, optional: true },
    order_status: { type: String, optional: true },
    comments: { type: String, optional: true },
    products: { type: Array, optional: true },
    'products.$': { type: Object, blackbox: true, optional: true },
  }).validator(),
  run(order) {
      // if (Meteor.isServer) {
    if (order._id) {
            // delete order.customer_details
            // delete order.productOrderListId
      const currentOrder = Orders.findOne(order._id);
      const loggedInUserId = Meteor.userId();
      if (loggedInUserId === currentOrder.customer_details._id || Roles.userIsInRole(loggedInUserId, ['admin'])) {
        order.customer_details = currentOrder.customer_details;
        order.productOrderListId = currentOrder.productOrderListId;
        order.total_bill_amount = _calculateOrderTotal(order, currentOrder.productOrderListId);
      } else {
        throw new Meteor.Error(401, 'Access denied');
      }
    } else {
      const loggedInUser = Meteor.users.findOne(Meteor.userId());
      const today = new Date();
      const productListActiveToday = ProductLists.findOne(
        { $and: [
                      { activeStartDateTime: { $lte: today } },
                      { activeEndDateTime: { $gte: today } },
        ],
        },
              );
      order.productOrderListId = productListActiveToday._id;
      order.total_bill_amount = _calculateOrderTotal(order, order.productOrderListId);
      order.customer_details = {
        _id: loggedInUser._id,
        name: `${loggedInUser.profile.name.first} ${loggedInUser.profile.name.last}`,
        email: loggedInUser.emails[0].address,
        mobilePhone: loggedInUser.profile.whMobilePhone,
        deliveryAddress: loggedInUser.profile.deliveryAddress,
      };
    }
    // }
    const response = Orders.upsert({ _id: order._id }, { $set: order });

    if (response.insertedId) {
      ProductLists.update({ _id: order.productOrderListId }, { $addToSet: { order_ids: response.insertedId } });
    }
    return response;
  },
});

export const removeOrder = new ValidatedMethod({
  name: 'order.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    Orders.remove(_id);
  },
});

export const updateMyOrderStatus = new ValidatedMethod({
  name: 'orders.updateMyOrderStatus',
  validate: new SimpleSchema({
    orderId: { type: String },
    updateToStatus: { type: String },
  }).validator(),
  run({ orderId, updateToStatus }) {
    return Orders.update({ _id: orderId }, { $set: { order_status: updateToStatus } });
  },
});

export const updateOrderStatus = new ValidatedMethod({
  name: 'orders.updateOrderStatus',
  validate: new SimpleSchema({
    orderIds: { type: Array },
    'orderIds.$': { type: String },
    updateToStatus: { type: String },
  }).validator(),
  run({ orderIds, updateToStatus }) {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(401, 'Access denied');
    }
    return Orders.update({ _id: { $in: orderIds } }, { $set: { order_status: updateToStatus } }, { multi: true });
  },
});

export const getOrders = new ValidatedMethod({
  name: 'orders.getOrders',
  validate: new SimpleSchema({
    orderIds: { type: Array },
    'orderIds.$': { type: String },
  }).validator(),
  run({ orderIds }) {
    if (Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      return Orders.find({ _id: { $in: orderIds } }).fetch();
    }
  },
});

export const getProductQuantityForOrderAwaitingFullFillment = new ValidatedMethod({
  name: 'order.getProductQuantityForOrdersAwaitingFullFillment',
  validate: new SimpleSchema({}).validator(),
  run() {
    if (Meteor.isServer) {
      if (Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
        return Orders.aggregate([{
          $match: { order_status: 'Awaiting_Fulfillment' },
        }, {
          $unwind: '$products',
        },
        {
          $group: { _id: {
            productName: '$products.name',
            productUnitOfSale: '$products.unitOfSale',
          },
            totalQuantity: { $sum: '$products.quantity' },
          },
        },
        ]);
      }
    }
  },
});

rateLimit({
  methods: [
    getOrders,
    getProductQuantityForOrderAwaitingFullFillment,
    updateMyOrderStatus,
    upsertOrder,
    removeOrder,
    updateOrderStatus,
  ],
  limit: 5,
  timeRange: 1000,
});
