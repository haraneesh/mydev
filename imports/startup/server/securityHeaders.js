/* global __meteor_runtime_config__ */
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { Autoupdate } from 'meteor/autoupdate';
import crypto from 'crypto';

import helmet from 'helmet';

const self = '\'self\'';
const data = 'data:';
const unsafeEval = '\'unsafe-eval\'';
const unsafeInline = '\'unsafe-inline\'';
const { allowedOrigins } = Meteor.settings.private;

// create the default connect source for our current domain in
// a multi-protocol compatible way (http/ws or https/wss)
const url = Meteor.absoluteUrl();
const domain = url.replace(/http(s)*:\/\//, '').replace(/\/$/, '');
const s = url.match(/(?!=http)s(?=:\/\/)/) ? 's' : '';
const connectSrc = [
  self,
  `http${s}://${domain}`,
  `ws${s}://${domain}`,
];

// Prepare runtime config for generating the sha256 hash
// It is important, that the hash meets exactly the hash of the
// script in the client bundle.
// Otherwise the app would not be able to start, since the runtimeConfigScript
// is rejected __meteor_runtime_config__ is not available, causing
// a cascade of follow-up errors.
const runtimeConfig = Object.assign(__meteor_runtime_config__, Autoupdate, {
  // the following lines may depend on, whether you called Accounts.config
  // and whether your Meteor app is a "newer" version
  accountsConfigCalled: true,
  isModern: true,
});

// add client versions to __meteor_runtime_config__
Object.keys(WebApp.clientPrograms).forEach((arch) => {
  __meteor_runtime_config__.versions[arch] = {
    version: Autoupdate.autoupdateVersion
    || WebApp.clientPrograms[arch].version(),
    versionRefreshable: Autoupdate.autoupdateVersion
    || WebApp.clientPrograms[arch].versionRefreshable(),
    versionNonRefreshable: Autoupdate.autoupdateVersion
    || WebApp.clientPrograms[arch].versionNonRefreshable(),
    // comment the following line if you use Meteor < 2.0
    versionReplaceable: Autoupdate.autoupdateVersion
    || WebApp.clientPrograms[arch].versionReplaceable(),
  };
});

const runtimeConfigScript = `__meteor_runtime_config__ = JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(runtimeConfig))}"))`;
const runtimeConfigHash = crypto.createHash('sha256').update(runtimeConfigScript).digest('base64');

const options = {
  directives: {
    defaultSrc: [self].concat(allowedOrigins),
    // scriptSrc: [self, unsafeEval, `'sha256-${runtimeConfigHash}'`].concat(allowedOrigins),
    connectSrc: connectSrc.concat(allowedOrigins), // ['*']
    imgSrc: [self, data, 'blob:'].concat(allowedOrigins),
    styleSrc: [self, unsafeInline].concat(allowedOrigins),
    fontSrc: [self, data].concat(allowedOrigins),
    manifestSrc: [self],
  },
  strictTransportSecurity: {
    maxAge: 15552000,
    includeSubDomains: true,
    preload: true,
  },
};

// if (Meteor.isDevelopment) {
options.directives.scriptSrc = [self, unsafeEval, unsafeInline].concat(allowedOrigins);
// }

WebApp.connectHandlers.use(
  helmet.contentSecurityPolicy(options),
);
