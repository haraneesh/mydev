const loadCheckOutRzr = callback => {
  // const scriptId = 'razorPay';
  // const existingScript = document.getElementById(scriptId)//;

  // if (!existingScript) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.async = false;
  // script.id = scriptId;
  document.body.appendChild(script);

  script.onload = () => {
    if (callback) callback();
  };
};

export default loadCheckOutRzr;
