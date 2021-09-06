import { Meteor } from 'meteor/meteor';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import Loading from '../../Loading/Loading';
import Spinner from '../../Common/Spinner/Spinner';
import CONFIG from './config';
import loadCheckOutPayTM from './loadCheckOutPayTM';

function PayTMButton({
  buttonText, paymentDetails, paymentResponseSuccess, showOptionsWithFee,
}) {
  const [isLoading, setIsLoading] = useState(false);

  function notifyMerchantHandler(eventName, data) {
    console.log('notifyMerchant handler function called ');
    console.log('eventName ', eventName);
    console.log('data ', data);
  }

  useEffect(() => {
    loadCheckOutPayTM(() => { console.log('loaded'); });
  }, []);

  function transactionStatus(paymentStatus) {
    if (window.Paytm && window.Paytm.CheckoutJS) {
      // after successfully updating configuration, invoke JS Checkout
      window.Paytm.CheckoutJS.close();
    }
    if (paymentStatus.STATUS === 'TXN_FAILURE') {
      toast.error(paymentStatus.RESPMSG);
      return;
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
      paymentResponseSuccess(error, result);
    });
  }

  function showPayScreen({
    txToken, amount, suvaiTransactionId,
  }) {
    const config = CONFIG({
      txToken,
      amount,
      suvaiTransactionId,
      callBackNotifyMerchant: notifyMerchantHandler,
      callBackTransactionStatus: transactionStatus,
      showOptionsWithFee,
    });

    if (window.Paytm && window.Paytm.CheckoutJS) {
      // initialize configuration using init method
      window.Paytm.CheckoutJS.init(config).then(() => {
        // after successfully updating configuration, invoke JS Checkout
        window.Paytm.CheckoutJS.invoke();
        setIsLoading(false);
      }).catch((error) => {
        console.log('PayTM Button error: ', error);
        setIsLoading(false);
      });
    }
  }

  function getSavedCreditCards(txToken, mobile, suvaiTransactionId) {
    const transactionObject = {
      token: txToken,
      mobile,
      suvaiTransactionId,
    };

    Meteor.call('payment.paytm.getSavedCreditCards', transactionObject, (error, result) => {

    });
  }

  function initiateTransaction() {
    setIsLoading(true);

    const amount = paymentDetails.moneyToChargeInRs.toString();

    const transactionObject = {
      amount,
      mobile: paymentDetails.prefill.mobile,
      firstName: paymentDetails.prefill.firstName,
      lastName: paymentDetails.prefill.lastName,
      showOptionsWithFee,
    };
    Meteor.call('payment.paytm.initiateTransaction', transactionObject, (error, result) => {
      if (result && result.status === 'S') {
        // getSavedCreditCards(result.txToken, paymentDetails.prefill.mobile, result.suvaiTransactionId); // to delete

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
    });
  }

  return (
    <div>
      {(isLoading) && (<Loading />)}

      <button
        type="button"
        className={`btn ${!showOptionsWithFee ? 'btn-primary' : 'btn-default'}`}
        onClick={initiateTransaction}
        disabled={!!isLoading}
      >
        {buttonText}
        {' '}
        {(isLoading) && <Spinner />}
      </button>

    </div>

  );
}

PayTMButton.defaultProps = {
  buttonText: 'Pay Now',
  showOptionsWithFee: true,
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
  paymentDetails: PropTypes.object,
  paymentResponseSuccess: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  showOptionsWithFee: PropTypes.bool,
};

export default PayTMButton;
