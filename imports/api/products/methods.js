import Products from './products'
import { SimpleSchema } from 'meteor/aldeed:simple-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import rateLimit from '../../modules/rate-limit.js'

export const insertProduct = new ValidatedMethod({
  name: 'products.insert',
/*  validate: new SimpleSchema({
    sku: {  type: String },
    name: { type: String },
    unitprice: { type: Number, decimal: true },
    description: { type: String },
    image_path: { type: String },
    type: { type:String },
    vendor_details:{ type: Object },
    "vendor_details.id" : {  type:Number, decimal:true },
    "vendor_details.slug" : { type:String  },
    "vendor_details.name" : { type:String  },
  }).validator(),*/
  validate: Products.schema.validator(),
  run(product) {
    Products.insert(product)
  },
})

export const updateProductName = new ValidatedMethod({
  name: 'products.name.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.name': { type: String, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update })
  },
})

export const updateProductSKU = new ValidatedMethod({
  name: 'products.sku.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.sku': { type: String, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update })
  },
})


export const updateProductUnitPrice = new ValidatedMethod({
  name: 'products.unitprice.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.unitprice': { type: Number, decimal: true, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update })
  },
})

export const updateProductDescription = new ValidatedMethod({
  name: 'products.description.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.description': { type: String, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update })
  },
})

export const updateProductType = new ValidatedMethod({
  name: 'products.type.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.type': { type: String, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update })
  },
})

export const updateProductImagePath = new ValidatedMethod({
  name: 'products.image_path.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.image_path': { type: String, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update })
  },
})

export const upsertProduct = new ValidatedMethod({
  name: 'product.upsert',
  validate: Products.schema.validator(),
  run(product) {
    const id = product._id
    delete product._id
    return Products.upsert({ _id: id }, { $set: product })
  },
})

export const removeProduct = new ValidatedMethod({
  name: 'products.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    Products.remove(_id)
  },
})

rateLimit({
  methods: [
    insertProduct,
    upsertProduct,
    updateProductName,
    updateProductType,
    updateProductUnitPrice,
    updateProductDescription,
    updateProductSKU,
    removeProduct,
  ],
  limit: 5,
  timeRange: 1000,
})