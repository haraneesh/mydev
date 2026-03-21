import { Meteor } from 'meteor/meteor';

const Users = Meteor.users;

Users.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Users.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

// Meteor automatically creates this index
/*
if (Meteor.isServer) {
  Users.rawCollection().createIndex({ username: 1 }, { unique: true });
}
*/
