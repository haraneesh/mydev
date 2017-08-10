import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import rateLimit from '../../modules/rate-limit';
import Products from '../Products/Products';
import constants from '../../modules/constants';
import zh from './ZohoInventory';
import ZohoSyncUps, { syncUpConstants } from './ZohoSyncUps';
import { updateSyncAndReturn, retResponse } from './zohoCommon';

// zoho refers to them as items
const _createZohoItem = product => ({
  // group_id: _getZohoGroupId(product.type),
  group_name: product.type,
  unit: product.unitOfSale,
  item_type: 'inventory',
  product_type: 'goods',
  description: product.description || '',
  name: product.name, // mandatory
  rate: product.unitprice,
  // reorder_level: 5,
  sku: product.sku
});

const syncProductWithZoho = (prd, successResp, errorResp) => {
  const product = prd;
  const zhItem = _createZohoItem(product);
  const r = (product.zh_item_id) ?
          zh.updateRecord('items', product.zh_item_id, zhItem) :
          zh.createRecord('items', zhItem);
  if (r.code === 0 /* Success */) {
    product.zh_item_id = r.item.item_id;
    Products.update({ _id: product._id }, { $set: product });
    successResp.push(retResponse(r));
  } else {
    errorResp.push(retResponse(r));
  }
};

export const bulkSyncProductsZoho = new ValidatedMethod({
  name: 'products.bulkSyncProductsZoho',
  validate() {},
  run() {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(401, 'Access denied');
    }
    const nowDate = new Date();
    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const syncDT = ZohoSyncUps.findOne({ syncEntity: syncUpConstants.products }).syncDateTime;
      const query = { $or: [
               { zh_item_id: { $exists: false } },
               { updatedAt: { $gte: syncDT } },
      ] };

      const products = Products.find(query).fetch(); // change to get products updated after sync date
      products.forEach((prd) => {
        syncProductWithZoho(prd, successResp, errorResp);
      });
    }
    return updateSyncAndReturn(syncUpConstants.products, successResp, errorResp, nowDate);
  },
});

rateLimit({
  methods: [bulkSyncProductsZoho],
  limit: 5,
  timeRange: 1000,
});

