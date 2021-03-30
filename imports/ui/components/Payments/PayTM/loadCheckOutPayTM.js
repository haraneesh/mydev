import { Meteor } from 'meteor/meteor';

const loadCheckOutPayTM = (
  callback,
) => {
  const { hostName, merchantId } = Meteor.settings.public.PayTM;
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = `https://${hostName}/merchantpgpui/checkoutjs/merchants/${merchantId}.js`;
  script.async = true;
  script.crossorigin = 'anonymous';
  document.body.appendChild(script);

  script.onload = () => {
    if (callback) callback();
  };
};

export default loadCheckOutPayTM;
