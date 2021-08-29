import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import PaytmChecksum from 'paytmChecksum';
import Payments from './Payments';
import zohoPayments from '../ZohoSyncUps/zohoPayments';
import { updateUserWallet } from '../ZohoSyncUps/zohoContactsMethods';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

const https = require('https');

Meteor.methods({
  'payment.paytm.initiateTransaction': async function initiateTransaction(orderId) {
    check(orderId, String);
    if (Meteor.isServer) {
      try {
        // make initiate call

        /*
         * Generate checksum by parameters we have in body
         * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
        */

        const { merchantKey } = Meteor.settings.private.PayTM;
        const { hostName, merchantId } = Meteor.settings.public.PayTM;

        const paytmParams = {};

        paytmParams.body = {
          requestType: 'Payment',
          mid: merchantId,
          websiteName: Meteor.settings.private.PayTM.websiteName,
          orderId,
          callbackUrl: 'https://merchant.com/callback',
          txnAmount: {
            value: '1.00',
            currency: 'INR',
          },
          userInfo: {
            custId: 'CUST_001',
          },
        };

        const checksum = await PaytmChecksum.generateSignature(
          JSON.stringify(paytmParams.body), merchantKey,
        );

        paytmParams.head = {
          signature: checksum,
        };

        const postData = JSON.stringify(paytmParams);

        const options = {
          hostname: hostName,

          port: 443,
          path: `/theia/api/v1/initiateTransaction?mid=${merchantId}&orderId=${orderId}`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length,
          },
        };

        let response = '';
        const postReq = https.request(options, (postRes) => {
          postRes.on('data', (chunk) => {
            response += chunk;
          });

          postRes.on('end', () => {
            const result = JSON.parse(response);

            if (result.head.signature
                  && result.body.resultInfo.resultStatus
                  && result.body.resultInfo.resultStatus === 'S') {
              // validate if the response was not tampered with
              const isVerifySignature = PaytmChecksum.verifySignature(
                response.body, merchantKey, result.head.signature,
              );
              if (isVerifySignature) {
                // success
                return {
                  status: 'S',
                  txToken: result.body.txnToken,
                };
              }
            }

            // error
            return {
              status: 'F',
              errorMsg: result.body.resultInfo.resultMsg,
            };
          });
        });

        postReq.write(postData);
        postReq.end();
      } catch (exception) {
        if (Meteor.isDevelopment) {
          console.log(`Exception ${exception}`);
        }
        handleMethodException(exception);
      }
    }
  },
});

rateLimit({
  methods: ['payment.paytm.initiateTransaction'],
  limit: 5,
  timeRange: 1000,
});
