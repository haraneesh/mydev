/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import constants from '../../modules/constants';

const FeedBacks = new Mongo.Collection('FeedBacks');

FeedBacks.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

FeedBacks.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

FeedBacks.schema = new SimpleSchema({
  owner: {
    type: String,
    label: 'The ID of the user this feedback belongs to.',
  },
  postId: {
    type: String,
    label: 'The ID of the post for which this feedback was given.',
  },
  postType: {
    type: String,
    label: 'The type of the post on which the feedback was given',
    allowedValues: constants.PostTypes.allowedValues,
  },
  feedBackType: {
    type: String,
    label: 'The type of the feedback that was given',
    allowedValues: constants.FeedBackTypes.allowedValues,
  },
  rating: {
    type: Number,
    label: 'Rating given by the feed back giver.',
  },
  ratingLabel: {
    type: String,
    optional: true,
    label: 'Rating text chosen for the number value (rating).',
  },
  questionAsked: {
    type: String,
    label: 'Question asked to the user.',
  },
  description: {
    type: String,
    label: 'The body of the feedback.',
    optional: true,
  },
  createdAt: {
    type: String,
    label: 'The date this feedback was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
    optional: true,
  },
  updatedAt: {
    type: String,
    label: 'The date this feedback was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate || this.isUpsert) return (new Date()).toISOString();
    },
    optional: true,
  },
});

if (Meteor.isServer) {
  FeedBacks.rawCollection().createIndex({ postId: 1, postType: 1 }, { name: 'postId_1_postType_1' });
}

FeedBacks.attachSchema(FeedBacks.schema);

export default FeedBacks;
