//import { HTTP } from 'meteor/http';
import { fetch } from 'meteor/fetch';
import { Meteor } from 'meteor/meteor';
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

const callAPI = async (
  requestType,
  endpoint,
  params,
  connectionInfo,
  getParamsWithPost,
) => {
  const args = {};
  const accessToken = await ZohoAuthenticate.getToken();

  if (accessToken == ''){
    //unable to fetch access token
    const errMsg = 'Unable to obtain access token';
    if (Meteor.isDevelopment) {
      console.log('---------------Error Text---------------------');
      console.log(errMsg);
    }
    return {
      code: -1,
      message: errMsg,
    };
  }

  const apiBaseUrl = Meteor.settings.private.zoho.baseApiUrl; // 'https://books.zoho.com/api/v3';
  let urlParams = connectionInfo || setAPICall();

  args.headers = {
    'Content-Type': 'application/json',
    Authorization: `Zoho-oauthtoken ${accessToken}`,
  };

  let callUrl = `${apiBaseUrl}/${endpoint}`;

  if (requestType === _callType.POST || requestType === _callType.PUT) {
    args.body = JSON.stringify(params);
  }

  if (getParamsWithPost) {
    urlParams = Object.assign(urlParams, getParamsWithPost);
  }

  if (requestType === _callType.GET && params) {
    urlParams = Object.assign(urlParams, params);
  }

  callUrl = `${callUrl}?${new URLSearchParams(urlParams)}`;

  if (Meteor.isDevelopment) {
    console.log('---------------Call Url-----------------------');
    console.log(`Access Token ${JSON.stringify(accessToken)}`);
    console.log(callUrl);
    console.log('---------------Args-----------------------');
    console.log(args);
    console.log('---Request Type-----------------------');
    console.log(requestType);
  }

  try {
    const response = await fetch(callUrl, {
      method: requestType, // *GET, POST, PUT, DELETE, etc.
      headers: args.headers,
      body: requestType !== _callType.GET ? args.body : null, // body data type must match "Content-Type" header
    });

    const textResponse = await response.text();
    const data = JSON.parse(textResponse);

    if (Meteor.isDevelopment) {
      console.log('---------------Response Text---------------------');
      console.log(data);
    }

    return data;
  } catch (err) {
    if (Meteor.isDevelopment) {
      console.log('---------------Error Text---------------------');
      console.log(err);
    }
    return {
      code: -1,
      message: err,
    };
  }
};

const createRecord = async (module, params, connectionInfo) => {
  // check
  const endpoint = module;
  return await callAPI(_callType.POST, endpoint, params, connectionInfo);
};

const updateRecord = async (module, id, params, connectionInfo) => {
  const endpoint = `${module}/${id}`;
  return await callAPI(_callType.PUT, endpoint, params, connectionInfo);
};

const getRecords = async (module, page = 1, connectionInfo) => {
  const endpoint = module;
  return await callAPI(_callType.GET, endpoint, {}, page, connectionInfo);
};

const getRecordsByParams = async (module, params, connectionInfo) => {
  const endpoint = module;
  return await callAPI(_callType.GET, endpoint, params, connectionInfo);
};

const getRecordById = async (module, id, connectionInfo) => {
  const endpoint = `${module}/${id}`;
  return await callAPI(_callType.GET, endpoint, connectionInfo);
};

const getRecordByIdAndParams = async ({
  module,
  id,
  submodule,
  params,
  connectionInfo,
}) => {
  const endpoint = submodule
    ? `${module}/${id}/${submodule}`
    : `${module}/${id}`;
  return await callAPI(_callType.GET, endpoint, params, connectionInfo);
};

const postRecordByIdAndParams = async ({
  module,
  id,
  submodule,
  params,
  connectionInfo,
  getParamsWithPost,
}) => {
  const endpoint = submodule
    ? `${module}/${id}/${submodule}`
    : `${module}/${id}`;
  return await callAPI(
    _callType.POST,
    endpoint,
    params,
    connectionInfo,
    getParamsWithPost,
  );
};

const deleteRecord = async (module, id, connectionInfo) => {
  const endpoint = `${module}/${id}`;
  return await callAPI(_callType.DELETE, endpoint, connectionInfo);
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
