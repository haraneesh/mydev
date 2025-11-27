import { Meteor } from 'meteor/meteor';

export function saveInLocalStore(key, data) {
  const loggedInUserId = Meteor.userId();
  window.localStorage.setItem(loggedInUserId + key, JSON.stringify(data));
}

export function getFromLocalStore(key) {
  const loggedInUserId = Meteor.userId();
  const getValue = window.localStorage.getItem(loggedInUserId + key);
  return getValue ? JSON.parse(getValue) : '';
}

export function removeFromLocalStore(key) {
  const loggedInUserId = Meteor.userId();
  window.localStorage.removeItem(loggedInUserId + key);
}

export function clearEntireLocalStore() {
  window.localStorage.clear();
}
