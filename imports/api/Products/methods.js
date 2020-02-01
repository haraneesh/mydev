import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import getActiveItemsFromZoho from '../ZohoSyncUps/zohoItems';
import handleMethodException from '../../modules/handle-method-exception';
import rateLimit from '../../modules/rate-limit.js';
import Products from './Products';

export const insertProduct = new ValidatedMethod({
  name: 'products.insert',
  /* validate: new SimpleSchema({
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
  validate: Products.schema.omit('createdAt', 'updatedAt').validator(),
  run(product) {
    Products.insert(product);
  },
});

export const updateProductName = new ValidatedMethod({
  name: 'products.name.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.name': { type: String, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update });
  },
});

export const updateProductSKU = new ValidatedMethod({
  name: 'products.sku.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.sku': { type: String, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update });
  },
});


export const updateProductUnitPrice = new ValidatedMethod({
  name: 'products.unitprice.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.unitprice': { type: Number, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update });
  },
});

export const updateProductwSaleBaseUnitPrice = new ValidatedMethod({
  name: 'products.wSaleBaseUnitPrice.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.wSaleBaseUnitPrice': { type: Number, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update });
  },
});

export const updateUnitForSelection = new ValidatedMethod({
  name: 'products.unitsForSelection.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.unitsForSelection': { type: String, optional: true },
  }).validator(),
  run({ _id, update }) {
    if (Meteor.isServer) {
      if (update.unitsForSelection.split(',').every(_IsNumber)) {
        Products.update(_id, { $set: update });
      }
    }
  },
});

export const updateProductDescription = new ValidatedMethod({
  name: 'products.description.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.description': { type: String, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update });
  },
});

export const updateProductType = new ValidatedMethod({
  name: 'products.type.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.type': { type: String, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update });
  },
});

export const updateProductImagePath = new ValidatedMethod({
  name: 'products.image_path.update',
  validate: new SimpleSchema({
    _id: { type: String },
    'update.image_path': { type: String, optional: true },
  }).validator(),
  run({ _id, update }) {
    Products.update(_id, { $set: update });
  },
});

function isNumber(value) {
  return !isNaN(value);
}

export const upsertProduct = new ValidatedMethod({
  name: 'product.upsert',
  validate: Products.schema.validator(),
  run(prod) {
    const product = prod;
    const id = product._id;
    delete product._id;
    const unitsForSelection = product.unitsForSelection;
    product.unitsForSelection = (unitsForSelection) ? unitsForSelection.replace(/\s+/g, '') : '0,1,2,3,4,5,6,7,8,9,10';
    if (Meteor.isServer) {
      if ((product.unitsForSelection.split(',').every(isNumber))) {
        return Products.upsert({ _id: id }, { $set: product });
      }
      throw new Meteor.Error(403, 'Units for Selection should be numbers');
    }
  },
});

export const removeProduct = new ValidatedMethod({
  name: 'products.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    Products.remove(_id);
  },
});

Meteor.methods({
  'products.getItemsFromZoho': function getItemsFromZoho() {
    try {
      return getActiveItemsFromZoho();
    } catch (exception) {
      handleMethodException(exception);
    }
  }
});

rateLimit({
  methods: [
    insertProduct,
    upsertProduct,
    updateProductName,
    updateProductType,
    updateProductUnitPrice,
    updateProductwSaleBaseUnitPrice,
    updateProductDescription,
    updateProductSKU,
    removeProduct,
    'products.getItemsFromZoho',
  ],
  limit: 5,
  timeRange: 1000,
});
