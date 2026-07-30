import { WebApp } from 'meteor/webapp';
import { getCacheControlForRequest } from '../../modules/cachePolicy';

WebApp.rawConnectHandlers.use((request, response, next) => {
  const cacheControl = getCacheControlForRequest(request);

  if (cacheControl) {
    response.setHeader('Cache-Control', cacheControl);
    response.setHeader('Surrogate-Control', 'no-store');
  }

  next();
});
