import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Orders from '../../orders/orders';

Meteor.publish('orders.list', () => Orders.find());

Meteor.publish('orders.view', (_id) => {
  check(_id, String);
  return Orders.find(_id);
});
