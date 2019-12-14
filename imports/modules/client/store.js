import { Meteor } from 'meteor/meteor';

const store = require('store');

export const StoreConstants = {
  CART: 'CART',
  CARTICON: 'CARTICON',
};

export function saveInLocalStore(key, data) {
  const loggedInUserId = Meteor.userId();
  store.set(loggedInUserId + key, JSON.stringify(data));
}

export function getFromLocalStore(key) {
  const loggedInUserId = Meteor.userId();
  const getValue = store.get(loggedInUserId + key);
  return getValue ? JSON.parse(getValue) : '';
}

export function removeFromLocalStore(key) {
  const loggedInUserId = Meteor.userId();
  store.remove(loggedInUserId + key);
}
