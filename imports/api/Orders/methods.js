import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Orders } from './Orders';
import constants from '../../modules/constants';
import Products from '../Products/Products';
import ProductLists from '../ProductLists/ProductLists';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';
import { Emitter, Events } from '../Events/events';
import OrderCommon from '../../modules/both/orderCommon';
import { calculateBulkDiscount } from '../../modules/helpers';

const { costOfReturnable } = OrderCommon;

export const getPendingOrderDues = async (usrId) => {
  const pendingOrders = await Orders.find(
    {
      $and: [
        { 'customer_details._id': usrId },
        { order_status: constants.OrderStatus.Pending.name },
      ],
    }, {
      fields: {
        total_bill_amount: 1,
      },
    },
  ).fetchAsync();

  const pendingDuesTotal = pendingOrders.reduce((sum, pendingOrd) => sum + pendingOrd.total_bill_amount, 0);

  return {
    pendingDuesTotal,
    pendingOrderCount: pendingOrders.length,
  };
};

const calculateOrderTotal = async (order, productListId, userId) => {
  // Get Product List for cost
  // Get Order for list of items
  // calculate Total and return

  const isShopOwner = await Roles.userIsInRoleAsync(userId, constants.Roles.shopOwner.name);

  const productList = await ProductLists.findOneAsync({ _id: productListId });

  const productArray = productList.products.reduce((map, obj) => {
    map[obj._id] = obj;
    return map;
  }, {});

  let totalBillAmount = 0;
  const productsToUpdate = [];

  for (const prd of  order.products) {
    const key = prd._id;
    let product = productArray[key];
    if (!product) { /* product removed from product List after use chose it */
      product = prd;
      const findProduct = await Products.findOneAsync({ _id: key });
      product.unitprice = findProduct.unitprice;
      product.wSaleBaseUnitPrice = findProduct.wSaleBaseUnitPrice;
    }

    const quantity = prd.quantity ? prd.quantity : 0;

    if (isShopOwner) {
      if (product.sourceSuppliers && product.sourceSuppliers.length > 0) {
        totalBillAmount += quantity * product.wSaleBaseUnitPrice
          * (1 + (product.sourceSuppliers[0].marginPercentage / 100));
      } else {
        totalBillAmount += quantity * product.wSaleBaseUnitPrice;
      }
    } else {
      // totalBillAmount += quantity * product.unitprice;
      totalBillAmount += calculateBulkDiscount({ ...product, quantitySelected: quantity });
      // calculate bulk discount
      // console.log(product.unitsForSelection);
      // add cost of returnables
      const { retQtySelected, retQtySelectedPrice } = (
        product.includeReturnables
        && product.associatedReturnables
        && prd.associatedReturnables.quantity > 0)
        ? costOfReturnable(product.associatedReturnables.returnableUnitsForSelection, quantity)
        : { retQtySelected: 0, retQtySelectedPrice: 0 };

      product.associatedReturnables = prd.associatedReturnables || {};
      product.associatedReturnables.totalPrice = retQtySelectedPrice * 1;
      totalBillAmount += retQtySelectedPrice * 1; // to number
    }
    product.quantity = quantity;
    productsToUpdate.push(product);
  }
  await Orders.updateAsync({ _id: order._id }, { $set: { products: productsToUpdate } });
  return totalBillAmount;
}

const removePreviousOrderedQuantity = async (existingOrder) => {
  const productListId = existingOrder.productOrderListId;

  // clear previous order counts
  for (const product of  existingOrder.products) {
    await ProductLists.updateAsync(
      { _id: productListId, 'products._id': product._id },
      { $inc: { 'products.$.totQuantityOrdered': -1 * product.quantity } },
    );
  }
};

const addNewOrderedQuantity = async (order) => {
  const productListId = order.productOrderListId;
  // update new order count
  for (const product of  order.products) {
    await ProductLists.updateAsync(
      { _id: productListId, 'products._id': product._id },
      { $inc: { 'products.$.totQuantityOrdered': product.quantity } },
    );
  }
}

