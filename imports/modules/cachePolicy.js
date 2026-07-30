export const HTML_CACHE_CONTROL = 'no-store, no-cache, must-revalidate';

export const getCacheControlForRequest = ({ method, headers = {} }) => {
  if (method !== 'GET' && method !== 'HEAD') {
    return undefined;
  }

  const accept = headers.accept || '';
  const fetchMode = headers['sec-fetch-mode'];
  const isHtmlNavigation =
    fetchMode === 'navigate' || accept.includes('text/html');

  return isHtmlNavigation ? HTML_CACHE_CONTROL : undefined;
};
