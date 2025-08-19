import { Match, check } from 'meteor/check';
import { fetch } from 'meteor/fetch';
import { HTTP } from 'meteor/http';
import { Meteor } from 'meteor/meteor';
import { calculateAmountMinusGateWayFee } from '/imports/modules/both/walletHelpers';
import handleMethodException from '../../modules/handle-method-exception';
import rateLimit from '../../modules/rate-limit';
import { updateUserWallet } from '../ZohoSyncUps/zohoContactsMethods';
import zohoPayments from '../ZohoSyncUps/zohoPayments';
import Payments from './Payments';
import Invoices from '../Invoices/invoices';
import PaytmChecksum from './PaytmChecksum';

const STATUS = {
  TXN_SUCCESS: 'TXN_SUCCESS',
  TXN_FAILURE: 'TXN_FAILURE',
};

async function updatePaymentTransactionError(orderId, errorObject) {
  const payment = await Payments.find({ orderId }).fetchAsync();
  const paymentErrorObject = payment.errorObject ? payment.errorObject : [];
  paymentErrorObject.push(errorObject);
  await Payments.updateAsync(
    { orderId },
    {
      $set: {
        errorObject: paymentErrorObject,
      },
    },
  );
}

Meteor.methods({
  'payment.paytm.paymentTransactionError':
    async function paymentTransactionError(error) {
      check(error, Match.Any);
      await updatePaymentTransactionError(error.ORDERID, error.errorObject);
    },
  'payment.paytm.completeTransaction': async function completeTransaction(paymentStatus, invoicesToPay = []) {
    check(paymentStatus, {
      STATUS: String,
      TXNAMOUNT: String,
      TXNID: Match.Maybe(String),
      CHECKSUMHASH: String,
      RESPCODE: String,
      RESPMSG: String,
      ORDERID: String,
      PAYMENTMODE: String,
    });
    check(invoicesToPay, Match.Where(invoices => {
      // Allow empty array
      if (invoices.length === 0) return true;
      
      // Check each item in the array
      return Array.isArray(invoices) && invoices.every(invoice => {
        return invoice && 
               typeof invoice._id === 'string' &&
               typeof invoice.invoice_id === 'string' &&
               typeof invoice.total === 'number';
      });
    }));

    if (!Meteor.isServer) return;

    try {
      // 1. Update payment record with status and invoice references
      const updateData = {
        paymentApiResponseObject: paymentStatus,
        owner: this.userId,
        status: paymentStatus.STATUS === 'TXN_SUCCESS' ? 'completed' : 'failed',
        paymentMethod: paymentStatus.PAYMENTMODE,
        totalAmount: parseFloat(paymentStatus.TXNAMOUNT) || 0,
        updatedAt: new Date()
      };

      if (invoicesToPay.length > 0) {
        updateData.relatedInvoices = invoicesToPay.map(inv => inv._id);
        updateData.invoiceCount = invoicesToPay.length;
      }

      await Payments.updateAsync(
        { orderId: paymentStatus.ORDERID },
        { $set: updateData }
      );

      // 2. If payment failed, log and return early
      if (paymentStatus.STATUS !== 'TXN_SUCCESS') {
        console.log(`Payment failed for order ${paymentStatus.ORDERID}: ${paymentStatus.RESPMSG}`);
        return { success: false, status: 'failed', message: paymentStatus.RESPMSG };
      }

      // 3. Process payment with Zoho
      console.log('transaction amount ' + paymentStatus.TXNAMOUNT);
      const txnAmountInPaise = parseFloat(paymentStatus.TXNAMOUNT) * 100;
      const paymentAmountDeductingFee = 
        paymentStatus.PAYMENTMODE === 'CC' || paymentStatus.PAYMENTMODE === 'NB'
          ? calculateAmountMinusGateWayFee(txnAmountInPaise)
          : txnAmountInPaise;

      const paidUser = await Meteor.users.findOneAsync({ _id: this.userId });
      if (!paidUser) {
        throw new Meteor.Error('user-not-found', 'User not found');
      }

      // 4. Process Zoho payment
      const paymentData = {
        customer_id: paidUser.zh_contact_id,
        payment_mode: paymentStatus.PAYMENTMODE === 'CC' ? 'creditcard' : 
                     paymentStatus.PAYMENTMODE === 'NB' ? 'banktransfer' : 'other',
        amount: paymentAmountDeductingFee / 100,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        reference_number: paymentStatus.ORDERID,
        description: `Paid via PayTM, id ${paymentStatus.ORDERID} msg ${paymentStatus.RESPMSG}`,
        invoices: invoicesToPay.map(invoice => ({
          invoice_id: invoice.invoice_id,
          amount_applied: invoice.total || 0
        })),
      };

      const zhResponse = await zohoPayments.createCustomerPayment(paymentData);

      if (Meteor.isDevelopment) {
        console.log('Zoho Payment Response:', zhResponse);
      }

      // 5. Update ZhInvoices status to paid using the dedicated method
      if (invoicesToPay.length > 0 && zhResponse.code == 0) {
        const { updateInvoicePaymentStatus } = await import('/imports/api/ZhInvoices/methods');
        
        for (const invoice of invoicesToPay) {
          const amount = invoice.total || 0;
          
          await updateInvoicePaymentStatus.call({
            invoiceId: invoice.invoice_id,
            paymentStatus,
            amount
          });
        }
      }

      // 6. Update payment record with Zoho response
      await Payments.updateAsync(
        { orderId: paymentStatus.ORDERID },
        { 
          $set: { 
            paymentZohoResponseObject: zhResponse,
            processedAt: new Date()
          } 
        }
      );

      // 7. Update user's wallet information
      const user = await Meteor.users.findOneAsync(this.userId);
      if (user && user.zh_contact_id) {
        try {
          await updateUserWallet(user);
        } catch (walletError) {
          console.error('Error updating user wallet:', walletError);
          // Don't fail the whole operation if wallet update fails
        }
      }

      return { 
        success: true, 
        status: 'completed',
        orderId: paymentStatus.ORDERID,
        processedAt: new Date()
      };

    } catch (error) {
      console.error('Error in completeTransaction:', error);
      
      // Update payment record with error
      await Payments.updateAsync(
        { orderId: paymentStatus.ORDERID },
        { 
          $set: { 
            status: 'failed',
            error: error.message,
            errorDetails: error.reason || error.details,
            updatedAt: new Date()
          } 
        }
      );
      
      throw new Meteor.Error('payment-processing-failed', error.message);
    }
  },
  'payment.paytm.simulatePayment': async function simulatePayment() {
    const paidUser = await Meteor.users.findOneAsync({ _id: this.userId });
    const zhContactResponse = await updateUserWallet(paidUser);
    return zhContactResponse.wallet;
  },
  'payment.paytm.initiateTransaction': async function initiateTransaction(
    params,
  ) {
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
        const user = await Meteor.users.findOneAsync({ _id: this.userId });

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
          enablePaymentMode: !params.showOptionsWithFee
            ? ['UPI', 'DEBIT_CARD']
            : ['NET_BANKING', 'CREDIT_CARD'],
        };

        const checksum = await PaytmChecksum.generateSignature(
          JSON.stringify(paytmParams.body),
          merchantKey,
        );

        paytmParams.head = {
          signature: checksum,
        };

        const response = await fetch(
          `https://${hostName}/theia/api/v1/initiateTransaction?${new URLSearchParams({ mid: merchantId, orderId: orderId }).toString()}`,
          {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paytmParams), // body data type must match "Content-Type" header
          },
        );

        if (!response.ok) {
          console.log('---------------Error---------------------');
          console.log(response);
          throw new Error('Return response has an error');
        }
        const result = await response.json();

        await Payments.insertAsync({
          orderId,
          owner: this.userId,
          paymentApiInitiationResponseObject: {
            result,
            amount: params.amount,
            cartTotalBillAmount: params.cartTotalBillAmount,
            userWallet: user.wallet,
          },
        });

        if (
          result.head.signature &&
          result.body.resultInfo.resultStatus &&
          result.body.resultInfo.resultStatus === 'S'
        ) {
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
  'payment.paytm.getSavedCreditCards': async function getSavedCreditCards(
    params,
  ) {
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
          JSON.stringify(paytmParams.body),
          merchantKey,
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

        const response = await fetch(
          `https://${hostName}/savedcardservice/vault/cards/fetchCardByMidCustId?${new URLSearchParams({ mid: merchantId, requestId: params.suvaiTransactionId }).toString()}`,
          {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paytmParams), // body data type must match "Content-Type" header
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
  methods: [
    'payment.paytm.initiateTransaction',
    'payment.paytm.completeTransaction',
    'payment.paytm.paymentTransactionError',
  ],
  limit: 5,
  timeRange: 1000,
});
