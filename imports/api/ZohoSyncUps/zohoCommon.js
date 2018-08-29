import moment from 'moment';
import 'moment-timezone';
import ZohoSyncUps from './ZohoSyncUps';

export const retResponse = r => ({
  code: r.code,
  message: r.message,
  r,
});

export const updateSyncAndReturn =
  (syncCollectionName, successResp, errorResp, syncDate, syncTypeName) => {
    const entityName = syncTypeName || syncCollectionName;
    const syncedForUser = 'All';
    const zohoSyncUp = {
      syncDateTime: syncDate,
      errorRecords: errorResp,
      successRecords: successResp,
      syncEntity: entityName,
      syncedForUser,
    };

    ZohoSyncUps.update({
      $and: [
        { syncedForUser },
        { syncEntity: entityName },
      ],
    }, { $set: zohoSyncUp });
    return { success: successResp, error: errorResp };
  };

export const updateUserSyncAndReturn =
  (syncCollectionName, userId, successResp, errorResp, syncDate, syncTypeName) => {
    const entityName = syncTypeName || syncCollectionName;
    const zohoSyncUp = {
      syncDateTime: syncDate,
      errorRecords: errorResp,
      successRecords: successResp,
      syncEntity: entityName,
      syncedForUser: userId,
    };

    ZohoSyncUps.upsert({
      $and: [
        { syncedForUser: userId },
        { syncEntity: entityName },
      ],
    }, { $set: zohoSyncUp });
    return { success: successResp, error: errorResp };
  };

export const getZhDisplayDate = (dateObject) => {
  // const dateObject = new Date(dateString)
  const zhDateSettings = {
    format: 'YYYY-MM-DD',
    timeZone: 'Asia/Kolkata',
  };
  return moment(dateObject).tz(zhDateSettings.timeZone).format(zhDateSettings.format);
};