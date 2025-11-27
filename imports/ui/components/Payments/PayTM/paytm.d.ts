/**
 * Type declarations for PayTM Cordova plugin and web SDK
 * This file extends the Window interface to include PayTM objects
 */

interface AllInOneSDKPlugin {
  startTransaction(
    params: {
      mid: string;
      orderId: string;
      txnToken: string;
      amount: string;
      isStaging: boolean;
    },
    successCallback: (response: any) => void,
    errorCallback: (error: any) => void
  ): void;
}

interface PayTMCheckoutJS {
  init(config: any): Promise<void>;
  invoke(): void;
  close(): void;
}

interface PayTMWeb {
  CheckoutJS: PayTMCheckoutJS;
}

declare global {
  interface Window {
    AllInOneSDK?: AllInOneSDKPlugin;
    Paytm?: PayTMWeb;
  }
}

export {};
