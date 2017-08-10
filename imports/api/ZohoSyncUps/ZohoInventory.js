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

const _callAPI = (requestType, endpoint, params) => {
  const args = {};
  const apiBaseUrl = 'https://inventory.zoho.com/api/v1';
  args.params = _setAPICall();
  if ((requestType === _callType.POST || requestType === _callType.PUT) && params) {
    args.params.JSONString = JSON.stringify(params);
      // _data = params;
      // args.content = { JSONString: JSON.stringify(params) };
  }

  const _callUrl = `${apiBaseUrl}/${endpoint}`;
  try {
    const result = HTTP.call(requestType, _callUrl, args);
    return result.data;
  } catch (e) {
    // Got a network error, timeout, or HTTP error in the 400 or 500 range.
    /* console.log('--------------------------------------');
     console.error(e);
     console.log('--------------------------------------');*/
    const argMsg = (args.params.JSONString) ? args.params.JSONString:' '
     if (e.response) {
       //return e.response.data; 
       return {
         code:e.response.data.code,
         message:e.response.data.message + ' ' + argMsg
       }
     }
      else {
        return {
          code:-1,
          message: e.code + ' ' + e.errno + '  ' + argMsg
        }
    }
    
  }
};

const createRecord = (module, params) => {
    // check
  const endpoint = module;
  return _callAPI(_callType.POST, endpoint, params);
};

const updateRecord = (module, id, params) => {
  const endpoint = `${module}/${id}`;
  return _callAPI(_callType.PUT, endpoint, params);
};

const getRecords = (module) => {
  const endpoint = module;
  return _callAPI(_callType.GET, endpoint);
};

const getRecordById = (module, id) => {
  const endpoint = `${module}/${id}`;
  return _callAPI(_callType.GET, endpoint);
};


const deleteRecord = (module, id) => {
  const endpoint = `${module}/${id}`;
  return _callAPI(_callType.DELETE, endpoint);
};


export default ZohoInventory = {
  createRecord,
  updateRecord,
  getRecords,
  deleteRecord,
  getRecordById,
};
