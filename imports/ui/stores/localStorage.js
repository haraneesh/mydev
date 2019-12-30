import { Meteor } from 'meteor/meteor';

const loggedInUserId = Meteor.userId();

export function saveInLocalStore(key, data) {
  window.localStorage.setItem(loggedInUserId + key, JSON.stringify(data));
}

export function getFromLocalStore(key) {
  const getValue = window.localStorage.getItem(loggedInUserId + key);
  return getValue ? JSON.parse(getValue) : '';
}

export function removeFromLocalStore(key) {
  window.localStorage.removeItem(loggedInUserId + key);
}

export function clearEntireLocalStore() {
  window.localStorage.clear();
}
