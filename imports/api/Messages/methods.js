import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import Messages from './Messages';
import constants from '../../modules/constants';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

function getUser(userId) {
  const msgCreator = Meteor.users.find(userId, {
    fields: {
      profile: 1,
      roles: 1,
    },
  }).fetch()[0];

  const ownerName = `${msgCreator.profile.salutation} ${msgCreator.profile.name.last}, ${msgCreator.profile.name.first}`;
  return {
    owner: userId,
    ownerName,
    ownerRole: msgCreator.roles[0],
  };
}

Meteor.methods({
  'messages.insert': function messagesInsert(msg) {
    check(msg, {
      postId: Match.Maybe(String),
      postType: Match.Maybe(String),
      messageType: String,
      message: String,
      messageStatus: Match.Maybe(String),
    });

    const userObj = getUser(this.userId);
    const message = { ...msg, messageStatus: constants.MessageStatus.Open.name, ...userObj };

    try {
      if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
        message.to = constants.Roles.admin.name;
      }

      if (!msg.messageStatus) {
        message.messageStatus = constants.MessageStatus.Open.name;
      }

      return Messages.insert(message);
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'messages.update': function messagesUpdate(msg) {
    check(msg, {
      _id: String,
      postId: Match.Maybe(String),
      postType: Match.Maybe(String),
      messageType: String,
      message: String,
      messageStatus: String,
    });

    try {
      const messageId = msg._id;
      const userObj = getUser(this.userId);
      const message = { ...msg, ...userObj };

      if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
        message.to = constants.Roles.admin.name;
      }

      Messages.update(messageId, { $set: message });
      return messageId;
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'messages.adminUpdate': function messagesAdminUpdate(msg) {
    check(msg, {
      _id: String,
      postId: Match.Maybe(String),
      postType: Match.Maybe(String),
      messageType: String,
      message: String,
      messageStatus: String,
    });

    try {
      const messageId = msg._id;
      const userObj = getUser(this.userId);
      const message = { ...msg, ...userObj };

      if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
        message.to = constants.Roles.admin.name;
      }

      if (!msg.messageStatus) {
        message.messageStatus = (msg.messageType !== constants.MessageTypes.Issue.name) ?
          constants.MessageStatus.Closed.name : constants.MessageStatus.Open.name;
      }

      Messages.update(messageId, { $set: message });
      return messageId;
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'messages.remove': function messagesRemove(messageId) {
    check(messageId, String);

    try {
      return Messages.remove(messageId);
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: [
    'messages.insert',
    'messages.update',
    'messages.remove',
  ],
  limit: 5,
  timeRange: 1000,
});
