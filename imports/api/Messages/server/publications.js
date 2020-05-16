import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import constants from '../../../modules/constants';
import Messages from '../Messages';

Meteor.publish('messages', function messages() {
  return Messages.find({ $or: [{ owner: this.userId }, { to: this.userId }, { to: 'ALL' }] }, { sort: { updatedAt: constants.Sort.DESCENDING } });
});

Meteor.publish('messages.view', function messagesView(messageId) {
  check(messageId, String);
  return Messages.find({ _id: messageId, owner: this.userId }, { sort: { updatedAt: constants.Sort.DESCENDING } });
});

Meteor.publish('messages.all', function messagesAll() {
  if (Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
    return Messages.find({ }, { sort: { updatedAt: constants.Sort.DESCENDING } });
  }
});
