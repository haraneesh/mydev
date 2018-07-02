import { Meteor } from 'meteor/meteor';

const loadPayUBoltScript = (callback) => {
  const existingScript = document.getElementById('googleMaps');

  if (!existingScript) {
    const script = document.createElement('script');
    if (Meteor.isProduction) {
      script.src = 'https://checkout-static.citruspay.com/bolt/run/bolt.min.js';
    } else {
      script.src = 'https://sboxcheckout-static.citruspay.com/bolt/run/bolt.min.js';
    }
    script.id = 'bolt';
    document.body.appendChild(script);

    script.onload = () => {
      if (callback) callback();
    };
  }
};

export default loadPayUBoltScript;