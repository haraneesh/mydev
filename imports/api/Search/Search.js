/* eslint-disable consistent-return */
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Search = new Mongo.Collection('Search');
export default Search;

Search.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Search.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Search.schema = new SimpleSchema({
  searchString: {
    type: String,
    label: 'The search string',
  },
  userId: {
    type: String,
    label: 'The user id',
    optional: true,
  },
  count: {
    type: Number,
    label: 'Number of Times Searched',
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

Search.attachSchema(Search.schema);
