import { Meteor } from 'meteor/meteor';

const loadCheckOutPayTM = (callback) => {
  const { hostName, merchantId } = Meteor.settings.public.PayTM;

  const SCRIPTID = 'payTMScript1234';
  const isScriptExist = document.getElementById(SCRIPTID);

  if (!isScriptExist) {
    const scriptElement = document.createElement('script');
    scriptElement.type = 'application/javascript';
    scriptElement.src = `https://${hostName}/merchantpgpui/checkoutjs/merchants/${merchantId}.js`;
    scriptElement.async = true;
    scriptElement.id = SCRIPTID;
    scriptElement.onload = () => {
      callback();
    };
    scriptElement.onerror = (error) => {
      console.error('PayTM Checkout', error);
    };
    document.body.appendChild(scriptElement);
  }

  if (isScriptExist && callback) callback();
};

export default loadCheckOutPayTM;
