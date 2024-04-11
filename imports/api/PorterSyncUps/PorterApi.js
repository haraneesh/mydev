import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

const _callType = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  DELETE: 'DELETE',

};

const callAPI = (
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

  if (params) {
    switch (true) {
      case (requestType === _callType.POST):
        msgBody = {
          ...params,
          getParamsWithPost,
        };
        break;
      default:
        msgBody = { ...params };
        break;
    }
  }

  args.data = (Object.keys(msgBody).length > 0) ? msgBody : null;
  args.headers = {
    'Content-Type': 'application/json',
    'x-api-key': accessToken,
  };

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

const postRecordsByParams = (module, params, connectionInfo) => {
  const endpoint = module;
  return callAPI(_callType.POST, endpoint, params, connectionInfo);
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
  postRecordsByParams,
};
