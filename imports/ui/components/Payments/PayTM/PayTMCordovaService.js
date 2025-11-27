import { Meteor } from 'meteor/meteor';

/**
 * PayTM Cordova Service
 * Handles native PayTM All-in-One SDK integration for Cordova/mobile apps
 */

class PayTMCordovaService {
  /**
   * Start a payment transaction using PayTM All-in-One SDK
   * @param {Object} params - Payment parameters
   * @param {string} params.txToken - Transaction token from server
   * @param {string} params.amount - Payment amount
   * @param {string} params.orderId - Order/transaction ID
   * @param {string} params.mid - Merchant ID
   * @param {Function} onSuccess - Success callback
   * @param {Function} onError - Error callback
   */
  startPayment({ txToken, amount, orderId, mid }, onSuccess, onError) {
    if (!Meteor.isCordova) {
      const error = new Error('PayTM Cordova plugin is only available in Cordova environment');
      console.error(error);
      onError(error);
      return;
    }

    // Check if the plugin is available
    if (!window.AllInOneSDK || !window.AllInOneSDK.startTransaction) {
      const error = new Error('PayTM Cordova plugin not found. Please ensure cordova-paytm-allinonesdk is installed.');
      console.error(error);
      onError(error);
      return;
    }

    // Prepare payment parameters for Cordova plugin
    const paymentParams = {
      mid: mid,
      orderId: orderId,
      txnToken: txToken,
      amount: amount,
      isStaging: Meteor.settings.public.PayTM.isStaging || false,
      restrictAppInvoke: false, // Allow web fallback if PayTM app not installed
      callbackUrl: `${Meteor.settings.public.AppURL}/paymentNotification`, // Same as web version
    };

    console.log('Starting PayTM Cordova payment with params:', {
      ...paymentParams,
      txnToken: '***' // Don't log sensitive token
    });

    // Start payment using Cordova plugin
    window.AllInOneSDK.startTransaction(
      paymentParams,
      (response) => {
        console.log('PayTM Cordova payment success:', response);
        
        // Transform Cordova response to match web format
        const standardizedResponse = this._standardizeResponse(response);
        onSuccess(standardizedResponse);
      },
      (error) => {
        console.error('PayTM Cordova payment error:', error);
        
        // Handle different error types
        if (error && error.STATUS) {
          // Payment was processed but failed
          const standardizedResponse = this._standardizeResponse(error);
          onSuccess(standardizedResponse); // Still call success to process the failed payment
        } else {
          // Plugin error or user cancellation
          onError(error);
        }
      }
    );
  }

  /**
   * Standardize PayTM Cordova response to match web response format
   * This ensures both platforms can use the same processing logic
   * @private
   */
  _standardizeResponse(cordovaResponse) {
    // Cordova plugin returns response in different format than web
    // Standardize to match the format expected by transactionStatus callback
    return {
      STATUS: cordovaResponse.STATUS || cordovaResponse.status || 'TXN_FAILURE',
      TXNAMOUNT: cordovaResponse.TXNAMOUNT || cordovaResponse.TXNAMT || cordovaResponse.amount || '0',
      TXNID: cordovaResponse.TXNID || cordovaResponse.txnId || '',
      CHECKSUMHASH: cordovaResponse.CHECKSUMHASH || cordovaResponse.checksumHash || '',
      RESPCODE: cordovaResponse.RESPCODE || cordovaResponse.respCode || '400',
      RESPMSG: cordovaResponse.RESPMSG || cordovaResponse.respMsg || cordovaResponse.message || 'Transaction failed',
      ORDERID: cordovaResponse.ORDERID || cordovaResponse.orderId || '',
      PAYMENTMODE: cordovaResponse.PAYMENTMODE || cordovaResponse.paymentMode || 'OTHER',
    };
  }

  /**
   * Check if PayTM Cordova plugin is available
   * @returns {boolean}
   */
  isAvailable() {
    return Meteor.isCordova && window.AllInOneSDK && typeof window.AllInOneSDK.startTransaction === 'function';
  }
}

// Export singleton instance
export default new PayTMCordovaService();
