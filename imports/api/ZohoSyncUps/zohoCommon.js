import ZohoSyncUps from './ZohoSyncUps';

export const retResponse = r => ({
  code: r.code,
  message: r.message,
  r,
});

export const updateSyncAndReturn = (syncCollectionName, successResp, errorResp, syncDate, syncTypeName) => {
  const entityName = syncTypeName || syncCollectionName;
  const zohoSyncUp = {
    syncDateTime: syncDate,
    errorRecords: errorResp,
    successRecords: successResp,
    syncEntity: entityName,
  };

  ZohoSyncUps.update({ syncEntity: entityName }, { $set: zohoSyncUp });
  return { success: successResp, error: errorResp };
};