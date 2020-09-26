/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import constants from '../../modules/constants';
import { ProductSchemaDefObject } from '../Products/Products';

const SupplierOrders = new Mongo.Collection('SupplierOrders');

SupplierOrders.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

SupplierOrders.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

const productsSchemaDefObject = { ...ProductSchemaDefObject };
productsSchemaDefObject.quantity = { type: Number, label: 'The quantity of a particular product that was ordered', min: 0.00001 };

const ProductSchema = new SimpleSchema(productsSchemaDefObject);

SupplierOrders.schema = new SimpleSchema({
  supplierId: {
    type: String,
    label: 'Supplier id',
  },
  sourceOrderId: {
    type: String,
    label: 'Source order id',
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
  products: { type: Array },
  'products.$': ProductSchema.omit('createdAt', 'updatedAt'),
  customer_details: { type: Object },
  'customer_details.role': {
    type: String,
    allowedValues: constants.Roles.allowedValue,
    label: 'Role in which the customer is ordering',
  },
  'customer_details._id': { type: String, label: 'The customer id.' },
  'customer_details.name': { type: String, label: 'The customer name.' },
  'customer_details.email': { type: String, label: 'The customer email address.' },
  'customer_details.mobilePhone': { type: Number, label: 'The customer name.' },
  'customer_details.deliveryAddress': { type: String, label: 'The customer\'s delivery address.' },
  order_status: { type: String, label: 'Status of the order.' },
  productOrderListId: { type: String, label: 'The Id of the product list from which the order was made.' },

});

if (Meteor.isServer) {
  SupplierOrders.rawCollection().createIndex({ supplierId: 1 }, { unique: false });
  SupplierOrders.rawCollection().createIndex({ order_status: 1, 'customer_details._id': 1 }, { unique: false });
  SupplierOrders.rawCollection().createIndex({ 'products.name': 1, 'products.unitOfSale': 1 }, { unique: false });
}

SupplierOrders.attachSchema(SupplierOrders.schema);

export default SupplierOrders;
