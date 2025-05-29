import { Roles } from 'meteor/alanning:roles';
import { Match, check } from 'meteor/check';
/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import constants from '../../modules/constants';
import handleMethodException from '../../modules/handle-method-exception';
import rateLimit from '../../modules/rate-limit';
import commentFunctions from '../Comments/commentFunctions';
import Messages from './Messages';
import msgUsers from './msgConstants';

const messageTo = (messageType) => {
  switch (true) {
    case constants.MessageTypes.Message.name === messageType:
      return constants.Roles.customer.name; // visible to all customers
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
      const isAdmin = Roles.userIsInRole(this.userId, [
        constants.Roles.admin.name,
        constants.Roles.superAdmin.name,
      ]);
      const userObj =
        isAdmin && msg.onBehalf && msg.onBehalf.onBehalfUserId
          ? commentFunctions.getUser(msg.onBehalf.onBehalfUserId)
          : commentFunctions.getUser(this.userId);

      const message = {
        ...msg,
        messageStatus: constants.MessageStatus.Open.name,
        ...userObj,
        commentCount: 0,
      };
      delete message.onBehalf;

      // message.to = validateTo(msg.to, isAdmin);
      message.likeMemberId = [];
      message.to = messageTo(msg.messageType);
      // ? constants.Roles.customer.name // visible to all customers
      // : constants.Roles.admin.name;

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

      /*
      if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
        message.to = constants.Roles.admin.name;
      } */

      message.to = messageTo(msg.messageType);

      Messages.update(messageId, { $set: message });
      return messageId;
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'message.detail': function messageDetail(msgId) {
    check(msgId, String);

    try {
      const messages = Messages.find({ _id: msgId }).fetchAsync();
      return messages[0];
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
  'messages.updateLike': function messagesRemove(messageId) {
    check(messageId, String);

    try {
      const { userId } = this;
      const message = Messages.findOne({ _id: messageId });
      const updatedLikeMemberId = message.likeMemberId
        ? message.likeMemberId
        : [];

      const memberIdLocation = updatedLikeMemberId.indexOf(userId);

      if (memberIdLocation !== -1) {
        updatedLikeMemberId.splice(memberIdLocation, 1);
      } else {
        updatedLikeMemberId.push(userId);
      }

      Messages.update(
        { _id: messageId },
        { $set: { likeMemberId: updatedLikeMemberId } },
      );
      return updatedLikeMemberId;
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'messages.addLikes': function addLikes(options) {
    check(options, {
      messageId: String,
      howManyLikes: Number,
    });

    const numLikesToAdd = options.howManyLikes > 20 ? 20 : options.howManyLikes;

    for (let i = 0; i < numLikesToAdd; i += 1) {
      const updatedLikeMemberId = msgUsers[i].username;
      Messages.update(
        { _id: options.messageId },
        { $addToSet: { likeMemberId: updatedLikeMemberId } },
      );
    }
  },
  'messages.addComment': function messagesAddComment(options) {
    check(options, {
      postId: String,
      commentText: String,
    });

    try {
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
  'messages.updateComment': async function messagesUpdateComment(options) {
    check(options, {
      commentId: String,
      postId: String,
      commentText: String,
    });

    try {
      const messages = await Messages.find({
        _id: options.postId,
      }).fetchAsync();
      const message = messages[0];

      if (
        message.owner === this.userId ||
        (await Roles.userIsInRole(this.userId, constants.Roles.admin.name))
      ) {
        const cmt = {
          ...options,
          owner: message.owner,
          commentStatus: constants.CommentTypes.Approved.name,
          postType: constants.PostTypes.Messages.name,
        };

        commentFunctions.commentUpdateAsync(cmt);
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
    'messages.updateLike',
    'messages.addLikes',
    'messages.addComment',
    'messages.updateComment',
    'messages.removeComment',
  ],
  limit: 5,
  timeRange: 1000,
});
