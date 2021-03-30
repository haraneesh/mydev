import { Meteor } from 'meteor/meteor';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Loading from '../../Loading/Loading';
import CONFIG from './config';
import loadCheckOutPayTM from './loadCheckOutPayTM';

function PayTMButton({
  buttonText, paymentDetails, paymentResponseSuccess,
}) {
  const [isWaitingForToken, setIsWaitingForToken] = useState(false);
  const [isScriptLoading, setIsScriptLoading] = useState(true);

  useEffect(() => {
    setIsScriptLoading(true);
    loadCheckOutPayTM(() => {
      setIsScriptLoading(false);
    });
  }, []);

  function notifyMerchantHandler(eventName, data) {
    console.log('notifyMerchant handler function called');
    console.log('eventName => ', eventName);
    console.log('data => ', data);
  }

  function transactionStatus(paymentStatus) {
    console.log('paymentStatus => ', paymentStatus);

    if (window.Paytm && window.Paytm.CheckoutJS) {
      // after successfully updating configuration, invoke JS Checkout
      window.Paytm.CheckoutJS.close();
    }

    const transactionDetails = {
      STATUS: paymentStatus.STATUS,
      TXNAMOUNT: paymentStatus.TXNAMOUNT,
      TXNID: paymentStatus.TXNID,
      CHECKSUMHASH: paymentStatus.CHECKSUMHASH,
      RESPCODE: paymentStatus.RESPCODE,
      RESPMSG: paymentStatus.RESPMSG,
      ORDERID: paymentStatus.ORDERID,
      PAYMENTMODE: paymentStatus.PAYMENTMODE,
    };

    Meteor.call('payment.paytm.completeTransaction', transactionDetails, (error, result) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success('Payment has been successfully processed');
      }
    });
  }

  function showPayScreen({ txToken, amount, suvaiTransactionId }) {
    const config = CONFIG({
      txToken,
      amount,
      suvaiTransactionId,
      callBackNotifyMerchant: notifyMerchantHandler,
      callBackTransactionStatus: transactionStatus,
    });

    if (window.Paytm && window.Paytm.CheckoutJS) {
      // initialize configuration using init method
      window.Paytm.CheckoutJS.init(config).then(() => {
        // after successfully updating configuration, invoke JS Checkout
        window.Paytm.CheckoutJS.invoke();
      }).catch((error) => {
        console.log('error => ', error);
      });
    }
  }

  function initiateTransaction() {
    setIsWaitingForToken(true);
    const amount = paymentDetails.moneyToChargeInRs.toString();
    const transactionObject = {
      amount,
      mobile: paymentDetails.prefill.mobile,
      firstName: paymentDetails.prefill.firstName,
      lastName: paymentDetails.prefill.lastName,
    };
    Meteor.call('payment.paytm.initiateTransaction', transactionObject, (error, result) => {
      if (result && result.status === 'S') {
        showPayScreen({
          txToken: result.txToken,
          amount,
          suvaiTransactionId: result.suvaiTransactionId,
        });
      } else if (result && result.status === 'F') {
        toast.error(result.errorMsg);
      } else if (error) {
        toast.error(error.reason);
      }

      setIsWaitingForToken(false);
    });
  }

  return (
    <div>
      {!!isWaitingForToken && (<Loading />)}
      {!isScriptLoading && (
      <button
        type="button"
        className="btn btn-sm btn-default"
        onClick={initiateTransaction}
      >
        {buttonText}
      </button>
      )}
    </div>

  );
}

PayTMButton.defaultProps = {
  buttonText: 'Add Money',
  paymentDetails: {
    moneyToChargeInRs: 0,
    description: '',
    prefill: {
      firstName: '',
      lastName: '',
      mobile: '',
    },
  },
};

PayTMButton.propTypes = {
  paymentDetails: PropTypes.object.isRequired,
  paymentResponseSuccess: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
};

export default PayTMButton;
