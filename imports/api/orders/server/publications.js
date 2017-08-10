import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { check } from 'meteor/check';
import Orders from '../Orders';

Meteor.publish('orders.list', function ordersList() {
  if (Roles.userIsInRole(this.userId, ['admin'])) {
    return Orders.find();
  }
  return [];
});

Meteor.publish('orders.list.status', function ordersListStatus(orderStatuses) {
  check(orderStatuses, [String]);
  if (Roles.userIsInRole(this.userId, ['admin'])) {
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
  if (Roles.userIsInRole(this.userId, ['admin'])) {
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
      ])*/
  }
  return Orders.find({
    $and: [{ _id: id }, { 'customer_details._id': this.userId }],
  });
});
