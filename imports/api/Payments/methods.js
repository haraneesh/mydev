import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Razorpay from 'razorpay';
import Payments from './Payments';
import Orders from '../Orders/Orders';
import rateLimit from '../../modules/rate-limit';
import orderCommon from '../../modules/both/orderCommon';
import handleMethodException from '../../modules/handle-method-exception';

const rzp = new Razorpay({
    key_id: Meteor.settings.private.Razor.merchantKey,
    key_secret: Meteor.settings.private.Razor.merchantKeySecret,
  });

Meteor.methods({
  'payment.insert': async function paymentInsert(inputParams) {
    check(inputParams, {
      razorpay_payment_id: String,
      orderId: String,
    });

    try {
      const order = Orders.findOne(inputParams.orderId);
      const balanceInvoicedAmountInPaise = orderCommon.getInvoiceTotals(order.invoices).balanceInvoicedAmount * 100;
      console.log(orderCommon.getInvoiceTotals(order.invoices));
      const response = await rzp.payments.capture(
        inputParams.razorpay_payment_id,
        balanceInvoicedAmountInPaise,
      );
      if (Meteor.isDevelopment) {
        console.log(response);
      } 
      return Payments.insert({
        orderId: order._id,
        paymentApiResponseObject: response,
      });
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
