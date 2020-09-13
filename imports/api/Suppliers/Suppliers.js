/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
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

export const SupplierSchemaDefObject = {
  _id: { type: String, label: 'The default _id of the supplier', optional: true },
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
      if (this.isInsert || this.isUpdate || this.isUpsert) return (new Date()).toISOString();
    },
  },
  userId: {
    type: String,
    label: 'Linked User Id',
  },
  name: {
    type: String,
    label: 'The name of the supplier.',
  },
  description: {
    type: String,
    label: 'The name of the supplier.',
  },
  marginPercentage: {
    type: Number,
    label: 'Supplier Margin Percentage.',
  },
  zohoAuthtoken: {
    type: String,
    label: 'Zoho Auth Token for the supplier',
  },
  zohoOrganizationId: {
    type: String,
    label: 'Zoho Organization Id for the supplier.',
  },
  user: { type: Object },
  'user.username': { type: String },
  'user.email': { type: String },
  'user.profile': { type: Object },
  'user.profile.salutation': { type: String },
  'user.profile.name': { type: Object },
  'user.profile.name.last': { type: String },
  'user.profile.name.first': { type: String },
  'user.profile.whMobilePhone': { type: String },
  'user.profile.deliveryAddress': { type: String },
};

Suppliers.schema = new SimpleSchema(SupplierSchemaDefObject, {
  clean: {
    autoConvert: true,
  },
});

if (Meteor.isServer) {
  Suppliers.rawCollection().createIndex({ name: 1 }, { unique: true });
}

Suppliers.attachSchema(Suppliers.schema);

export default Suppliers;
