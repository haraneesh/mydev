import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { check, Match } from 'meteor/check';
import PaytmChecksum from './PaytmChecksum';
import Payments from './Payments';
import zohoPayments from '../ZohoSyncUps/zohoPayments';
import { updateUserWallet } from '../ZohoSyncUps/zohoContactsMethods';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

const STATUS = {
  TXN_SUCCESS: 'TXN_SUCCESS',
  TXN_FAILURE: 'TXN_FAILURE',
};

function updatePaymentTransactionError(orderId, errorObject) {
  const payment = Payments.find({ orderId }).fetch();
  const paymentErrorObject = (payment.errorObject) ? payment.errorObject : [];
  paymentErrorObject.push(errorObject);
  Payments.update({ orderId }, {
    $set: {
      errorObject: paymentErrorObject,
    },
  });
}

Meteor.methods({
  'payment.paytm.paymentTransactionError': async function paymentTransactionError(error) {
    check(error, Match.Any);
    updatePaymentTransactionError(error.ORDERID, error.errorObject);
  },
  'payment.paytm.completeTransaction': async function completeTransaction(paymentStatus) {
    check(paymentStatus, {
      STATUS: String,
      TXNAMOUNT: String,
      TXNID: String,
      CHECKSUMHASH: String,
      RESPCODE: String,
      RESPMSG: String,
      ORDERID: String,
      PAYMENTMODE: String,
    });

    if (Meteor.isServer) {
      Payments.update({ orderId: paymentStatus.ORDERID },
        {
          $set: {
            paymentApiResponseObject: paymentStatus,
            owner: this.userId,
          },
        });

      // If not failure completeTransaction is  called
      //  if (STATUS.TXN_SUCCESS === paymentStatus.STATUS) {
      const paidUser = Meteor.users.findOne({ _id: this.userId });

      const zhResponse = zohoPayments.createCustomerPayment({
        zhCustomerId: paidUser.zh_contact_id, // 702207000000089425
        paymentAmountInPaise: paymentStatus.TXNAMOUNT * 100,
        paymentMode: paymentStatus.PAYMENTMODE,
        razorPaymentId: paymentStatus.ORDERID,
        paymentDescription: `Paid via PayTm, id ${paymentStatus.ORDERID} msg ${paymentStatus.RESPMSG}`,
        zoho_fund_deposit_account_id: Meteor.settings.private.PayTM.zoho_fund_deposit_account_id,
      });

      if (Meteor.isDevelopment) {
        console.log(zhResponse);
        console.log(paymentStatus);
      }

      // Update Payment record history with the updated payment record
      Payments.update(
        { orderId: paymentStatus.ORDERID },
        { $set: { paymentZohoResponseObject: zhResponse } },
      );

      if (zhResponse.code !== 0) {
        handleMethodException(zhResponse, zhResponse.code);
      }

      const zhContactResponse = updateUserWallet(paidUser);

      if (Meteor.isDevelopment) {
        console.log(zhContactResponse);
      }

      // Update Payment record with the latest contact information
      Payments.update(
        { orderId: paymentStatus.ORDERID },
        { $set: { contactZohoResponseObject: zhContactResponse.zohoResponse } },
      );

      if (zhContactResponse.zohoResponse.code !== 0) {
        handleMethodException(
          zhContactResponse.zohoResponse,
          zhContactResponse.zohoResponse.code,
        );
      }
      return zhContactResponse.wallet;
      //  }
    }
  },
  'payment.paytm.simulatePayment': async function simulatePayment() {
    const paidUser = Meteor.users.findOne({ _id: this.userId });
    const zhContactResponse = updateUserWallet(paidUser);
    return zhContactResponse.wallet;
  },
  'payment.paytm.initiateTransaction': async function initiateTransaction(params) {
    check(params, {
      amount: String,
      mobile: String,
      firstName: String,
      lastName: String,
      showOptionsWithFee: Boolean,
      cartTotalBillAmount: Number,
    });

    if (Meteor.isServer) {
      try {
      // make initiate call

        /*
         * Generate checksum by parameters we have in body
         * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
        */

        const { merchantKey, websiteName } = Meteor.settings.private.PayTM;
        const { hostName, merchantId } = Meteor.settings.public.PayTM;
        const now = new Date();
        const suvaiTransactionId = `${this.userId}_${now.getTime().toString()}`;
        const orderId = suvaiTransactionId;
        const user = Meteor.users.findOne({ _id: this.userId });

        const paytmParams = {};

        paytmParams.body = {
          requestType: 'Payment',
          callbackUrl: `${Meteor.settings.public.AppURL}/paymentNotification`,
          mid: merchantId,
          websiteName,
          orderId,
          txnAmount: {
            value: params.amount,
            currency: 'INR',
          },
          userInfo: {
            custId: params.mobile,
            mobile: params.mobile,
            firstName: params.firstName,
            lastName: params.lastName,
          },
          enablePaymentMode: (!params.showOptionsWithFee)
            ? ['UPI', 'DEBIT_CARD']
            : ['NET_BANKING', 'CREDIT_CARD'],
        };

        const checksum = await PaytmChecksum.generateSignature(
          JSON.stringify(paytmParams.body), merchantKey,
        );

        paytmParams.head = {
          signature: checksum,
        };

        const response = HTTP.call(
          'POST',
          `https://${hostName}/theia/api/v1/initiateTransaction`,
          {
            params: {
              mid: merchantId,
              orderId,
            },
            data: paytmParams,
          },
        );

        const result = response.data;

        Payments.insert({
          orderId,
          owner: this.userId,
          paymentApiInitiationResponseObject: {
            result,
            amount: params.amount,
            cartTotalBillAmount: params.cartTotalBillAmount,
            userWallet: user.wallet,
          },

        });

        if (result.head.signature
                  && result.body.resultInfo.resultStatus
                  && result.body.resultInfo.resultStatus === 'S') {
          return {
            status: 'S',
            txToken: result.body.txnToken,
            suvaiTransactionId,
          };
        }

        // error
        return {
          status: 'F',
          errorMsg: result.body.resultInfo.resultMsg,
        };
      } catch (exception) {
        if (Meteor.isDevelopment) {
          console.log(`Exception --- ${exception}`);
        }
        handleMethodException(exception);
      }
    }
  },
  'payment.paytm.getSavedCreditCards': async function getSavedCreditCards(params) {
    check(params, {
      mobile: String,
      token: String,
      suvaiTransactionId: String,
    });

    if (Meteor.isServer) {
      try {
        const { merchantKey, websiteName } = Meteor.settings.private.PayTM;
        const { hostName, merchantId } = Meteor.settings.public.PayTM;
        const now = new Date();

        const paytmParams = {};

        paytmParams.body = {
          mid: merchantId,
          custId: params.mobile,
          includeExpired: true,
        };

        const checksum = await PaytmChecksum.generateSignature(
          JSON.stringify(paytmParams.body), merchantKey,
        );

        paytmParams.head = {
          signature: checksum,
          version: 'v1',
          requestId: params.suvaiTransactionId,
          requestTimestamp: now.getTime().toString(),
          token: params.token,
          tokenType: 'JWT',
        };

        console.log('paytm params');
        console.log(paytmParams);

        const response = HTTP.call(
          'POST',
          `https://${hostName}/savedcardservice/vault/cards/fetchCardByMidCustId`,
          {
            params: {
              mid: merchantId,
              requestId: params.suvaiTransactionId,
            },
            data: paytmParams,
          },
        );

        console.log(response);
      } catch (exception) {
        if (Meteor.isDevelopment) {
          console.log(`Exception --- ${exception}`);
        }
        // handleMethodException(exception);
      }
    }
  },
});

rateLimit({
  methods: ['payment.paytm.initiateTransaction', 'payment.paytm.completeTransaction', 'payment.paytm.paymentTransactionError'],
  limit: 5,
  timeRange: 1000,
});
