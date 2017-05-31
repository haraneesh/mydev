import { check } from 'meteor/check';
import Media from '../media';

Meteor.publish('media.list', () => Media.find());

Meteor.publish('media.view', (_id) => {
  check(_id, String);
  return Media.find(_id);
});
