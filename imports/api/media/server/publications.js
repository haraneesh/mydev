import { check } from 'meteor/check';
import { Meteor } from 'meteor/meteor';
import Media from '../Media';

Meteor.publish('media.list', () => Media.find());

Meteor.publish('media.view', (_id) => {
  check(_id, String);
  return Media.find(_id);
});
