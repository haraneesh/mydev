/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Match, check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import Messages from './Messages';
import commentFunctions from '../Comments/commentFunctions';
import constants from '../../modules/constants';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

const validateTo = (to, isAdmin) => {
  switch (true) {
    case (isAdmin || to !== 'ALL'):
      return to;
    default:
      return constants.Roles.admin.name;
  }
};

Meteor.methods({
  'messages.insert': function messagesInsert(msg) {
    check(msg, {
      postId: Match.Maybe(String),
      postType: Match.Maybe(String),
      messageType: String,
      message: String,
      messageStatus: Match.Maybe(String),
      imageId: Match.Maybe(String),
      onBehalf: Match.Maybe({
        onBehalfUserId: Match.Maybe(String),
        orderReceivedAs: Match.Maybe(String),
      }),
      to: Match.Maybe(String),
    });

    try {
      const isAdmin = Roles.userIsInRole(this.userId, constants.Roles.admin.name);
      const userObj = (isAdmin && msg.onBehalf && msg.onBehalf.onBehalfUserId) ? commentFunctions.getUser(msg.onBehalf.onBehalfUserId)
        : commentFunctions.getUser(this.userId);

      const message = {
        ...msg, messageStatus: constants.MessageStatus.Open.name, ...userObj, commentCount: 0,
      };
      delete message.onBehalf;

      // message.to = validateTo(msg.to, isAdmin);
      message.to = constants.Roles.admin.name;

      if (isAdmin && msg.onBehalf) {
        message.onBehalf = {
          postedByUserId: this.userId,
          orderReceivedAs: msg.onBehalf.orderReceivedAs,
        };
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
      imageId: Match.Maybe(String),
    });

    try {
      const messageId = msg._id;
      // const userObj = commentFunctions.getUser(this.userId);
      const message = { ...msg };

      if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
        message.to = constants.Roles.admin.name;
      }

      Messages.update(messageId, { $set: message });
      return messageId;
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'message.detail': function messageDetail(msgId) {
    check(msgId, String);

    try {
      return Messages.find({ _id: msgId }).fetch()[0];
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
  'messages.addComment': function messagesAddComment(options) {
    check(options, {
      postId: String,
      commentText: String,
    });

    try {
      // const message = Messages.find({ _id: comment.postId }).fetch()[0];
      const cmt = {
        ...options,
        owner: this.userId,
        commentStatus: constants.CommentTypes.Approved.name,
        postType: constants.PostTypes.Messages.name,
      };

      commentFunctions.commentInsert(cmt);
      const commentCount = commentFunctions.getComments(options.postId).length;
      // const commentIds = (message.commentIds) ? message.commentIds : [];
      // commentIds.push(commentId);
      Messages.update({ _id: options.postId }, { $set: { commentCount } });
      // return message;
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'messages.updateComment': function messagesUpdateComment(options) {
    check(options, {
      commentId: String,
      postId: String,
      commentText: String,
    });

    try {
      const message = Messages.find({ _id: options.postId }).fetch()[0];

      if (message.owner === this.userId || Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
        const cmt = {
          ...options,
          owner: message.owner,
          commentStatus: constants.CommentTypes.Approved.name,
          postType: constants.PostTypes.Messages.name,
        };

        commentFunctions.commentUpdate(cmt);
      }
      return message;
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'messages.removeComment': function messagesRemoveComment(options) {
    check(options, {
      commentId: String,
      postId: String,
    });

    try {
      commentFunctions.commentDelete(options.commentId);
      const commentsForPost = commentFunctions.getComments(options.postId);
      const commentIds = commentsForPost.map((comment) => comment._id);
      return Messages.update({ _id: options.postId }, { $set: { commentIds } });
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'messages.updateLastVisitedDate': function messageAppLastVisitedDate() {
    Meteor.users.update(
      { _id: this.userId },
      { $set: { 'globalStatuses.lastVisitedMessageApp': new Date() } },
    );
  },
});

rateLimit({
  methods: [
    'messages.insert',
    'messages.update',
    'message.detail',
    'messages.remove',
    'messages.addComment',
    'messages.updateComment',
    'messages.removeComment',
  ],
  limit: 5,
  timeRange: 1000,
});
