import { Roles } from 'meteor/alanning:roles';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import constants from '../../modules/constants';
import rateLimit from '../../modules/rate-limit';
import Products from '../Products/Products';
import zh from './ZohoBooks';
import ZohoSyncUps, { syncUpConstants } from './ZohoSyncUps';
import { retResponse, updateSyncAndReturn } from './zohoCommon';

// zoho refers to them as items
const _createZohoItem = (product) => ({
  // group_id: _getZohoGroupId(product.type),
  name: product.name, // mandatory
  description: product.description || '',
  rate: product.unitprice,
  // reorder_level: 5,
  sku: product.sku,
  // group_name: product.type,
  unit: product.unitOfSale,
  product_type: 'goods',
  item_type: 'inventory',
});

const getItemIntratax = (item_tax_preferences) =>
  item_tax_preferences &&
  item_tax_preferences[0] &&
  item_tax_preferences[0].tax_percentage
    ? item_tax_preferences[0].tax_percentage
    : 0;

const syncProductWithZoho = async (prd, successResp, errorResp) => {
  const product = prd;
  const zhItem = _createZohoItem(product);

  // Zoho api update is updating tax details to default on product update //
  if (product.zh_item_id) {
    const r = await zh.getRecordById('items', product.zh_item_id);
    if (r.code === 0 /* success */) {
      const getItem = r.item;
      zhItem.item_tax_preferences = getItem.item_tax_preferences;
    }
  }

  const r = product.zh_item_id
    ? await zh.updateRecord('items', product.zh_item_id, zhItem)
    : await zh.createRecord('items', zhItem);
  if (r.code === 0 /* Success */) {
    product.zh_item_id = r.item.item_id;
    product.zh_intra_tax_percentage = getItemIntratax(
      r.item.item_tax_preferences,
    );
    await Products.updateAsync({ _id: product._id }, { $set: product });
    successResp.push(retResponse(r));
  } else {
    const res = {
      code: r.code,
      message: `${r.message}: product Id = ${product._id}`,
    };
    errorResp.push(retResponse(res));
  }
};

export const bulkSyncProductsZoho = new ValidatedMethod({
  name: 'products.bulkSyncProductsZoho',
  validate() {},
  async run() {
    const isAdmin = await Roles.userIsInRoleAsync(
      this.userId,
      constants.Roles.admin.name,
    );
    if (!isAdmin) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(401, 'Access denied');
    }
    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const syncDTRec = await ZohoSyncUps.findOneAsync({
        syncEntity: syncUpConstants.products,
      });

      const syncDT = syncDTRec.syncDateTime;
      const query = {
        $or: [
          { zh_item_id: { $exists: false } },
          { updatedAt: { $gte: syncDT } },
        ],
      };

      const products = await Products.find(query).fetchAsync(); // change to get products updated after sync date

      for (const prd of products) {
        await syncProductWithZoho(prd, successResp, errorResp);
      }
    }
    const nowDate = new Date();
    return await updateSyncAndReturn(
      syncUpConstants.products,
      successResp,
      errorResp,
      nowDate,
    );
  },
});

rateLimit({
  methods: [bulkSyncProductsZoho],
  limit: 5,
  timeRange: 1000,
});
