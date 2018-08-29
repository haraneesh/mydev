import { Meteor } from 'meteor/meteor';
import zh from '../ZohoSyncUps//ZohoBooks';
import { syncUpConstants } from '../ZohoSyncUps/ZohoSyncUps';
import { updateSyncAndReturn, retResponse } from '../ZohoSyncUps/zohoCommon';

export const getItemsFromZoho = () => {
  const nowDate = new Date();
  const successResp = [];
  const errorResp = [];

  let items = [];

  if (Meteor.isServer) {
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const r = zh.getRecordsByParams('items', { filter_by: 'Status.Active', page });
      if (r.code === 0 /* Success */) {
        successResp.push(retResponse(r));
        items = items.concat(r.items);
        page++;
        hasMorePages = r.page_context.has_more_page;
      } else {
        const res = {
          code: r.code,
          message: `${r.message}`,
        };
        hasMorePages = false;
        errorResp.push(retResponse(res));
      }
      updateSyncAndReturn('items', successResp, errorResp, nowDate, syncUpConstants.itemsFromZoho);
    }
  }
  return items;
};

const addStockOnHand = (productsHash) => {
  const itemsListFromZoho = getItemsFromZoho();

  return itemsListFromZoho.reduce((map, item) => {
    if (map[item.item_id]) {
      map[item.item_id].stockOnHand = item.stock_on_hand;
    }

    return map;
  }, productsHash);
};

export default addStockOnHand;
