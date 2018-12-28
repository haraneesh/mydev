import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { check, Match } from 'meteor/check';
import Orders from '../Orders';
import constants from '../../../modules/constants';


Meteor.publish('orders.list', function ordersList(options) {
  check(options, { limit: Number, skip: Number,
    sort: {
      createdAt: Match.Maybe(Number),
      'customer_details.mobilePhone': Match.Maybe(Number),
      'customer_details.name': Match.Maybe(Number),
      order_status: Match.Maybe(Number),
      total_bill_amount: Match.Maybe(Number),
    },
  });
  if (Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
    const { limit = constants.InfiniteScroll.DefaultLimitOrders, sort, skip } = options;
    return [Orders.find({}, {
      sort,
      limit,
      skip,
    })];
  }
  return [];
});

Meteor.publish('orders.list.status', function ordersListStatus(orderStatuses) {
  check(orderStatuses, [String]);
  if (Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
    return Orders.find({ order_status: { $in: orderStatuses } });
  }
  return Orders.find({
    $and: [
        { order_status: { $in: orderStatuses } },
        { 'customer_details._id': this.userId },
    ],
  });
});

Meteor.publish('orders.mylist', function ordersMylist() {
  return Orders.find({ 'customer_details._id': this.userId });
});

Meteor.publish('orders.orderDetails', function orderDetails(id) {
  check(id, String);
  if (Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
    return Orders.find(id);
    /* return Orders.aggregate([
        {
            $lookup:
              {
                  from: "ProductLists",
                  localField: "productOrderListId",
                  foreignField: "_id",
                  as: "productsFromList"
              }
        },
        {
            $match: { "_id": id }
        }
      ]) */
  }
  return Orders.find({
    $and: [{ _id: id }, { 'customer_details._id': this.userId }],
  });
});
