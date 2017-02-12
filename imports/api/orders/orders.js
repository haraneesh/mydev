import faker from 'faker'
import { Mongo } from 'meteor/mongo'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { Factory } from 'meteor/dburles:factory'
import { ProductSchemaDefObject } from '../../api/products/products'
import { Random } from 'meteor/random'

const Orders = new Mongo.Collection('Orders')
export default Orders;

Orders.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
})

Orders.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
})

let productsSchemaDefObject = _.clone(ProductSchemaDefObject)
productsSchemaDefObject.quantity = {type: Number, label:'The quantity of a particular product that was ordered', defaultValue: 0}

const ProductSchema = new SimpleSchema(productsSchemaDefObject)

Orders.schema = new SimpleSchema({
  _id:{ type: String, label: 'The default _id of the order', optional:true},
  createdAt: { type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    },
    optional: true
  },
  // Force value to be current date (on server) upon update
  // and don't allow it to be set upon insert.
  updatedAt: {
    type: Date,
    autoValue: function() {
      if (this.isUpdate) {
        return new Date();
      }
    },
    denyInsert:true,
    optional: true
  },
  products:{ type: [ProductSchema] },
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
  customer_details:{ type:Object },
        "customer_details._id":  { type: String, label: 'The customer id.', optional: true},
        "customer_details.name": { type: String, label: 'The customer name.'},
        "customer_details.email": { type: String, label: 'The customer email address.'},
        "customer_details.mobilePhone": { type: Number, label: 'The customer name.'},
        "customer_details.deliveryAddress": { type: String, label: 'The customer\'s delivery address.'},
  order_status: { type: String, label: 'Status of the order.' },
  comments: { type: String, label: 'Comments added by the user to this order.', optional: true },
  total_bill_amount: { type:Number, label: 'The total bill amount.', min: 1 },
  // Whenever the "_id" field is updated, automatically store
  productOrderListId: { type: String, label: 'The Id of the product list from which the order was made.'},
  invoice_Id: {
    type: String,
    optional: true,
    autoValue: function() {
      if (this.isInsert) {
        return 'INV-' + Random.id()
      } else if (this.isUpsert) {
        return { $setOnInsert: 'INV-' + Random.id() }
      } else {
        this.unset()  // Prevent user from supplying their own value
      }
   }
 }
})

Orders.attachSchema(Orders.schema)

Factory.define('order', Orders, {
  title: () => faker.hacker.phrase(),
})
