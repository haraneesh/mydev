import { Meteor } from 'meteor/meteor';
import zh from '../ZohoSyncUps/ZohoBooks';
import { syncUpConstants } from '../ZohoSyncUps/ZohoSyncUps';
import { updateSyncAndReturn, retResponse, getZhDisplayDate } from '../ZohoSyncUps/zohoCommon';

const getPODetailsFromZoho = (p) => {
  let po = {};
  if (Meteor.isServer) {
    const r = zh.getRecordById('purchaseorders', p.purchaseorder_id);
    if (r.code === 0 /* Success */) {
      po = r.purchaseorder;
    }
  }
  return po;
};

const getOpenPOsFromZoho = () => {
  const successResp = [];
  const errorResp = [];

  let pos = [];

  if (Meteor.isServer) {
    // const r = zh.getRecordsByParams('purchaseorders', {status:"billed", delivery_date: getZhDisplayDate(nowDate), });
    const r = zh.getRecordsByParams('purchaseorders', { filter_by: 'Status.Open' });
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
    updateSyncAndReturn('purchaseOrders', successResp, errorResp, new Date(), syncUpConstants.purchaseOrdersFromZoho);
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

const addPOOrderedQty = (pendingProductHash) => {
  const pos = getOpenPOsFromZoho();
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  return pos.reduce((productHash, p) => {
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
      const po = getPODetailsFromZoho(p);
      if (po.line_items) {
        productHash = po.line_items.reduce((map, item) => {
          if (map[item.item_id]) {
            map = addPOQuantities(map, item.item_id, item.quantity, propertyToUpdate);
            /* if (map[item.item_id].poOrderedQuantity) {
            map[item.item_id].poOrderedQuantity = map[item.item_id].poOrderedQuantity + item.quantity;
          } else {
            map[item.item_id].poOrderedQuantity = item.quantity;
          } */
          }
          return map;
        }, productHash);
      }
    }
    return productHash;
  }, pendingProductHash);
};

export default addPOOrderedQty;
