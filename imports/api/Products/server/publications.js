import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import Products from '../Products';

Meteor.publish('products.list', function(filters) {
  // Validate filters parameter
  check(filters, Match.Maybe(Object));
  
  return Products.find({}, { sort: { type: 1, name: 1 } });
});

Meteor.publish('products.listAvailableToOrder', () => Products.find({ availableToOrder: true }));
Meteor.publish('products.listSpecials', () => Products.find({ displayAsSpecial: true }));
