import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import moment from 'moment';
import rateLimit from '../../modules/rate-limit';
import constants from '../../modules/constants';
import zh from './ZohoBooks';
import ZohoSyncUps, { syncUpConstants } from './ZohoSyncUps';
import { updateSyncAndReturn, retResponse } from './zohoCommon';
import { getUserOrdersAndInvoicesFromZoho } from './zohoOrdersMethods';
import handleMethodException from '../../modules/handle-method-exception';

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
    address: usr.profile.deliveryAddress,
    city: 'chennai',
    state: 'TN',
  },
  shipping_address: {
    address: usr.profile.deliveryAddress,
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
    const res = {
      code: r.code,
      message: `${r.message}: user Id = ${user._id}`,
    };
    errorResp.push(retResponse(res));
  }
};

export const bulkSyncUsersZoho = new ValidatedMethod({
  name: 'users.bulkSyncUsersZoho',
  validate() { },
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

export const updateUserWallet = (user) => {
  const zhContactResponse = zh.getRecordById('contacts', user.zh_contact_id);

  let newWallet;

  if (zhContactResponse.code === 0) {
    const contact = zhContactResponse.contact;
    newWallet = {
      unused_retainer_payments_InPaise: contact.unused_retainer_payments * 100,
      unused_credits_receivable_amount_InPaise: contact.unused_credits_receivable_amount * 100,
      outstanding_receivable_amount_InPaise: contact.outstanding_receivable_amount * 100,
      lastZohoSync: new Date(),
    };

    Meteor.users.update({ _id: user._id }, {
      $set: {
        wallet: newWallet,
      },
    });
  }
  return {
    zohoResponse: zhContactResponse,
    wallet: newWallet,
  };
};

export function retWalletAndSyncIfNecessary(userId) {
  const user = Meteor.users.find(userId).fetch()[0];

  if (Meteor.isServer) {
    const lastWalletSyncDate = (user.wallet && user.wallet.lastZohoSync) ?
        user.wallet.lastZohoSync : new Date('1/1/2000');
    const now = moment(new Date()); // todays date
    const end = moment(lastWalletSyncDate);
    const duration = moment.duration(now.diff(end));
    const days = duration.asDays();

    if (days > 1) {
      const { zohoResponse } = updateUserWallet(user);

      if (zohoResponse.code !== 0) {
        handleMethodException(zohoResponse, zohoResponse.code);
      }

      const { error } = getUserOrdersAndInvoicesFromZoho(userId);

      if (error.erroResp && error.erroResp.length > 0) {
        handleMethodException(error.errorResp[0], error.errorResp[0].code);
      }

      return zohoResponse.wallet;
    }
  }

  return user.wallet;
}

export const getUserWallet = new ValidatedMethod({
  name: 'users.getUserWallet',
  validate() { },
  run() {
    return retWalletAndSyncIfNecessary(this.userId);
  },
});


rateLimit({
  methods: [bulkSyncUsersZoho, getUserWallet],
  limit: 5,
  timeRange: 1000,
});

