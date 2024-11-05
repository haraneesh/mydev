import { Meteor } from 'meteor/meteor';
import zh from '../ZohoSyncUps/ZohoBooks';
import { syncUpConstants } from '../ZohoSyncUps/ZohoSyncUps';
import { updateSyncAndReturn, retResponse, getZhDisplayDate } from '../ZohoSyncUps/zohoCommon';

const getPODetailsFromZoho = async (p) => {
  let po = {};
  if (Meteor.isServer) {
    const r = await zh.getRecordById('purchaseorders', p.purchaseorder_id);
    if (r.code === 0 /* Success */) {
      po = r.purchaseorder;
    }
  }
  return po;
};

const getOpenPOsFromZoho = async () => {
  const successResp = [];
  const errorResp = [];

  let pos = [];

  if (Meteor.isServer) {
    // const r = zh.getRecordsByParams('purchaseorders', {status:"billed", delivery_date: getZhDisplayDate(nowDate), });
    const r = await zh.getRecordsByParams('purchaseorders', { filter_by: 'Status.Open' });
    if (r.code === 0 /* Success */) {
      successResp.push(retResponse(r));
      pos = r.purchaseorders;
    } else {
      const res = {
        code: r.code,
        message: `${r.message}`,
      };
      errorResp.push(retResponse(res));
    }
    await updateSyncAndReturn('purchaseOrders', successResp, errorResp, new Date(), syncUpConstants.purchaseOrdersFromZoho);
  }
  return pos;
};

const addPOQuantities = (objToAdd, itemId, updateByCount, propertyToUpdate) => {
  if (objToAdd[itemId].hasOwnProperty(propertyToUpdate)) {
    objToAdd[itemId][propertyToUpdate] = objToAdd[itemId][propertyToUpdate] + updateByCount;
  } else {
    objToAdd[itemId][propertyToUpdate] = updateByCount;
  }
  return objToAdd;
};

const addPOOrderedQty = async (pendingProductHash) => {
  const pos = await getOpenPOsFromZoho();
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  let productHash = pendingProductHash;
  for (let i = 0; i < pos.length; i++) {
    const p = pos[i];
    let propertyToUpdate = 'none';

    switch (p.delivery_date) {
      case getZhDisplayDate(today):
        propertyToUpdate = 'poOrderedQtyForToday';
        break;
      case getZhDisplayDate(tomorrow):
        propertyToUpdate = 'poOrderedQtyForTomorrow';
        break;
      default:
        break;
    }

    if (propertyToUpdate !== 'none') {
      const po = await getPODetailsFromZoho(p);
      if (po.line_items) {
          for (let j = 0; j < po.line_items.length; j++) {
              const item = po.line_items[j];
              if (productHash[item.item_id]) {
                  productHash = addPOQuantities(productHash, item.item_id, item.quantity, propertyToUpdate);
              }
          }
      }
    }
  }
  return productHash;
};

export default addPOOrderedQty;
