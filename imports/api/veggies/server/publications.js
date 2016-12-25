import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Veggies from '../veggies';

Meteor.publish('veggies.list', () => Veggies.find());

Meteor.publish('veggies.view', (_id) => {
  check(_id, String);
  return Veggies.find(_id);
});
