import { Meteor } from 'meteor/meteor';

const CONFIG = ({
  txToken, amount,
  suvaiTransactionId,
  showOptionsWithFee = true,
  callBackNotifyMerchant,
  callBackTransactionStatus,
}) => {
  const { merchantId, merchantName } = Meteor.settings.public.PayTM;

  const NOFEE = ['UPI', 'DEBIT_CARD', 'QR_PAY', 'PTM_QR_PAY'];
  const WITHFEE = ['NB', 'CREDIT_CARD', 'QR_PAY', 'PTM_QR_PAY'];

  return {
    style: {
      bodyBackgroundColor: '#fafafb',
      bodyColor: '',
      themeBackgroundColor: '#522E23',
      themeColor: '',
      headerBackgroundColor: '#493934',
      headerColor: '#ffffff',
      errorColor: '',
      successColor: '',
    },
    jsFile: '',
    data: {
      orderId: suvaiTransactionId,
      amount,
      token: txToken,
      tokenType: 'TXN_TOKEN',
      userDetail: {
        mobileNumber: '',
        name: '',
      },
    },
    merchant: {
      mid: merchantId,
      name: merchantName,
      logo: '/logo.png',
      redirect: false,
      hidePaytmBranding: true,
    },
    handler: {
      notifyMerchant(eventName, data) {
        callBackNotifyMerchant(eventName, data);
      },
      transactionStatus(paymentStatus) {
        callBackTransactionStatus(paymentStatus);
      },
    },
    mapClientMessage: {},
    labels: {},
    payMode: {
      labels: {
        UPI: 'UPI - BHIM Pay, Google Pay, Phone Pe, Amazon Pay, AXIS, HDFC, ICICI, Others Banks',
        CARD: (!showOptionsWithFee) ? 'Debit Card' : 'Credit Card',
      },
      filter: {
        exclude: (!showOptionsWithFee) ? WITHFEE : NOFEE,
      },
      order: [
        'UPI',
        'NB',
        'CARD',
      ],
    },
    flow: 'DEFAULT',
  };
};

export default CONFIG;
