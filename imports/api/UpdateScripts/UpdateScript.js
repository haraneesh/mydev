import ZohoSyncUps, { syncUpConstants } from '../ZohoSyncUps/ZohoSyncUps';

const msec = Date.parse('March 01, 2000');
const syncDate = new Date(msec);

const s = ZohoSyncUps.findOne({});
if (!s) {
  const zohoSyncUp = {
    syncDateTime: syncDate,
    errorRecords: [],
    successRecords: [],
  };

  zohoSyncUp.syncEntity = syncUpConstants.products;
  ZohoSyncUps.insert(zohoSyncUp);
  zohoSyncUp.syncEntity = syncUpConstants.users;
  ZohoSyncUps.insert(zohoSyncUp);
  zohoSyncUp.syncEntity = syncUpConstants.ordersToZoho;
  ZohoSyncUps.insert(zohoSyncUp);
  zohoSyncUp.syncEntity = syncUpConstants.ordersFromZoho;
  ZohoSyncUps.insert(zohoSyncUp);
}
