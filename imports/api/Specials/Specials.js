/* eslint-disable consistent-return */
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Specials = new Mongo.Collection('Specials');
export default Specials;

Specials.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Specials.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Specials.schema = new SimpleSchema({
  title: {
    type: String,
    label: 'The title of the special announcement.',
  },
  description: {
    type: Object,
    label: 'The recipe goes here.',
    blackbox: true,
    optional: true,
  },
  imageUrl: {
    type: String,
    label: 'The url of the image of the special announcement',
    optional: true,
  },
  displayOrder: {
    type: Number,
    label: 'The url of the image in the special announcement',
    optional: true,
    min: 0,
  },
  colorTheme: {
    type: String,
    label: 'The color theme for the special announcement',
    optional: true,
  },
  createdAt: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset(); // Prevent user from supplying their own value
    },
    optional: true,
  },
  viewCount: {
    type: Date,
    autoValue() {
      if (this.isInsert) {
        return 0;
      }
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
  publishStatus: {
    type: String,
    label: 'Publish Status',
  },
});

Specials.attachSchema(Specials.schema);

