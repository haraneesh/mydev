/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Products = new Mongo.Collection('Products');
export default Products;

Products.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Products.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

export const ProductSchemaDefObject = {
  _id: { type: String, label: 'The default _id of the product', optional: true },
  sku: { type: String, label: 'The SKU of the product.' },
  name: { type: String, label: 'The name of the product.' },
  unitOfSale: { type: String, label: 'The unit of sale of the product.' },
  unitprice: { type: Number, label: 'The unit price of the product.' },
  unitsForSelection: { type: String,
    label: 'Units for selection.',
    defaultValue: '0,1,2,3,4,5,6,7,8,9,10',
    optional: true,
  },
  description: { type: String, label: 'The description of the product.', optional: true },
  image_path: { type: String, label: 'The image path of the product.' },
  type: { type: String, label: 'The type of the product.' },
  category: { type: String, label: 'The category of the product.', optional: true },
  availableToOrder: { type: Boolean, label: 'Is product availableToOrder?', optional: true },
  maxUnitsAvailableToOrder: { type: Number, min: 0, defaultValue: 0, label: 'Max Units Available to order', optional: true },
  displayAsSpecial: { type: Boolean, label: 'Is this a special product?', optional: true },
  vendor_details: { type: Object },
  'vendor_details.id': { type: Number, label: 'The vendor details of the product.' },
  'vendor_details.slug': { type: String, label: 'The vendor slug of the product.' },
  'vendor_details.name': { type: String, label: 'The vendor name of the product.' },
  // Force value to be current date (on server) upon update
  // and don't allow it to be set upon insert.
  createdAt: {
    type: Date,
    label: 'The date this product was created.',
    optional: true,
    autoValue() {
      if (this.isInsert) return (new Date());
    },
  },
  updatedAt: {
    type: Date,
    label: 'The date this product was last updated.',
    optional: true,
    autoValue() {
      if (this.isInsert || this.isUpdate) return (new Date());
    },
  },
  zh_item_id: { type: String, label: 'Then item_id of the corresponding item saved in Zoho', optional: true },
};

Products.schema = new SimpleSchema(ProductSchemaDefObject, {
  clean: {
    autoConvert: true,
  },
});

if (Meteor.isServer) {
  Products._ensureIndex({ availableToOrder: 1 });
}

Products.attachSchema(Products.schema);

