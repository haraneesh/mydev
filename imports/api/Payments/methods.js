import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Razorpay from 'razorpay';
import Payments from './Payments';
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
  'payment.insert': async function paymentInsert(inputParams) {
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

        const paymentId = Payments.insert({
          paymentApiResponseObject: paymentResponse,
          owner: this.userId,
        });

        const paidUser = Meteor.users.find({ _id: this.userId }).fetch()[0];

        const zhResponse = zohoPayments.createCustomerPayment({
          zhCustomerId: paidUser.zh_contact_id,
          paymentAmountInPaise: inputParams.amountChargedInPaise,
          paymentMode: paymentResponse.method,
          razorPaymentId: inputParams.razorpay_payment_id,
          paymentDescription: `Paid via RazorPay, id ${inputParams.razorpay_payment_id} ,${paymentResponse.description} `,
          razorPayChargesInPaise: paymentResponse.fee,
        });

        if (Meteor.isDevelopment) {
          console.log(zhResponse);
        }

        // Update Payment record history with the updated payment record
        Payments.update(
          { _id: paymentId },
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
          { _id: paymentId },
          { $set: { contactZohoResponseObject: zhContactResponse.zohoResponse } },
        );

        if (zhContactResponse.zohoResponse.code !== 0) {
          handleMethodException(zhContactResponse.zohoResponse, zhContactResponse.zohoResponse.code);
        }
      }
      return 'Success';
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: ['payments.insert'],
  limit: 5,
  timeRange: 1000,
});