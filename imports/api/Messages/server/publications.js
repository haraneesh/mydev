import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import constants from '../../../modules/constants';
import Messages from '../Messages';

const customerUserQuery = (userId) => (
  { $or: [{ owner: userId }, { to: userId }, { to: constants.Roles.customer.name }] }
);

Meteor.publish('messages.customer', function messages(args) {
  check(args, { limit: Number });
  return Messages.find(customerUserQuery(this.userId),
    {
      sort: { updatedAt: constants.Sort.DESCENDING },
      limit: args.limit,
    });
});

Meteor.publish('messages.all', function messagesAll(args) {
  check(args, { limit: Number });
  if (Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
    return Messages.find({},
      {
        sort: { updatedAt: constants.Sort.DESCENDING },
        limit: args.limit,
      });
  }
});

Meteor.publish('messages.view', (messageId) => {
  check(messageId, String);
  return Messages.find({ _id: messageId });
});

Meteor.publish('messages.notifications', function searchSeries(lastFetchDateTime) {
  check(lastFetchDateTime, String);

  const { userId } = this;
  const isAdmin = Roles.userIsInRole(userId, [constants.Roles.admin.name]);

  const adminQuery = {
    $and: [
      { messageType: constants.MessageTypes.Issue.name },
      { messageStatus: constants.MessageStatus.Open.name },
    ],
  };

  const unReadUserQuery = {
    $and: [
      customerUserQuery(userId),
      { updatedAt: { $gt: new Date(lastFetchDateTime) } },
    ],
  };

  const cursor = Messages.find((isAdmin) ? adminQuery : unReadUserQuery);

  const handle = cursor.observeChanges({
    added: (id, fields) => {
      this.added('countOfUnreadMsgs', id, fields);
    },
    changed: (id, fields) => {
      this.changed('countOfUnreadMsgs', id, fields);
    },
    removed: (id) => {
      this.removed('countOfUnreadMsgs', id);
    },
  });

  this.ready();
  this.onStop(() => {
    handle.stop();
  });
});
