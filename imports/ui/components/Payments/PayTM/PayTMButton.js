import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Spinner from '../../Common/Spinner/Spinner';
import Loading from '../../Loading/Loading';
import CONFIG from './config';
import loadCheckOutPayTM from './loadCheckOutPayTM';

function PayTMButton({
  buttonText = 'Pay Now',
  paymentDetails = {
    moneyToChargeInRs: 0,
    description: '',
    prefill: {
      firstName: '',
      lastName: '',
      mobile: '',
    },
    cartTotalBillAmount: 0,
  },
  paymentResponseSuccess,
  showOptionsWithFee = true,
}) {
  const [isLoading, setIsLoading] = useState(false);

  function notifyMerchantHandler(eventName, data, orderId) {
    Meteor.call('payment.paytm.paymentTransactionError', {
      ORDERID: orderId,
      errorObject: { eventName, data },
    });
  }

  useEffect(() => {
    loadCheckOutPayTM(() => {
      console.log('loaded');
    });
  }, []);

  function transactionStatus(paymentStatus) {
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

    // if (paymentStatus.STATUS === 'TXN_FAILURE') {
    // Meteor.call('payment.paytm.paymentTransactionError',
    // { ORDERID: paymentStatus.ORDERID, errorObject: paymentStatus.RESPMSG });
    // toast.error(paymentStatus.RESPMSG);
    // return;
    // }

    Meteor.call(
      'payment.paytm.completeTransaction',
      transactionDetails,
      (error, result) => {
        if (error) {
          toast.error(error.reason);
        } else {
          if (window.Paytm && window.Paytm.CheckoutJS) {
            // after successfully updating configuration, invoke JS Checkout
            window.Paytm.CheckoutJS.close();
          }
          paymentResponseSuccess(result);
        }
      },
    );
  }

  function showPayScreen({ txToken, amount, suvaiTransactionId }) {
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
      window.Paytm.CheckoutJS.init(config)
        .then(() => {
          // after successfully updating configuration, invoke JS Checkout
          window.Paytm.CheckoutJS.invoke();
          setIsLoading(false);
        })
        .catch((error) => {
          Meteor.call('payment.paytm.paymentTransactionError', {
            ORDERID: suvaiTransactionId,
            errorObject: error,
          });
          // console.log('PayTM Button error: ', error);
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

    Meteor.call(
      'payment.paytm.getSavedCreditCards',
      transactionObject,
      (error, result) => {},
    );
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
      cartTotalBillAmount: paymentDetails.cartTotalBillAmount
        ? paymentDetails.cartTotalBillAmount * 100
        : 0,
    };
    Meteor.call(
      'payment.paytm.initiateTransaction',
      transactionObject,
      (error, result) => {
        if (result && result.status === 'S') {
          // getSavedCreditCards(result.txToken, paymentDetails.prefill.mobile, result.suvaiTransactionId);
          // to delete

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
      },
    );
  }

  return (
    <div>
      {isLoading && <Loading />}

      <button
        type="button"
        className={`btn ${!showOptionsWithFee ? 'btn-secondary' : 'btn-primary'}`}
        onClick={initiateTransaction}
        disabled={!!isLoading}
      >
        {buttonText} {isLoading && <Spinner />}
      </button>
    </div>
  );
}

PayTMButton.propTypes = {
  paymentDetails: PropTypes.object,
  paymentResponseSuccess: PropTypes.func.isRequired,
  buttonText: PropTypes.string,
  showOptionsWithFee: PropTypes.bool,
};

export default PayTMButton;
