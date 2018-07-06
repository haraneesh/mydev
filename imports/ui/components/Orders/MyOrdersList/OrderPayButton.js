import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import { formatMoney } from 'accounting-js';
import RazorPayButton from '../../Payments/RazorPay/RazorPayButton';
import { accountSettings } from '../../../../modules/settings';

const paymentResponseSuccess = (paymentSuccessMsg, orderId, refreshPage) => {
  if (!paymentSuccessMsg.razorpay_payment_id) {
    Bert.alert(
      'We were unable to process your payment at this time. Please try a little later.',
      'danger',
    );
    return;
  }
  Meteor.call(
    'payment.insert',
    {
      razorpay_payment_id: paymentSuccessMsg.razorpay_payment_id,
      orderId,
    },
    (error, paymentId) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const confirmation =
          'Thank you, Payment has been processed successfully!';
        Bert.alert(confirmation, 'success');
        refreshPage();
      }
    },
  );
};

const OrderPayButton = ({
  orderId,
  loggedInUser,
  defaultMoneyToChargeInRupees,
  refreshPage,
}) => (
  <RazorPayButton
    buttonText={`Pay ${formatMoney(
      defaultMoneyToChargeInRupees,
      accountSettings,
    )}`}
    paymentDetails={{
      defaultMoneyToChargeInPaise: defaultMoneyToChargeInRupees * 100,
      description: '',
      order_id: orderId,
      prefill: {
        name: `${loggedInUser.profile.name.first} ${
          loggedInUser.profile.name.last
        }`,
        email: loggedInUser.emails[0].address,
        contact: loggedInUser.profile.whMobilePhone,
      },
      notes: {
        address: loggedInUser.profile.deliveryAddress,
      },
    }}
    paymentResponseSuccess={paymentSuccessMsg => {
      paymentResponseSuccess(paymentSuccessMsg, orderId, refreshPage);
    }}
  />
);

export default OrderPayButton;

OrderPayButton.propTypes = {
  defaultMoneyToChargeInRupees: PropTypes.number.isRequired,
  loggedInUser: PropTypes.object.isRequired,
  orderId: PropTypes.string.isRequired,
  refreshPage: PropTypes.func.isRequired,
};
