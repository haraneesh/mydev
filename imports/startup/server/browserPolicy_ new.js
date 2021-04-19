import { WebApp } from 'meteor/webapp';

import helmet from 'helmet';

// Within server side Meter.startup()
WebApp.connectHandlers.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ['*'],
      imgSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
    browserSniff: false,
  }),
);


// Cache control
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Strict-Transport-Security', 'max-age=86400; includeSubDomains');
// Prevent Adobe stuff loading content on our site
res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
// Frameguard - https://helmetjs.github.io/docs/frameguard/
res.setHeader('X-Frame-Options', 'DENY');
// X-XSS protection
res.setHeader('X-XSS-Protection', '1; mode=block');
// No content sniffing
res.setHeader('X-Content-Type-Options', 'nosniff');
// DNS pre-fetching
res.setHeader('X-DNS-Prefetch-Control', 'off');
// Expect CT
res.setHeader('Expect-CT', 'enforce, max-age=604800');
// Links referrer policy
res.setHeader('Referrer-Header', 'same-origin');
// Prevent IE from executing downloads in page content
res.setHeader('X-Download-Options', 'noopen');

// Content security policy
const csp = [
  'default-src',
  "'self'",
  'data:',
  ';',
  'connect-src',
  `http${s}://${domain}`,
  `ws${s}://${domain}`,
  `blob:`,
  ...
  ];
  res.setHeader('Content-Security-Policy', csp.join(' '));
  return next();
});