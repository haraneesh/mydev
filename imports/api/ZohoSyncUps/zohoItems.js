import { Meteor } from 'meteor/meteor';
import zh from './ZohoBooks';
import { syncUpConstants } from './ZohoSyncUps';
import { updateSyncAndReturn, retResponse } from './zohoCommon';

const getItemsFromZoho = (status) => {
  const nowDate = new Date();
  const successResp = [];
  const errorResp = [];

  let items = [];

  if (Meteor.isServer) {
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      const r = zh.getRecordsByParams('items', { filter_by: status, page });
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

export default function getActiveItemsFromZoho() { return getItemsFromZoho('Status.Active'); }
