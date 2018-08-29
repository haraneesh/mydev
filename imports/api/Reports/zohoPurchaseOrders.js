import { Meteor } from 'meteor/meteor';
import zh from '../ZohoSyncUps//ZohoBooks';
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

const getPOsWithTodaysDeliveryDateFromZoho = () => {
  const nowDate = new Date();
  const successResp = [];
  const errorResp = [];

  let pos = [];

  if (Meteor.isServer) {
    // const r = zh.getRecordsByParams('purchaseorders', {status:"billed"});
    const r = zh.getRecordsByParams('purchaseorders', { delivery_date: getZhDisplayDate(nowDate) });
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
    updateSyncAndReturn('purchaseOrders', successResp, errorResp, nowDate, syncUpConstants.purchaseOrdersFromZoho);
  }
  return pos;
};

const addPOOrderedQty = (pendingProductHash) => {
  const pos = getPOsWithTodaysDeliveryDateFromZoho();
  return pos.reduce((productHash, p) => {
    const po = getPODetailsFromZoho(p);

    if (po.line_items) {
      productHash = po.line_items.reduce((map, item) => {
        if (map[item.item_id]) {
          if (map[item.item_id].poOrderedQuantity) {
            map[item.item_id].poOrderedQuantity = map[item.item_id].poOrderedQuantity + item.quantity;
          } else {
            map[item.item_id].poOrderedQuantity = item.quantity;
          }
        }
        return map;
      }, productHash);
    }
    return productHash;
  }, pendingProductHash);
};

export default addPOOrderedQty;
