import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Specials from '../Specials';

Meteor.publish('specials.list', () => Specials.find({}, { sort: { displayOrder: 1 } }));

Meteor.publish('specials.view', (_id) => {
  check(_id, String);
  return Specials.find(_id);
});

Meteor.publish('specials.listPublishedStatus', (status) => {
  check(status, String);
  return Specials.find({ publishStatus: status }, { sort: { displayOrder: 1 } });
});
