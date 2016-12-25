import { Meteor } from 'meteor/meteor'

const doAutoincrement = function(collection, callback) {
  collection.rawCollection().findAndModify({
    _id: 'autoincrement'
  }, [], {
    $inc: {
      value: 1
    }
  }, {
    'new': true
  }, callback);
}

export const nextAutoincrement = function(collection) {
  return Meteor.wrapAsync(doAutoincrement)(collection).value;
}
