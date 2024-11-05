import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Razorpay from 'razorpay';
import Payments from './Payments';
import './paytm-methods';
import zohoPayments from '../ZohoSyncUps/zohoPayments';
import { updateUserWallet } from '../ZohoSyncUps/zohoContactsMethods';
import rateLimit from '../../modules/rate-limit';
import handleMethodException from '../../modules/handle-method-exception';

const rzp = new Razorpay({
  key_id: Meteor.settings.private.Razor.merchantKey,
  key_secret: Meteor.settings.private.Razor.merchantKeySecret,
});

/*
Razor Pay Error Response
{
  "error": {
      "code": "BAD_REQUEST_ERROR",
      "description": "The amount is invalid",
      "field": "amount"
   }
}

Razor Pay
{
    "id": "pay_7IZD7aJ2kkmOjk",
    "entity": "payment",
    "amount": 50000,
    "currency": "INR",
    "status": "captured",
    "order_id": null,
    "invoice_id": null,
    "international": false,
    "method": "wallet",
    "amount_refunded": 0,
    "refund_status": null,
    "captured": true,
    "description": "Purchase Description",
    "card_id": null,
    "bank": null,
    "wallet": "freecharge",
    "vpa": null,
    "email": "a@b.com",
    "contact": "91xxxxxxxx",
    "notes": {
        "merchant_order_id": "order id"
    },
    "fee": 1438,
    "tax": 188,
    "error_code": null,
    "error_description": null,
    "created_at": 1400826750
}

*/
Meteor.methods({
  'payments.getPayments': async function getPayments() {
    try {
      if (Meteor.isServer) {
        const query = { _id: this.userId };
        const user = await Meteor.users.find(query).fetchAsync();

        if (user[0].zh_contact_id) {
          const r = await zohoPayments.getCustomerPayments(user[0].zh_contact_id);

          if (r.code !== 0) {
            handleMethodException(r, r.code);
          }
          return r.customerpayments;
        }
        return [];
      }
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'payments.insert': async function paymentInsert(inputParams) {
    check(inputParams, {
      razorpay_payment_id: String,
      amountChargedInPaise: Number,
    });

    try {
      if (Meteor.isServer) {
        const paymentResponse = await rzp.payments.capture(
          inputParams.razorpay_payment_id,
          inputParams.amountChargedInPaise,
        );

        if (Meteor.isDevelopment) {
          console.log(paymentResponse);
        }

        const paymentId = await Payments.insertAsync({
          paymentApiResponseObject: paymentResponse,
          owner: this.userId,
        });

        const paidUser = await Meteor.users.findOneAsync({ _id: this.userId });

        const amountAfterFeeTax = paymentResponse.amount - paymentResponse.fee - paymentResponse.tax;

        const zhResponse = await zohoPayments.createCustomerPayment({
          zhCustomerId: paidUser.zh_contact_id,
          paymentAmountInPaise: paymentResponse.amount, // amountAfterFeeTax,
          paymentMode: paymentResponse.method,
          razorPaymentId: inputParams.razorpay_payment_id,
          paymentDescription: `Paid via RazorPay, id ${inputParams.razorpay_payment_id} 
            fee: ${paymentResponse.fee} 
            tax: ${paymentResponse.tax}
            ${paymentResponse.description} 
            `,
          zoho_fund_deposit_account_id: Meteor.settings.private.Razor.zoho_fund_deposit_account_id,
        });

        if (Meteor.isDevelopment) {
          console.log(zhResponse);
        }

        // Update Payment record history with the updated payment record
        await Payments.updateAsync(
          { _id: paymentId },
          { $set: { paymentZohoResponseObject: zhResponse } },
        );

        if (zhResponse.code !== 0) {
          handleMethodException(zhResponse, zhResponse.code);
        }

        const zhContactResponse = await updateUserWallet(paidUser);

        if (Meteor.isDevelopment) {
          console.log(zhContactResponse);
        }

        // Update Payment record with the latest contact information
        await Payments.updateAsync(
          { _id: paymentId },
          { $set: { contactZohoResponseObject: zhContactResponse.zohoResponse } },
        );

        if (zhContactResponse.zohoResponse.code !== 0) {
          handleMethodException(
            zhContactResponse.zohoResponse,
            zhContactResponse.zohoResponse.code,
          );
        }
      }
      return {
        amountInPaise: paymentResponse.amount,
        feeInPaise: paymentResponse.fee,
        taxInPaise: paymentResponse.tax,
      };
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: ['payments.insert', 'payments.getPayments'],
  limit: 5,
  timeRange: 1000,
});
