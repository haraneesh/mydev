import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import ZohoAuthenticate from './ZohoAuthentication';

const _callType = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  DELETE: 'DELETE',

};

const setAPICall = () => ({
  organization_id: Meteor.settings.private.zoho_organization_id,
});

const callAPI = (
  requestType,
  endpoint,
  params,
  connectionInfo,
  getParamsWithPost,
) => {
  const args = {};
  const accessToken = ZohoAuthenticate.getToken();

  const apiBaseUrl = Meteor.settings.private.zoho.baseApiUrl; // 'https://books.zoho.com/api/v3';
  args.params = (connectionInfo) || setAPICall();

  args.headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: `Zoho-oauthtoken ${accessToken}`,
  };

  if (params) {
    switch (true) {
      case (requestType === _callType.POST):
        args.params = Object.assign(
          args.params,
          { JSONString: JSON.stringify(params) },
          getParamsWithPost,
        );
        break;
      case (requestType === _callType.PUT):
        args.params.JSONString = JSON.stringify(params);
        break;
      default:
        args.params = { ...args.params, ...params };
        break;
    }
  }

  const callUrl = `${apiBaseUrl}/${endpoint}`;
  if (Meteor.isDevelopment) {
    console.log('---------------Call Url-----------------------');
    console.log(`Access Token ${JSON.stringify(accessToken)}`);
    console.log(callUrl);
    console.log('---------------Args-----------------------');
    console.log(args);
  }

  try {
    const result = HTTP.call(requestType, callUrl, args);
    if (Meteor.isDevelopment) {
      console.log('---------------Data-----------------------');
      console.log(result.data);
      console.log('---------------Content-----------------------');
      console.log(result.content);
    }
    return result.data || result.content;
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

const getRecordByIdAndParams = ({
  module, id, submodule, params, connectionInfo,
}) => {
  const endpoint = (submodule) ? `${module}/${id}/${submodule}` : `${module}/${id}`;
  return callAPI(_callType.GET, endpoint, params, connectionInfo);
};

const postRecordByIdAndParams = ({
  module, id, submodule, params, connectionInfo, getParamsWithPost,
}) => {
  const endpoint = (submodule) ? `${module}/${id}/${submodule}` : `${module}/${id}`;
  return callAPI(_callType.POST, endpoint, params, connectionInfo, getParamsWithPost);
};

const deleteRecord = (module, id, connectionInfo) => {
  const endpoint = `${module}/${id}`;
  return callAPI(_callType.DELETE, endpoint, connectionInfo);
};

export default {
  createRecord,
  updateRecord,
  getRecords,
  deleteRecord,
  postRecordByIdAndParams,
  getRecordByIdAndParams,
  getRecordById,
  getRecordsByParams,
};
