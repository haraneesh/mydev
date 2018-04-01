/* eslint-disable consistent-return */

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Suppliers = new Mongo.Collection('Suppliers');

Suppliers.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Suppliers.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Suppliers.schema = new SimpleSchema({
  owner: {
    type: String,
    label: 'The ID of the user this document belongs to.',
  },
  createdAt: {
    type: String,
    label: 'The date this document was created.',
    autoValue() {
      if (this.isInsert) return (new Date()).toISOString();
    },
  },
  updatedAt: {
    type: String,
    label: 'The date this document was last updated.',
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date()).toISOString();
    },
  },
  name: {
    type: String,
    label: 'The name of the supplier.',
  },
  description: {
    type: String,
    label: 'The name of the supplier.',
  },
});

Suppliers.attachSchema(Suppliers.schema);

export default Suppliers;
