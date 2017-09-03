import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import rateLimit from '../../modules/rate-limit';
import constants from '../../modules/constants';
import zh from './ZohoBooks';
import ZohoSyncUps, { syncUpConstants } from './ZohoSyncUps';
import { updateSyncAndReturn, retResponse } from './zohoCommon';

const _createZohoInventoryContact = usr => ({
  contact_name: `${usr.profile.name.first} ${usr.profile.name.last}`,
  billing_address: {
    address: 'Street address',
    city: 'chennai',
    state: 'TN',
  },
  shipping_address: {
    address: 'Street Address goes here',
    city: 'chennai',
    state: 'TN',
  },
  contact_persons: [{
    first_name: usr.profile.name.first,
    last_name: usr.profile.name.last,
    email: usr.email,
    mobile: usr.profile.whMobilePhone,
    is_primary_contact: true,
  }],
});


const createZohoBooksContact = usr => ({
  contact_name: `${usr.profile.name.first} ${usr.profile.name.last}`,
  gst_treatment: 'consumer',
  billing_address: {
    address: 'Street address',
    city: 'chennai',
    state: 'TN',
  },
  shipping_address: {
    address: 'Street Address goes here',
    city: 'chennai',
    state: 'TN',
  },
  contact_persons: [{
    first_name: usr.profile.name.first,
    last_name: usr.profile.name.last,
    email: usr.email,
    mobile: usr.profile.whMobilePhone,
    is_primary_contact: true,
  }],
});

const _syncUsersWithZoho = (usr, successResp, errorResp) => {
  const user = usr;
  const zhContact = createZohoBooksContact(user);
  const r = (user.zh_contact_id) ?
          zh.updateRecord('contacts', user.zh_contact_id, zhContact) :
          zh.createRecord('contacts', zhContact);
  if (r.code === 0 /* Success */) {
    Meteor.users.update({ _id: user._id }, { $set: { zh_contact_id: r.contact.contact_id } });
    successResp.push(retResponse(r));
  } else {
    errorResp.push(retResponse(r));
  }
};

export const bulkSyncUsersZoho = new ValidatedMethod({
  name: 'users.bulkSyncUsersZoho',
  validate() {},
  run() {
    if (!Roles.userIsInRole(this.userId, constants.Roles.admin.name)) {
      // user not authorized. do not publish secrets
      throw new Meteor.Error(401, 'Access denied');
    }
    const nowDate = new Date();

    const successResp = [];
    const errorResp = [];
    if (Meteor.isServer) {
      const syncDT = ZohoSyncUps.findOne({ syncEntity: syncUpConstants.users }).syncDateTime;
      const query = { updatedAt: { $gte: syncDT } };
      const users = Meteor.users.find(query).fetch(); // Change based on update date
      users.forEach((usr) => {
        _syncUsersWithZoho(usr, successResp, errorResp);
      });
    }
    return updateSyncAndReturn(syncUpConstants.users, successResp, errorResp, nowDate);
  },
});

rateLimit({
  methods: [bulkSyncUsersZoho],
  limit: 5,
  timeRange: 1000,
});

