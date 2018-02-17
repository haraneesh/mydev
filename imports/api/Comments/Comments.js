/* eslint-disable consistent-return */
import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import constants from '../../modules/constants';

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

if (Meteor.isServer) {
  Comments._ensureIndex({ postId: 1, postType: 1 });
}

const allowedValues = _.reduce(constants.CommentTypes, (arr, commentType) => {
  arr.push(commentType.name);
  return arr;
}, []);

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
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset();  // Prevent user from supplying their own value
    },
    optional: true,
  },
  // Force value to be current date (on server) upon update
  // and don't allow it to be set upon insert.
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isUpdate || this.isInsert) {
        return new Date();
      }
    },
    optional: true,
  },
});

Comments.attachSchema(Comments.schema);
