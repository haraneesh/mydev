import { Meteor } from 'meteor/meteor';
import Products from '../Products';

Meteor.publish('products.list', () => Products.find({}, { sort: { type: 1, name: 1 } }));
Meteor.publish('products.listAvailableToOrder', () => Products.find({ availableToOrder: true }));
Meteor.publish('products.listSpecials', () => Products.find({ displayAsSpecial: true }));
