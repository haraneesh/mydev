/* eslint-disable consistent-return */
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import { ProductSchemaDefObject } from '../Products/Products';

const ProductLists = new Mongo.Collection('ProductLists');
export default ProductLists;

ProductLists.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

ProductLists.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});


const productsSchemaDefObject = _.clone(ProductSchemaDefObject);
productsSchemaDefObject.totQuantityOrdered = { type: Number,
  label: 'The total quantity of this product that was ordered',
};

const ProductSchema = new SimpleSchema(productsSchemaDefObject);

ProductLists.schema = new SimpleSchema({
  _id: { type: String, label: 'The default _id of the Product List', optional: true },
  activeStartDateTime: { type: Date, label: 'DateTime from which Product List is available to order' },
  activeEndDateTime: { type: Date, label: 'DateTime up to which Product List is available to order' },
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
      if (this.isInsert || this.isUpdate || this.isUpsert) {
        return new Date();
      }
    },
    optional: true,
  },
  products: { type: Array },
  'products.$': ProductSchema.omit('createdAt', 'updatedAt'),
  // products: { type: [ProductSchema] },
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
  // order_ids: { type: [String], optional: true },
  order_ids: { type: Array, optional: true },
  'order_ids.$': { type: String },
});

if (Meteor.isServer) {
  ProductLists._ensureIndex({ activeStartDateTime: 1, activeEndDateTime: 1 });
}

ProductLists.attachSchema(ProductLists.schema);
