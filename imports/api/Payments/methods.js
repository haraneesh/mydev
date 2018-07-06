import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Razorpay from 'razorpay';
import Payments from './Payments';
import Orders from '../Orders/Orders';
import zohoPayments from '../ZohoSyncUps/zohoPayments';
import { processInvoicesFromZoho } from '../ZohoSyncUps/zohoInvoices';
import rateLimit from '../../modules/rate-limit';
import orderCommon from '../../modules/both/orderCommon';
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
      orderId: String,
    });

    try {
      const order = Orders.findOne(inputParams.orderId);
      const totBalanceInvoicedAmountInPaise =
        orderCommon.getInvoiceTotals(order.invoices).balanceInvoicedAmount *
        100;
      console.log(orderCommon.getInvoiceTotals(order.invoices));
      const paymentResponse = await rzp.payments.capture(
        inputParams.razorpay_payment_id,
        totBalanceInvoicedAmountInPaise,
      );
      if (Meteor.isDevelopment) {
        console.log(paymentResponse);
      }

      const paymentId = Payments.insert({
        orderId: order._id,
        paymentApiResponseObject: paymentResponse,
        owner: this.userId,
      });

      const paidUser = Meteor.users.find({ _id: this.userId }).fetch()[0];

       const zhResponse = zohoPayments.createCustomerPayment({
        zhCustomerId: paidUser.zh_contact_id,
        paymentAmountInPaise: totBalanceInvoicedAmountInPaise,
        invoices: order.invoices,
        paymentMode: paymentResponse.method,
        razorPaymentId: inputParams.razorpay_payment_id,
        paymentDescription: `Paid via RazorPay, id ${inputParams.razorpay_payment_id} ,${paymentResponse.description} `,
        razorPayChargesInPaise: paymentResponse.fee,
      });

      if (Meteor.isDevelopment) {
        console.log(zhResponse);
      }

      // Update Payment record for history
      Payments.update(
        { _id: paymentId },
        { $set: { paymentZohoResponseObject: zhResponse } },
      );

      // Retrieve the sales order and update order
      const error = [];
      processInvoicesFromZoho(order, [], error);
      if (error.length > 0) {
        throw new Meteor.Error(error[0].code, error[0].message);
      }

      return 'Success';
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'payments.update': function paymentsUpdate(payment) {
    check(payment, {
      _id: String,
      title: String,
      body: String,
    });

    try {
      const paymentId = payment._id;
      Payments.update(paymentId, { $set: payment });
      return paymentId; // Return _id so we can redirect to paymentument after update.
    } catch (exception) {
      handleMethodException(exception);
    }
  },
  'payments.remove': function paymentsRemove(paymentId) {
    check(paymentId, String);

    try {
      return Payments.remove(paymentId);
    } catch (exception) {
      handleMethodException(exception);
    }
  },
});

rateLimit({
  methods: ['payments.insert', 'payments.update', 'payments.remove'],
  limit: 5,
  timeRange: 1000,
});
