/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random';
import constants from '../../modules/constants';
import { ProductSchemaDefObject } from '../Products/Products';
import InvoiceSchemaDefObj from '../Invoices/Invoices';

export const Orders = new Mongo.Collection('Orders');

Orders.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Orders.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

const productsSchemaDefObject = _.clone(ProductSchemaDefObject);
productsSchemaDefObject.quantity = { type: Number, label: 'The quantity of a particular product that was ordered', min: 0.00001 };

const ProductSchema = new SimpleSchema(productsSchemaDefObject);

Orders.schema = new SimpleSchema({
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
  expectedDeliveryDate: {
    type: Date,
    label: 'Expected Delivery Date of the Order',
    optional: true,
  },
  products: { type: Array },
  'products.$': ProductSchema.omit('createdAt', 'updatedAt'),
  invoices: { type: Array, optional: true },
  'invoices.$': InvoiceSchemaDefObj,
  customer_details: { type: Object },
  'customer_details.role': {
    type: String,
    allowedValues: constants.Roles.allowedValue,
    label: 'Role in which the customer is ordering',
  },
  'customer_details._id': { type: String, label: 'The customer id.' },
  'customer_details.name': { type: String, label: 'The customer name.' },
  'customer_details.email': { type: String, label: 'The customer email address.', optional: true },
  'customer_details.mobilePhone': { type: Number, label: 'The customer name.' },
  'customer_details.deliveryAddress': { type: String, label: 'The customer\'s delivery address.' },
  order_status: { type: String, label: 'Status of the order.' },
  comments: { type: String, label: 'Comments added by the user to this order.', optional: true },
  issuesWithPreviousOrder: { type: String, label: 'Issues with previous order.', optional: true },
  payCashWithThisDelivery: { type: Boolean, label: 'Issues with previous order.', optional: true },
  total_bill_amount: { type: Number, label: 'The total bill amount.', min: 1 },
  // Whenever the "_id" field is updated, automatically store
  productOrderListId: { type: String, label: 'The Id of the product list from which the order was made.' },
  invoice_Id: {
    type: String,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        return `INV-${Random.id()}`;
      } if (this.isUpsert) {
        return { $setOnInsert: `INV-${Random.id()}` };
      }
      this.unset(); // Prevent user from supplying their own value
    },
  },
  basketId: { type: String, optional: true },
  onBehalf: { type: Object, optional: true },
  'onBehalf.postUserId': { type: String },
  'onBehalf.orderReceivedAs': { type: String, allowedValues: constants.OrderReceivedType.allowedValues },
  receivedFeedBack: { type: Boolean, label: 'Received customer feedback on the Order', optional: true },
  zh_sales_type: {
    type: String, label: 'Zoho Sales Type', allowedValues: ['salesorder', 'deliverychallan'], optional: true,
  },
  zh_salesorder_id: { type: String, label: 'Corresponding Zoho Sales Order Id', optional: true },
  zh_salesorder_number: { type: String, label: 'Corresponding Zoho Sales Order Number', optional: true },
  zh_salesorder_status: { type: String, label: 'Corresponding Zoho Sales Order Status', optional: true },
  zh_salesorder_order_status: { type: String, label: 'Corresponding Zoho Sales Order Order_Status', optional: true },
});

if (Meteor.isServer) {
  Orders.rawCollection().createIndex({ order_status: 1, 'customer_details._id': 1 }, { unique: false });
  Orders.rawCollection().createIndex({ 'products.name': 1, 'products.unitOfSale': 1 }, { unique: false });
}

Orders.attachSchema(Orders.schema);
