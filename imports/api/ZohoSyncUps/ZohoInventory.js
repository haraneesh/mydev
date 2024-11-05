import { HTTP } from 'meteor/http';

const _callType = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

const _setAPICall = () => ({
  authtoken: Meteor.settings.private.zoho_authtoken,
  organization_id: Meteor.settings.private.zoho_organization_id,
});

const _callAPI = async (requestType, endpoint, params) => {
  const args = {};
  const apiBaseUrl = 'https://inventory.zoho.com/api/v1';
  args.params = _setAPICall();
  if (
    (requestType === _callType.POST || requestType === _callType.PUT) &&
    params
  ) {
    args.params.JSONString = JSON.stringify(params);
  }

  const callUrl = `${apiBaseUrl}/${endpoint}`;
  try {
    const response = await fetch(callUrl, {
      method: requestType, // *GET, POST, PUT, DELETE, etc.
      headers: args.headers,
      body: requestType !== _callType.GET ? args.params.JSONString : null, // body data type must match "Content-Type" header
    });
    if (!response.ok) {
      console.log('---------------Error---------------------');
      console.log(response);
      throw new Error('Return response has an error');
    }
    return await response.json();
  } catch (e) {
    // Got a network error, timeout, or HTTP error in the 400 or 500 range.
    /* console.log('--------------------------------------');
     console.error(e);
     console.log('--------------------------------------');*/
    const argMsg = args.params.JSONString ? args.params.JSONString : ' ';
    if (e.response) {
      //return e.response.data;
      return {
        code: e.response.code,
        message: e.response.message + ' ' + argMsg,
      };
    } else {
      return {
        code: -1,
        message: e.code + ' ' + e.errno + '  ' + argMsg,
      };
    }
  }
};

const createRecord = async (module, params) => {
  // check
  const endpoint = module;
  return await _callAPI(_callType.POST, endpoint, params);
};

const updateRecord = async (module, id, params) => {
  const endpoint = `${module}/${id}`;
  return await _callAPI(_callType.PUT, endpoint, params);
};

const getRecords = async (module) => {
  const endpoint = module;
  return await _callAPI(_callType.GET, endpoint);
};

const getRecordById = async (module, id) => {
  const endpoint = `${module}/${id}`;
  return await _callAPI(_callType.GET, endpoint);
};

const deleteRecord = async (module, id) => {
  const endpoint = `${module}/${id}`;
  return await _callAPI(_callType.DELETE, endpoint);
};

const ZohoInventory = {
  createRecord,
  updateRecord,
  getRecords,
  deleteRecord,
  getRecordById,
};

export default ZohoInventory;
