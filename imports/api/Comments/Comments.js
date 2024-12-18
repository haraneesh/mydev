import { Meteor } from 'meteor/meteor';
/* eslint-disable consistent-return */
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import constants from '../../modules/constants';

import 'meteor/aldeed:collection2/static';

const Comments = new Mongo.Collection('Comments');
export default Comments;

Comments.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Comments.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

const allowedValues = _.reduce(
  constants.CommentTypes,
  (arr, commentType) => {
    arr.push(commentType.name);
    return arr;
  },
  [],
);

Comments.schema = new SimpleSchema({
  postType: {
    type: String,
    label: 'The type of post to which this comment is attached to.',
    allowedValues: constants.PostTypes.allowedValues,
  },
  postId: {
    type: String,
    label: 'The ID of the post to which this comment is attached.',
  },
  description: {
    type: String,
    label: 'The comment goes here.',
  },
  owner: {
    type: String,
    label: 'The person who created the post.',
  },
  ownerName: {
    type: String,
    label: 'The name of the person who commented',
    optional: true,
  },
  status: {
    type: String,
    label: 'The status of the comment.',
    allowedValues,
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      }
      if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset(); // Prevent user from supplying their own value
    },
    optional: true,
  },
  // Force value to be current date (on server) upon update
  // and don't allow it to be set upon insert.
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isInsert || this.isUpdate || this.isUpsert) {
        return new Date();
      }
    },
    optional: true,
  },
});

if (Meteor.isServer) {
  Comments.rawCollection().createIndex(
    { postId: 1, postType: 1 },
    { name: 'postId_1_postType_1' },
  );
}

Comments.attachSchema(Comments.schema);
