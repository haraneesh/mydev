import { Meteor } from 'meteor/meteor';

const CONFIG = ({
  txToken, amount,
  suvaiTransactionId,
  showFeeOptions = true,
  callBackNotifyMerchant,
  callBackTransactionStatus,
}) => {
  const { merchantId, merchantName } = Meteor.settings.public.PayTM;
  const { AppURL } = Meteor.settings.public;

  const NOFEE = ['UPI'];
  const WITHFEE = ['NB', 'CARD'];

  return {
    style: {
      bodyBackgroundColor: '#fafafb',
      bodyColor: '',
      themeBackgroundColor: '#522E23',
      themeColor: '#ffffff',
      headerBackgroundColor: '#ffffff',
      headerColor: '#493934',
      errorColor: '',
      successColor: '',
      card: {
        padding: '',
        backgroundColor: '',
      },
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
      logo: `${AppURL}/logo.png`,
      redirect: false,
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
      labels: {},
      filter: {
        exclude: (!showFeeOptions) ? WITHFEE : NOFEE,
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
