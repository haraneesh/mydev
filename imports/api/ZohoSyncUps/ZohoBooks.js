import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

const _callType = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  DELETE: 'DELETE',

};

const setAPICall = () => ({
  authtoken: Meteor.settings.private.zoho_authtoken,
  organization_id: Meteor.settings.private.zoho_organization_id,
});

const callAPI = (requestType, endpoint, params) => {
  const args = {};
  const apiBaseUrl = 'https://books.zoho.com/api/v3';
  args.params = setAPICall();

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

    if (Meteor.isDevelopment) {
      console.log(callUrl);
      console.log('--------------------------------------');
      // console.log(result.data);
      // console.log('--------------------------------------');
      // console.log(args.params);
    }
    
    const result = HTTP.call(requestType, callUrl, args);
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

const createRecord = (module, params) => {
    // check
  const endpoint = module;
  return callAPI(_callType.POST, endpoint, params);
};

const updateRecord = (module, id, params) => {
  const endpoint = `${module}/${id}`;
  return callAPI(_callType.PUT, endpoint, params);
};

const getRecords = (module) => {
  const endpoint = module;
  return callAPI(_callType.GET, endpoint);
};

const getRecordsByParams = (module, params) => {
  const endpoint = module;
  return callAPI(_callType.GET, endpoint, params);
};

const getRecordById = (module, id) => {
  const endpoint = `${module}/${id}`;
  return callAPI(_callType.GET, endpoint);
};

const deleteRecord = (module, id) => {
  const endpoint = `${module}/${id}`;
  return callAPI(_callType.DELETE, endpoint);
};


export default ZohoBooks = {
  createRecord,
  updateRecord,
  getRecords,
  deleteRecord,
  getRecordById,
  getRecordsByParams,
};
