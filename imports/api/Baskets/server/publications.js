import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Baskets from '../Baskets';

Meteor.publish('baskets', function baskets() {
  return Baskets.find({ owner: this.userId }, { fields: { createdAt: 0, updatedAt: 0 } });
});

// Note: baskets.view is also used when editing an existing supplier.
Meteor.publish('baskets.view', function basketsView(basketId) {
  check(basketId, String);
  return Baskets.find({ _id: basketId, owner: this.userId });
});
