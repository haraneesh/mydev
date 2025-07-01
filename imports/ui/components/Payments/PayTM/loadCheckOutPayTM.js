import { Meteor } from 'meteor/meteor';

const loadCheckOutPayTM = (callback) => {
  const { hostName, merchantId, scriptID } = Meteor.settings.public.PayTM;

  const SCRIPTID = scriptID;
  const isScriptExist = document.getElementById(SCRIPTID);

  if (!isScriptExist) {
    const scriptElement = document.createElement('script');
    scriptElement.type = 'application/javascript';
    scriptElement.src = `https://${hostName}/merchantpgpui/checkoutjs/merchants/${merchantId}.js`;
    scriptElement.crossOrigin = 'anonymous';
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
