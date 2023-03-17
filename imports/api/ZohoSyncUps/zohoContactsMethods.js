import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';
import moment from 'moment';
import { dateSettings } from '../../modules/settings';
import rateLimit from '../../modules/rate-limit';
import constants from '../../modules/constants';
import statementEmail from './statementEmailTemplate';
import zh from './ZohoBooks';
import ZohoSyncUps, { syncUpConstants } from './ZohoSyncUps';
import { updateSyncAndReturn, retResponse } from './zohoCommon';
import { getUserOrdersAndInvoicesFromZoho } from './zohoOrdersMethods';
import handleMethodException from '../../modules/handle-method-exception';

const fs = require('fs');

const createZohoBooksContact = (usr) => ({
  contact_name: `${usr.profile.name.first} ${usr.profile.name.last}`,
  customer_sub_type: (Roles.userIsInRole(usr._id, constants.Roles.shopOwner.name)) ? 'business' : 'individual',
  // gst_treatment: (Roles.userIsInRole(usr._id, constants.Roles.shopOwner.name)) ? 'business_gst' : 'consumer',
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
  const r = (user.zh_contact_id)
    ? zh.updateRecord('contacts', user.zh_contact_id, zhContact)
    : zh.createRecord('contacts', zhContact);
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
    const { contact } = zhContactResponse;
    newWallet = {
      unused_retainer_payments_InPaise: contact.unused_retainer_payments * 100,
      unused_credits_receivable_amount_InPaise: contact.unused_credits_receivable_amount * 100,
      outstanding_receivable_amount_InPaise: contact.outstanding_receivable_amount * 100,
      // activeDiscountPercentage: 0,
      // discountActiveUntilDate: null,
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
  const user = Meteor.users.find(userId).fetch({}, {
    fields: {
      zh_contact_id: 1,
      wallet: 1,
    },
  })[0];

  const userSyncedWithZoho = user && user.zh_contact_id;
  if (Meteor.isServer && userSyncedWithZoho) {
    const lastWalletSyncDate = (user.wallet && user.wallet.lastZohoSync)
      ? user.wallet.lastZohoSync : new Date('1/1/2000');
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
    return user.wallet;
  }

  return {};
}

export const getUserWallet = new ValidatedMethod({
  name: 'users.getUserWallet',
  validate() { },
  run() {
    return retWalletAndSyncIfNecessary(this.userId);
  },
});

const sendMessage = ({
  user, zhStartDate, zhEndDate, zhGeneratedDate, emailAddress,
}) => {
  const salutation = user.profile.salutation || '';
  const firstName = user.profile.name.first;

  const zhContactResponse = zh.postRecordByIdAndParams({
    module: 'contacts',
    id: user.zh_contact_id,
    submodule: 'statements/email',
    getParamsWithPost: {
      start_date: zhStartDate,
      end_date: zhEndDate,
    },
    params: {
      send_from_org_email_id: false,
      to_mail_ids: [emailAddress],
      subject: statementEmail.subject(zhGeneratedDate),
      body: statementEmail.body({
        salutation,
        firstName,
        startDate: zhStartDate,
        endDate: zhEndDate,
      }),
    },
  });
  return zhContactResponse;
};

function returnStartandEndDates(periodSelected) {
  const today = moment();
  let startDate;
  let endDate;

  switch (periodSelected) {
    /* case constants.StatementPeriod.Today.name:
      startDate = today;
      endDate = today;
      break; */
    case constants.StatementPeriod.ThisWeek.name:
      startDate = moment().day('Sunday');
      endDate = today;
      break;
    case constants.StatementPeriod.ThisMonth.name:
      startDate = moment().date(1);
      endDate = today;
      break;
    case constants.StatementPeriod.ThisYear.name:
      startDate = moment().dayOfYear(1);
      endDate = today;
      break;
      /* case constants.StatementPeriod.Yesterday.name:
      startDate = moment().subtract(1, 'days');
      endDate = startDate;
      break; */
    case constants.StatementPeriod.PreviousWeek.name:
      startDate = moment().subtract(7, 'days').day('Sunday');
      endDate = moment().subtract(7, 'days').day('Saturday');
      break;
    case constants.StatementPeriod.PreviousMonth.name:
      startDate = moment().subtract(1, 'months').date(1);
      endDate = moment().date(1).subtract(1, 'days');
      break;
    case constants.StatementPeriod.PreviousYear.name:
      startDate = moment().subtract(1, 'years').dayOfYear(1);
      endDate = moment().dayOfYear(1).subtract(1, 'days');
      break;
    default:
      handleMethodException('The period selected is not supported yet.', 404);
      break;
  }
  const zhStartDate = moment(startDate).tz(dateSettings.timeZone).format(dateSettings.zhPayDateFormat);
  const zhEndDate = moment(endDate).tz(dateSettings.timeZone).format(dateSettings.zhPayDateFormat);
  const zhGeneratedDate = moment(today).tz(dateSettings.timeZone).format(dateSettings.zhPayDateFormat);

  return { zhStartDate, zhEndDate, zhGeneratedDate };
}

Meteor.methods({
  'customer.sendStatement': function sendStatement(params) {
    check(params, {
      periodSelected: String,
    });

    if (Meteor.isServer) {
      const user = Meteor.users.findOne({ _id: this.userId });
      if (!user.emails[0].verified) {
        return {
          message: 'Email Address is Not Verified',
          messageType: 'EmailVerifyError',
        };
      }

      try {
        const {
          zhStartDate,
          zhEndDate,
          zhGeneratedDate,
        } = returnStartandEndDates(params.periodSelected);

        const zohoResponse = sendMessage({
          user, zhStartDate, zhEndDate, zhGeneratedDate, emailAddress: user.emails[0].address,
        });

        if (zohoResponse.code !== 0) {
          handleMethodException(zohoResponse, zohoResponse.code);
        }
        return {
          emailAddress: user.emails[0].address,
          message: zohoResponse.message,
          messageType: 'success',
        };
      } catch (exception) {
        handleMethodException(exception);
      }
    }
  },
  'customer.getStatement': function getStatement(params) {
    check(params, {
      periodSelected: String,
    });

    if (Meteor.isServer) {
      try {
        const {
          zhStartDate,
          zhEndDate,
        } = returnStartandEndDates(params.periodSelected);

        const user = Meteor.users.find(this.userId).fetch({}, {
          fields: {
            zh_contact_id: 1,
          },
        })[0];

        const zhContactResponse = zh.getRecordByIdAndParams({
          module: 'customers',
          id: user.zh_contact_id,
          submodule: 'statements',
          params: { from_date: zhStartDate, to_date: zhEndDate, accept: 'json' },
        });

        return zhContactResponse;
      } catch (exception) {
        handleMethodException(exception);
      }
    }
  },
});

rateLimit({
  methods: [
    'customer.getStatement',
    'customer.sendStatement',
    bulkSyncUsersZoho,
    getUserWallet],
  limit: 5,
  timeRange: 1000,
});
