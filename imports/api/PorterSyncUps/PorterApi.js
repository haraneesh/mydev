import { fetch } from 'meteor/fetch';
import { Meteor } from 'meteor/meteor';

const _callType = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

const callAPI = async (
  requestType,
  endpoint,
  params,
  connectionInfo,
  getParamsWithPost,
) => {
  const args = {};
  const accessToken = Meteor.settings.private.Porter.token;
  const apiBaseUrl = Meteor.settings.private.Porter.gateway_url;
  let msgBody = {};

  let callUrl = `${apiBaseUrl}/${endpoint}`;
  if (params) {
    switch (true) {
      case requestType === _callType.POST:
        msgBody = {
          ...params,
        };
        break;
      default:
        callUrl = `${callUrl}?${new URLSearchParams(params)}`;
        break;
    }
  }

  args.data = Object.keys(msgBody).length > 0 ? msgBody : null;
  args.headers = {
    'Content-Type': 'application/json',
    'x-api-key': accessToken,
  };

  if (Meteor.isDevelopment) {
    console.log('---------------Call Url-----------------------');
    console.log(`Access Token ${JSON.stringify(accessToken)}`);
    console.log(callUrl);
    console.log('---------------Args-----------------------');
    console.log(msgBody);
  }

  try {
    const response = await fetch(callUrl, {
      method: requestType, // *GET, POST, PUT, DELETE, etc.
      headers: args.headers,
      body: requestType !== _callType.GET ? JSON.stringify(args.data) : null, // body data type must match "Content-Type" header
    });

    if (!response.ok) {
      console.log('---------------Error---------------------');
      console.log(response);
      throw new Error('Return response has an error');
    }
    const result = await response.json();
    if (Meteor.isDevelopment) {
      console.log('---------------Data-----------------------');
      console.log(result);
    }
    return result;
  } catch (e) {
    // Got a network error, timeout, or HTTP error in the 400 or 500 range.
    if (Meteor.isDevelopment) {
      console.log('---------------Error------------------');
      console.error(e);
      console.log('--------------------------------------');
    }
    if (e.response) {
      // content: '{"type":"cannot_process","message":"order has already cancelled"}'
      const code = e.response.statusCode;
      const message = `${e.response.content.type} ${e.response.content.message}`;
      throw new Meteor.Error(code, message);
    }
    throw e;
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

const postRecordsByParams = async (module, params, connectionInfo) => {
  const endpoint = module;
  return await callAPI(_callType.POST, endpoint, params, connectionInfo);
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
  postRecordsByParams,
};
