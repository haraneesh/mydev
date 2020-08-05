/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import Comments from '../Comments/Comments';
import constants from '../../modules/constants';
import { number } from 'prop-types';

const Messages = new Mongo.Collection('Messages');

Messages.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Messages.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});


if (Meteor.isServer) {
  Messages._ensureIndex({ to: 1 });
}

Messages.schema = new SimpleSchema({
  owner: {
    type: String,
    label: 'The ID of the user this message belongs to.',
  },
  ownerName: {
    type: String,
    label: 'The name of the owner this message was sent by',
  },
  ownerRole: {
    type: String,
    label: 'The role of the owner this message was sent by',
  },
  to: {
    type: String,
    label: 'To whom is this message should go to',
  },
  postId: {
    type: String,
    label: 'The ID of the post for which this message was given.',
    optional: true,
  },
  postType: {
    type: String,
    label: 'The type of the post',
    allowedValues: constants.PostTypes.allowedValues,
    optional: true,
  },
  commentCount: {
    type: Number,
    min: 0,
    label: 'The count of comments',
  },
  unreadCommentCount: {
    type: Number,
    label: 'The count of unread comments',
    optional: true,
  },
  message: {
    type: String,
    label: 'The body of the message.',
  },
  onBehalf: { type: Object, optional: true },
  'onBehalf.postedByUserId': { type: String },
  'onBehalf.orderReceivedAs': { type: String, allowedValues: constants.OrderReceivedType.allowedValues },
  messageStatus: {
    type: String,
    label: 'The status of message .',
    allowedValues: constants.MessageStatus.allowedValues,
  },
  messageType: {
    type: String,
    label: 'The type of the message that was given',
    allowedValues: constants.MessageTypes.allowedValues,
  },
  createdAt: {
    type: String,
    label: 'The date this message was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
    optional: true,
  },
  updatedAt: {
    type: String,
    label: 'The date this message was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate || this.isUpsert) return (new Date()).toISOString();
    },
    optional: true,
  },
});

Messages.attachSchema(Messages.schema);

export default Messages;