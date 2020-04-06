import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

const _callType = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  DELETE: 'DELETE',

};

const getConnectionInfo = (authToken, organizationId) => ({
  authtoken: authToken,
  organization_id: organizationId,
});

const setAPICall = () => {
  return {
    authtoken: Meteor.settings.private.zoho_authtoken,
    organization_id: Meteor.settings.private.zoho_organization_id,
  }
};

const callAPI = (requestType, endpoint, params, connectionInfo) => {
  const args = {};
  const apiBaseUrl = 'https://books.zoho.com/api/v3';
  args.params = (connectionInfo) ? connectionInfo : setAPICall();

  if (params) {
    switch (true) {
      case (requestType === _callType.POST):
        args.params.JSONString = JSON.stringify(params);
        break;
      case (requestType === _callType.PUT):
        args.params.JSONString = JSON.stringify(params);
        break;
      default: // get
        args.params = Object.assign({}, args.params, params);
        break;
    }
  }

  const callUrl = `${apiBaseUrl}/${endpoint}`;
  try {
    const result = HTTP.call(requestType, callUrl, args);
    if (Meteor.isDevelopment) {
      console.log(callUrl);
      console.log('--------------------------------------');
      console.log(result.data);
      console.log('--------------------------------------');
      console.log(args.params);
    }
    return result.data;
  } catch (e) {
    // Got a network error, timeout, or HTTP error in the 400 or 500 range.
    if (Meteor.isDevelopment) {
      console.log('--------------------------------------');
      console.error(e);
      console.log('--------------------------------------');
    }
    const argMsg = (args.params.JSONString) ? args.params.JSONString : ' ';
    if (e.response) {
      // return e.response.data;
      return {
        code: e.response.data.code,
        message: `${e.response.data.message} ${argMsg}`,
      };
    }

    return {
      code: -1,
      message: `${e.code} ${e.errno}  ${argMsg}`,
    };
  }
};

const createRecord = (module, params, connectionInfo) => {
  // check
  const endpoint = module;
  return callAPI(_callType.POST, endpoint, params, connectionInfo);
};

const updateRecord = (module, id, params, connectionInfo) => {
  const endpoint = `${module}/${id}`;
  return callAPI(_callType.PUT, endpoint, params, connectionInfo);
};

const getRecords = (module, page = 1, connectionInfo) => {
  const endpoint = module;
  return callAPI(_callType.GET, endpoint, {}, page, connectionInfo);
};

const getRecordsByParams = (module, params, connectionInfo) => {
  const endpoint = module;
  return callAPI(_callType.GET, endpoint, params, connectionInfo);
};

const getRecordById = (module, id, connectionInfo) => {
  const endpoint = `${module}/${id}`;
  return callAPI(_callType.GET, endpoint, connectionInfo);
};

const deleteRecord = (module, id, connectionInfo) => {
  const endpoint = `${module}/${id}`;
  return callAPI(_callType.DELETE, endpoint, connectionInfo);
};


export default ZohoBooks = {
  createRecord,
  updateRecord,
  getRecords,
  deleteRecord,
  getRecordById,
  getRecordsByParams,
  getConnectionInfo,
};
