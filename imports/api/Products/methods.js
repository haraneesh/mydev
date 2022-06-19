import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import constants from '../../modules/constants';
import getActiveItemsFromZoho from '../ZohoSyncUps/zohoItems';
import handleMethodException from '../../modules/handle-method-exception';
import rateLimit from '../../modules/rate-limit.js';
import { getActiveProductList } from '../ProductLists/commonFunctions';
import Products from './Products';
import ProductDetails from '../ProductDetails/ProductDetails';

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
  }).validator(), */
  validate: Products.schema.omit('createdAt', 'updatedAt').validator(),
  run(product) {
    try {
      Products.insert(product);
    } catch (exception) {
      handleMethodException(exception);
    }
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
    const { unitsForSelection } = product;
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
    ProductDetails.remove({ productId: _id });
  },
});

Meteor.methods({
  'products.getSpecialsToOrder': function getSpecialsToOrder() {
    try {
      if (Meteor.isServer) {
        const activeProductList = getActiveProductList().fetch();
        if (activeProductList[0]) {
          const allProducts = activeProductList[0].products;
          let countOfSpecialProducts = 0;
          const specialProductsMap = allProducts.reduce((specialProductObj, product) => {
            const obj = specialProductObj;
            if (product.displayAsSpecial && product.availableToOrder) {
              obj[product._id] = product;
              countOfSpecialProducts += 1;
            }
            return obj;
          }, {});

          if (countOfSpecialProducts > 0) {
            return {
              productListId: activeProductList[0]._id,
              specialProductsMap,
            };
          }
        }
        return { productListId: 'none' }; // no active product list
      }
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'products.getItemsFromZoho': function getItemsFromZoho() {
    try {
      return getActiveItemsFromZoho();
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'products.bulkUpdatePrices': async function bulkUpdateProductPrices(productPricesArray) {
    try {
      check(productPricesArray,
        [{
          _id: String,
          name: String,
          unitprice: String,
          wSaleBaseUnitPrice: String,
        }]);
    } catch (exception) {
      handleMethodException(exception);
    }

    if (/* Meteor.isServer && */ Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      try {
        const bulk = Products.rawCollection().initializeOrderedBulkOp();

        productPricesArray.forEach((row) => {
          bulk.find({ _id: row._id }).update({ $set: { unitprice: row.unitprice, wSaleBaseUnitPrice: row.wSaleBaseUnitPrice } });
        });

        const bulkWriteResult = await bulk.execute();
        return bulkWriteResult;
      } catch (exception) {
        handleMethodException(exception);
      }
    }
  },
});

rateLimit({
  methods: [
    insertProduct,
    upsertProduct,
    removeProduct,
    'products.getItemsFromZoho',
    'products.bulkUpdatePrices',
    'products.getReturnables',
    'products.getSpecialsToOrder',
  ],
  limit: 5,
  timeRange: 1000,
});
