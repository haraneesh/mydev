import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';

const callType = {
  POST: 'POST',
  GET: 'GET',
  PUT: 'PUT',
  DELETE: 'DELETE',

};

const setAPICall = () => ({
  api_key: Meteor.settings.private.recipes.api_data_gov,
});

const callAPI = (requestType, endpoint, params) => {
  const args = {};
  const apiBaseUrl = 'https://api.nal.usda.gov/ndb';
  args.params = setAPICall();
  args.params = (params) ? Object.assign({}, args.params, params): args.params;

  const callUrl = `${apiBaseUrl}/${endpoint}`;
  if (Meteor.isDevelopment) {
    console.log(callUrl);
  }
  
    const result = HTTP.call(requestType, callUrl, args);
    if (Meteor.isDevelopment) {
      console.log('--------------------------------------');
      console.log(result);
      console.log('--------------------------------------');
      console.log(args.params);
    }  
    return result;
};

const getRecords = (module) => {
  const endpoint = module;
  return callAPI(callType.GET, endpoint);
};

const getRecordsByParams = (module, params) => {
  const endpoint = module;
  return callAPI(callType.GET, endpoint, params);
};

const getRecordById = (module, id) => {
  const endpoint = `${module}/${id}`;
  return callAPI(callType.GET, endpoint);
};

export default ApiUtils = {
  getRecordById,
  getRecords,
  getRecordsByParams,
};