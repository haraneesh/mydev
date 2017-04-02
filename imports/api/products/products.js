import faker from 'faker'
import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Factory } from 'meteor/dburles:factory'

const Products = new Mongo.Collection('Products')
export default Products;

Products.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
})

Products.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
})

export let ProductSchemaDefObject = {
  _id:{ type: String, label: 'The default _id of the product', optional: true },
  sku: {  type: String, label: 'The SKU of the product.', },
  name: { type: String, label: 'The name of the product.', },
  unitOfSale: { type: String, label: 'The unit of sale of the product.' },
  unitprice: { type: Number, decimal: true, label: 'The unit price of the product.', },
  description: { type: String, label: 'The description of the product.', optional:true},
  image_path: { type: String, label: 'The image path of the product.', },
  type: { type:String, label: 'The type of the product.', },
  category: { type:String, label: 'The category of the product.', optional:true },
  availableToOrder: {type:Boolean, label: 'Is product availableToOrder?', optional:true },
  vendor_details:{ type: Object},
  "vendor_details.id" : {  type:Number, decimal:true, label: 'The vendor details of the product.',  },
  "vendor_details.slug" : { type:String, label: 'The vendor slug of the product.',   },
  "vendor_details.name" : { type:String, label: 'The vendor name of the product.',   },
}

Products.schema = new SimpleSchema(ProductSchemaDefObject)

Products.attachSchema(Products.schema)

Factory.define('product', Products, {
  title: () => faker.hacker.phrase(),
})
