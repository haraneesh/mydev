/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Random } from 'meteor/random';
import { ProductSchemaDefObject } from '../Products/Products';
import { InvoiceSchemaDefObj } from '../Invoices/Invoices';

const Orders = new Mongo.Collection('Orders');
export default Orders;

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
productsSchemaDefObject.quantity = { type: Number, label: 'The quantity of a particular product that was ordered', defaultValue: 0 };

const ProductSchema = new SimpleSchema(productsSchemaDefObject);

Orders.schema = new SimpleSchema({
  createdAt: { type: Date,
    autoValue() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return { $setOnInsert: new Date() };
      }
      this.unset();  // Prevent user from supplying their own value
    },
    optional: true,
  },
  // Force value to be current date (on server) upon update
  // and don't allow it to be set upon insert.
  updatedAt: {
    type: Date,
    autoValue() {
      if (this.isUpdate || this.isInsert) {
        return new Date();
      }
    },
    optional: true,
  },
  products: { type: Array },
  'products.$': ProductSchema.omit('createdAt', 'updatedAt'),
    /*  "product_details._id": { type: String, label: 'The product id'},
      "product_details.sku": {  type: String, label: 'The SKU of the product.', },
      "product_details.name": { type: String, label: 'The name of the product.', },
      "product_details.unitOfSale": { type: String, label: 'The unit of sale of the product.' },
      "product_details.unitprice": { type: Number, decimal: true, label: 'The unit price of the product.', },
      "product_details.description": { type: String, label: 'The description of the product.', optional:true},
      "product_details.image_path": { type: String, label: 'The image path of the product.', },
      "product_details.type": { type:String, label: 'The type of the product.', },
      "product_details.availableToOrder": {type:Boolean, label: 'Is product availableToOrder?', optional:true },
      "product_details.vendor_details":{ type: Object},
      "product_details.vendor_details.id" : {  type:Number, decimal:true, label: 'The vendor details of the product.',  },
      "product_details.vendor_details.slug" : { type:String, label: 'The vendor slug of the product.',   },
      "product_details.vendor_details.name" : { type:String, label: 'The vendor name of the product.',   },*/
  invoices: { type:Array, optional:true },
  'invoices.$': InvoiceSchemaDefObj,
  customer_details: { type: Object },
  'customer_details._id': { type: String, label: 'The customer id.', optional: true },
  'customer_details.name': { type: String, label: 'The customer name.' },
  'customer_details.email': { type: String, label: 'The customer email address.' },
  'customer_details.mobilePhone': { type: Number, label: 'The customer name.' },
  'customer_details.deliveryAddress': { type: String, label: 'The customer\'s delivery address.' },
  order_status: { type: String, label: 'Status of the order.' },
  comments: { type: String, label: 'Comments added by the user to this order.', optional: true },
  total_bill_amount: { type: Number, label: 'The total bill amount.', min: 1 },
  // Whenever the "_id" field is updated, automatically store
  productOrderListId: { type: String, label: 'The Id of the product list from which the order was made.' },
  invoice_Id: {
    type: String,
    optional: true,
    autoValue() {
      if (this.isInsert) {
        return `INV-${Random.id()}`;
      } else if (this.isUpsert) {
        return { $setOnInsert: `INV-${Random.id()}` };
      }
      this.unset();  // Prevent user from supplying their own value
    },
  },
  zh_salesorder_id: { type: String, label: 'Corresponding Zoho Sales Order Id', optional: true },
  zh_salesorder_number: { type: String, label: 'Corresponding Zoho Sales Order Number', optional: true },
  zh_salesorder_status: { type: String, label: 'Corresponding Zoho Sales Order Status', optional: true },
  zh_salesorder_order_status: { type: String, label: 'Corresponding Zoho Sales Order Order_Status', optional: true },
});

if (Meteor.isServer) {
  Orders._ensureIndex({ order_status: 1, 'customer_details._id': 1 });
  Orders._ensureIndex({ 'products.name': 1, 'products.unitOfSale': 1 });
}

Orders.attachSchema(Orders.schema);
