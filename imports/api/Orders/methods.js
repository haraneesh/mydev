import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Orders from './Orders';
import constants from '../../modules/constants';
import ProductLists from '../ProductLists/ProductLists';
import rateLimit from '../../modules/rate-limit';
import orderCommon from '../../modules/both/orderCommon';
import handleMethodException from '../../modules/handle-method-exception';
import { Emitter, Events } from '../events';

const calculateOrderTotal = (order, productListId) => {
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


const removePreviousOrderedQuantity = (existingOrder) => {
  const productListId = existingOrder.productOrderListId;

  // clear previous order counts

  existingOrder.products.forEach((product) => {
    ProductLists.update(
        { _id: productListId, 'products._id': product._id },
        { $inc: { 'products.$.totQuantityOrdered': -1 * product.quantity } });
  });
};

const addNewOrderedQuantity = (order) => {
  const productListId = order.productOrderListId;
  // update new order count
  order.products.forEach((product) => {
    ProductLists.update(
        { _id: productListId, 'products._id': product._id },
        { $inc: { 'products.$.totQuantityOrdered': product.quantity } });
  });
};

const getDeliveryDate = () => orderCommon.getTomorrowDateOnServer();

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
    if (Meteor.isServer) {
      const isUpdate = !!order._id;
      if (isUpdate) {
            // delete order.customer_details
            // delete order.productOrderListId
        const existingOrder = Orders.findOne(order._id);
        const loggedInUserId = Meteor.userId();
        if (loggedInUserId === existingOrder.customer_details._id || Roles.userIsInRole(loggedInUserId, ['admin'])) {
          order.customer_details = existingOrder.customer_details;
          order.productOrderListId = existingOrder.productOrderListId;
          order.order_status = order.order_status ? order.order_status : existingOrder.order_status;
          order.total_bill_amount = calculateOrderTotal(order, existingOrder.productOrderListId);
        } else {
          throw new Meteor.Error(401, 'Access denied');
        }
        removePreviousOrderedQuantity(existingOrder);
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
        order.order_status = constants.OrderStatus.Pending.name;
        order.total_bill_amount = calculateOrderTotal(order, order.productOrderListId);
        order.customer_details = {
          _id: loggedInUser._id,
          name: `${loggedInUser.profile.name.first} ${loggedInUser.profile.name.last}`,
          email: loggedInUser.emails[0].address,
          mobilePhone: loggedInUser.profile.whMobilePhone,
          deliveryAddress: loggedInUser.profile.deliveryAddress,
        };
      }

      order.expectedDeliveryDate = getDeliveryDate();

      const response = Orders.upsert({ _id: order._id }, { $set: order });
      addNewOrderedQuantity(order);
      if (response.insertedId) {
        ProductLists.update({ _id: order.productOrderListId },
        { $addToSet: { order_ids: response.insertedId } });

        Emitter.emit(Events.ORDER_CREATED, { userId: this.userId });
      }
      return response;
    }
  },
});

export const removeOrder = new ValidatedMethod({
  name: 'order.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    const order = Orders.findOne(_id);
    removePreviousOrderedQuantity(order);
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
    const order = Orders.findOne({ _id: orderId, 'customer_details._id': this.userId });
    if (order) {
      if (updateToStatus === constants.OrderStatus.Cancelled.name) {
        removePreviousOrderedQuantity(order);
      }
      return Orders.update({ _id: orderId }, { $set: { order_status: updateToStatus } });
    }
    // user not authorized. do not publish secrets
    throw new Meteor.Error(401, 'Access denied');
  },
});

export const updateExpectedDeliveryDate = new ValidatedMethod({
  name: 'orders.updateExpectedDeliveryDate',
  validate: new SimpleSchema({
    orderIds: { type: Array },
    'orderIds.$': { type: String },
    incrementDeliveryDateBy: { type: Number },
  }).validator(),
  run({ orderIds, incrementDeliveryDateBy }) {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      handleMethodException('Access denied', 403);
    }

    const orders = Orders.find({
      _id: { $in: orderIds },
      order_status: constants.OrderStatus.Pending.name,
    }, { _id: 1 }).fetch();

    if (orderIds.length !== orders.length) {
      handleMethodException(`Please select only orders in ${constants.OrderStatus.Pending.name} status.`, 403);
    }

    const newExpectedDeliveryDate = orderCommon.getIncrementedDateOnServer(new Date(), incrementDeliveryDateBy);

    return Orders.update(
      { _id: { $in: orderIds } },
       { $set: { expectedDeliveryDate: newExpectedDeliveryDate } },
        { multi: true },
      );
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
    const orders = Orders.find({ _id: { $in: orderIds } }).fetch();

    orders.forEach((order) => {
      if (updateToStatus !== order.order_status) {
        switch (true) {
          // current status is cancelled now we are changing to a live status
          case (order.order_status === constants.OrderStatus.Cancelled.name):
            addNewOrderedQuantity(order);
            break;
          // new status is cancelled
          case (updateToStatus === constants.OrderStatus.Cancelled.name):
            removePreviousOrderedQuantity(order);
            break;
          default:
            break;
        }
      }
    });

    return Orders.update(
      { _id: { $in: orderIds } },
       { $set: { order_status: updateToStatus } },
        { multi: true },
      );
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

export const getProductQuantityForOrderAwaitingFullFillmentNEW = new ValidatedMethod({
  name: 'order.getProductQuantityForOrdersAwaitingFullFillmentNEW',
  validate: new SimpleSchema({}).validator(),
  run() {
    if (Meteor.isServer) {
      if (Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
        return Orders.aggregate([{
          $match: { order_status: 'Awaiting_Fulfillment' },
        },
        {
          $unwind: '$products',
        },
        {
          $group: { _id: {
            // orderId: '$_id',
            productType: '$products.type',
            productName: '$products.name',
            productUnitOfSale: '$products.unitOfSale',
            productQuantity: '$products.quantity',
          },
           // totalQuantity: { $sum: '$products.quantity' },
            totalCount: { $sum: 1 },
            customerName: { $first: '$customer_details.name' },
          },
        },
        {
          $sort: {
            '_id.productType': 1,
            '_id.productName': 1,
          },
        },
        ]);
      }
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

Meteor.methods({
  'admin.fetchOrderCount': function adminFetchOrders() { // eslint-disable-line
   // check(options, Match.Maybe(Object));

    try {
      if (Roles.userIsInRole(this.userId, 'admin')) {
        return {
          total: Orders.find({}).count(),
        };
      }

      throw new Meteor.Error('403', 'Sorry, you need to be an administrator to do this.');
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    getOrders,
    getProductQuantityForOrderAwaitingFullFillment,
    getProductQuantityForOrderAwaitingFullFillmentNEW,
    updateMyOrderStatus,
    updateExpectedDeliveryDate,
    upsertOrder,
    removeOrder,
    updateOrderStatus,
    'admin.fetchOrderCount',
  ],
  limit: 5,
  timeRange: 1000,
});
