import ZohoSyncUps, { syncUpConstants } from '../ZohoSyncUps/ZohoSyncUps';
import Products from '../Products/Products';

Products.update({ maxUnitsAvailableToOrder: { $exists: false } }, { $set: { maxUnitsAvailableToOrder: '0' } }, { multi: true });

const msec = Date.parse('March 01, 2000');
const syncDate = new Date(msec);

const zohoSyncUp = {
  syncDateTime: syncDate,
  errorRecords: [],
  successRecords: [],
};

const s = ZohoSyncUps.findOne({ syncEntity: syncUpConstants.invoicesFromZoho });

if (!s) {
  zohoSyncUp.syncEntity = syncUpConstants.invoicesFromZoho;
  ZohoSyncUps.insert(zohoSyncUp);
}
