/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const UserAndPosts = new Mongo.Collection('UserAndPosts');
export default UserAndPosts;

UserAndPosts.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

UserAndPosts.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

UserAndPosts.schema = new SimpleSchema({
  postType: {
    type: String,
    label: 'The type of post to which this View is attached to.',
  },
  postId: {
    type: String,
    label: 'The ID of the post to which this View is attached.',
  },
  owner: {
    type: String,
    label: 'The person who viewed the post.',
  },
  isBookmarked: {
    type: Boolean,
    label: 'Has the user bookmarked this',
  },
  bookmarkDate: {
    type: Date,
    label: 'The on which the user bookmarked this post',
    autoValue() {
      const content = this.field('isBookmarked');
      if (content.isSet && content) {
        return new Date();
      }
      this.unset();
    },
    optional: true,
  },
  userViewCount: {
    type: Number,
    label: 'How many times has this user seen this post',
    optional: true,
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } if (this.isUpsert) {
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
  UserAndPosts.rawCollection().createIndex({ postId: 1, owner: 1 }, { name: 'postId_1_owner_1' });
}

UserAndPosts.attachSchema(UserAndPosts.schema);