const addUpdateOrder = async (order) => {
  const isUpdate = !!order._id;
  const { loggedInUserId } = order;
  if (isUpdate) {
    // delete order.customer_details
    // delete order.productOrderListId
    const existingOrder = await Orders.findOneAsync(order._id);
    if (loggedInUserId === existingOrder.customer_details._id || await Roles.userIsInRoleAsync(Meteor.userId(), ['admin'])) {
      order.customer_details = existingOrder.customer_details;
      order.productOrderListId = existingOrder.productOrderListId;
      order.order_status = order.order_status ? order.order_status : existingOrder.order_status;
      order.total_bill_amount = await calculateOrderTotal(order, existingOrder.productOrderListId, existingOrder.customer_details._id);
    } else {
      throw new Meteor.Error(401, 'Access denied');
    }
    await removePreviousOrderedQuantity(existingOrder);
  } else {
    const today = new Date();
    const productListActiveToday = await ProductLists.findOneAsync(
      {
        $and: [
          { activeStartDateTime: { $lte: today } },
          { activeEndDateTime: { $gte: today } },
        ],
      },
    );
    order.productOrderListId = productListActiveToday._id;
    order.order_status = constants.OrderStatus.Pending.name;
    order.total_bill_amount = await calculateOrderTotal(order, order.productOrderListId, loggedInUserId);
    const loggedInUser = await Meteor.users.findOneAsync({ _id: loggedInUserId });
    //const loggedInUserRoles = await Roles.getRolesForUserAsync(loggedInUserId);

    order.customer_details = {
      _id: loggedInUserId,
      name: `${loggedInUser.profile.name.first} ${loggedInUser.profile.name.last}`,
      //role: loggedInUserRoles[0],
      email: (loggedInUser.emails && loggedInUser.emails[0]) ? loggedInUser.emails[0].address : '',
      mobilePhone: loggedInUser.profile.whMobilePhone,
      deliveryAddress: loggedInUser.profile.deliveryAddress,
    };
  }

  order.expectedDeliveryDate = getDeliveryDate();

  order.customer_details.role = await getOrderRole(order.customer_details._id);

  const response = await Orders.upsertAsync({ _id: order._id }, { $set: order });

  await addNewOrderedQuantity(order);
  if (response.insertedId) {
    await ProductLists.updateAsync({ _id: order.productOrderListId },
      { $addToSet: { order_ids: response.insertedId } });
  }
  return response;
};

const getDeliveryDate = () => OrderCommon.getTomorrowDateOnServer();

export const upsertOrder = new ValidatedMethod({
  name: 'orders.upsert',
  validate: new SimpleSchema({
    _id: { type: String, optional: true },
    order_status: { type: String, optional: true },
    comments: { type: String, optional: true },
    loggedInUserId: { type: String },
    deliveryPincode: { type: String, optional: true },
    basketId: { type: String, optional: true },
    issuesWithPreviousOrder: { type: String, optional: true },
    payCashWithThisDelivery: { type: Boolean, optional: true },
    collectRecyclablesWithThisDelivery: { type: Boolean, optional: true },
    products: { type: Array, optional: true },
    'products.$': { type: Object, blackbox: true, optional: true },
    onBehalf: { type: Object, optional: true },
    'onBehalf.postUserId': { type: String },
    'onBehalf.orderReceivedAs': { type: String, allowedValues: constants.OrderReceivedType.allowedValues },
  }).validator(),
  async run(order) {
    if (Meteor.isServer) {
      return await addUpdateOrder(order);
    }
  },
});

const getOrderRole = async (customerId) => {
  if (await Roles.userIsInRoleAsync(customerId, constants.Roles.customer.name)) {
    return constants.Roles.customer.name;
  }

  return constants.Roles.shopOwner.name;
};

