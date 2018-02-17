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


if (Meteor.isServer) {
  FeedBacks._ensureIndex({ postId: 1, postType: 1 });
}

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
  description: {
    type: String,
    label: 'The body of the feedback.',
    optional: true,
  },
  rating: {
    type: Number,
    label: 'Rating given by the feed back giver.',
  },
  createdAt: {
    type: String,
    label: 'The date this feedback was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
    optional:true,
  },
  updatedAt: {
    type: String,
    label: 'The date this feedback was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
    optional:true,
  },
});

FeedBacks.attachSchema(FeedBacks.schema);

export default FeedBacks;
