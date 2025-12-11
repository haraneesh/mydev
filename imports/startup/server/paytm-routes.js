import { WebApp } from 'meteor/webapp';
import { Meteor } from 'meteor/meteor';

if (Meteor.isServer) {
  WebApp.connectHandlers.use('/payment/callback', (req, res, next) => {
    if (req.method !== 'POST') {
      next();
      return;
    }

    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      // Parse the body manually since we don't have body-parser
      const params = new URLSearchParams(body);
      const paymentData = {};
      for (const [key, value] of params) {
        paymentData[key] = value;
      }

      console.log('Received Paytm Notification:', paymentData);

      // Simple HTML response to close the webview or indicate success
      // The Cordova plugin should intercept the URL change or completion
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Payment Processing</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: sans-serif; text-align: center; padding: 20px; }
              .success { color: green; }
              .error { color: red; }
            </style>
          </head>
          <body>
            <h3>Payment Processed</h3>
            <p>Please wait while we redirect you back to the app...</p>
            <script>
              // Attempt to notify parent window if in iframe/webview
              if (window.opener) {
                window.opener.postMessage({ type: 'PAYTM_PAYMENT_COMPLETED', data: ${JSON.stringify(paymentData)} }, '*');
              }
            </script>
          </body>
        </html>
      `;

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });
  });
}
