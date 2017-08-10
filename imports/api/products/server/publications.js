import { Meteor } from 'meteor/meteor';
import Products from '../Products';

Meteor.publish('products.list', () => Products.find());