export const removeOrder = new ValidatedMethod({
  name: 'order.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  async run({ _id }) {
    const order = await Orders.findOneAsync(_id);
    await removePreviousOrderedQuantity(order);
    await Orders.removeAsync(_id);
  },
});

export const getOrderDetails = new ValidatedMethod({
  name: 'orders.getOrderDetails',
  validate: new SimpleSchema({ orderId: { type: String } }).validator(),
  async run({ orderId }) {
    const ords = await Orders.find({
      $and: [{ _id: orderId }, { 'customer_details._id': this.userId }],
    }).fetchAsync();
    return ords[0];
  },
});

export const updateMyOrderStatus = new ValidatedMethod({
  name: 'orders.updateMyOrderStatus',
  validate: new SimpleSchema({
    orderId: { type: String },
    updateToStatus: { type: String },
  }).validator(),
  async run({ orderId, updateToStatus }) {
    const order = await Orders.findOneAsync({ _id: orderId, 'customer_details._id': this.userId });
    if (order) {
      if (updateToStatus === constants.OrderStatus.Cancelled.name) {
        await removePreviousOrderedQuantity(order);
      }
      return await Orders.updateAsync({ _id: orderId }, { $set: { order_status: updateToStatus } });
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
  async run({ orderIds, incrementDeliveryDateBy }) {
    const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);

    if (!isAdmin) {
      handleMethodException('Access denied', 403);
    }

    const orders = await Orders.find({
      _id: { $in: orderIds },
      order_status: constants.OrderStatus.Pending.name,
    }, { _id: 1 }).fetchAsync();

    if (orderIds.length !== orders.length) {
      handleMethodException(`Please select only orders in '${constants.OrderStatus.Pending.display_value}' status.`, 403);
    }

    const newExpectedDeliveryDate = OrderCommon.getIncrementedDateOnServer(new Date(), incrementDeliveryDateBy);

    return await Orders.updateAsync(
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
  async run({ orderIds, updateToStatus }) {
    const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name)
    if (!isAdmin) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(401, 'Access denied');
    }
    const orders = await Orders.find({ _id: { $in: orderIds } }).fetchAsync();

   
    for (const order of orders){
      if (updateToStatus !== order.order_status) {
        switch (true) {
          // current status is cancelled now we are changing to a live status
          case (order.order_status === constants.OrderStatus.Cancelled.name):
            await addNewOrderedQuantity(order);
            break;
          // new status is cancelled
          case (updateToStatus === constants.OrderStatus.Cancelled.name):
            await removePreviousOrderedQuantity(order);
            break;
          default:
            break;
        }
      }
    }  

    return await Orders.updateAsync(
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
  async run({ orderIds }) {
    const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name);
    if (isAdmin) {
      return await Orders.find({ _id: { $in: orderIds } }).fetchAsync();
    }
  },
});

export const getProductQuantityForOrderAwaitingFullFillmentNEW = new ValidatedMethod({
  name: 'order.getProductQuantityForOrdersAwaitingFullFillmentNEW',
  validate: new SimpleSchema({ isWholeSale: { type: Boolean } }).validator(),
  async run({ isWholeSale }) {
    if (Meteor.isServer) {

      const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name)

      if (isAdmin) {
        const selectQuery = (isWholeSale)
          ? [
            { order_status: 'Awaiting_Fulfillment' },
            { 'customer_details.role': { $eq: constants.Roles.shopOwner.name } },
          ]
          : [
            { order_status: 'Awaiting_Fulfillment' },
            { 'customer_details.role': { $not: { $eq: constants.Roles.shopOwner.name } } },
          ];

        const OrdersRawCollection = Orders.rawCollection();
        return OrdersRawCollection.aggregate([{
          // $match: { order_status: 'Awaiting_Fulfillment' },
          $match: {
            $and: selectQuery,
          },
        },
        {
          $unwind: '$products',
        },
        {
          $group: {
            _id: {
              // orderId: '$_id',
              productType: '$products.type',
              productName: '$products.name',
              customerName: '$customer_details.name',
            },
            productUnitOfSale: { $first: '$products.unitOfSale' },
            productQuantity: { $sum: '$products.quantity' },
            // totalQuantity: { $sum: '$products.quantity' },
            // totalCount: { $sum: 1 },
            // customerName: { $first: '$customer_details.name' },
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
  validate: new SimpleSchema({ isWholeSale: { type: Boolean } }).validator(),
  async run({ isWholeSale }) {
    if (Meteor.isServer) {

      const isAdmin = await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name)

      if (isAdmin) {
        const selectQuery = (isWholeSale)
          ? [
            { order_status: 'Awaiting_Fulfillment' },
            { 'customer_details.role': { $eq: constants.Roles.shopOwner.name } },
          ]
          : [
            { order_status: 'Awaiting_Fulfillment' },
            { 'customer_details.role': { $not: { $eq: constants.Roles.shopOwner.name } } },
          ];
        const OrdersRawCollection = Orders.rawCollection();
        return OrdersRawCollection.aggregate([{
          $match: {
            $and: selectQuery,
          },
        }, {
          $unwind: '$products',
        },
        {
          $group: {
            _id: {
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
  'admin.fetchOrderCount': async function adminFetchOrders(options) { // eslint-disable-line

    check(options, { isWholeSale: Boolean });

    let customerRoles = [constants.Roles.customer.name, constants.Roles.admin.name];
    if (options.isWholeSale) {
      customerRoles = [constants.Roles.shopOwner.name];
    }

    try {
      if (await Roles.userIsInRoleAsync(this.userId, 'admin')) {
        return {
          total: await Orders.find({ 'customer_details.role': { $in: customerRoles } }).countAsync(),
        };
      }

      throw new Meteor.Error('403', 'You need to be an administrator to do this.');
    } catch (exception) {
      handleMethodException(exception);
    }
  },

  'admin.fetchDetailsForPO': async function adminFetchDetailsForPO(options) { // eslint-disable-line
    check(options, { orderIds: Array, includeBuyer: Boolean });
    // check(orderIds, Array);

    try {
      if (Meteor.isServer) {
        if (await Roles.userIsInRoleAsync(this.userId, constants.Roles.admin.name)) {
          const selectQuery = [
            // { order_status: 'Awaiting_Fulfillment' },
            { 'customer_details.role': { $eq: constants.Roles.shopOwner.name } },
            { _id: { $in: options.orderIds } },
          ];

          const id = (!options.includeBuyer) ? {
            productSKU: '$products.sku',
            productName: '$products.name',
            productWSaleBaseUnitPrice: '$products.wSaleBaseUnitPrice',
          } : {
            productSKU: '$products.sku',
            productName: '$products.name',
            productUnitOfSale: '$products.unitOfSale',
            productWSaleBaseUnitPrice: '$products.wSaleBaseUnitPrice',
            customerId: '$customer_details._id',
            customerName: '$customer_details.name',
          };
          const OrdersRawCollection = Orders.rawCollection();
          return OrdersRawCollection.aggregate([{
            $match: {
              $and: selectQuery,
            },
          }, {
            $unwind: '$products',
          },
          {
            $group: {
              _id: id,
              totalQuantity: { $sum: '$products.quantity' },
            },
          },
          ]);
        }
        throw new Meteor.Error('403', 'You need to be an administrator to do this.');
      }
    } catch (exception) {
      handleMethodException(exception);
    }
  },

});

rateLimit({
  methods: [
    getOrders,
    getOrderDetails,
    getProductQuantityForOrderAwaitingFullFillment,
    getProductQuantityForOrderAwaitingFullFillmentNEW,
    updateMyOrderStatus,
    updateExpectedDeliveryDate,
    upsertOrder,
    removeOrder,
    updateOrderStatus,
    'admin.fetchOrderCount',
    'admin.fetchDetailsForPO',
  ],
  limit: 5,
  timeRange: 1000,
});
