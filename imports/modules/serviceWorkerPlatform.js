export const shouldRegisterBrowserServiceWorker = ({
  meteor,
  browserWindow,
} = {}) => !meteor?.isCordova && !browserWindow?.cordova;
