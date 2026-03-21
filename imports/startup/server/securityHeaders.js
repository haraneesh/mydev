// https://guide.meteor.com/security.html
/* global __meteor_runtime_config__ */
import { Meteor } from 'meteor/meteor'
import { WebApp } from 'meteor/webapp'
import { Autoupdate } from 'meteor/autoupdate'
import { check } from 'meteor/check'
import crypto from 'crypto'
import helmet from 'helmet'

const self = '\'self\''
const data = 'data:'
const unsafeEval = '\'unsafe-eval\''
const unsafeInline = '\'unsafe-inline\''
const allowedOrigins = Meteor.settings.private.allowedOrigins

// create the default connect source for our current domain in
// a multi-protocol compatible way (http/ws or https/wss)
const url = Meteor.absoluteUrl()
const domain = url.replace(/http(s)*:\/\//, '').replace(/\/$/, '')
const s = url.match(/(?!=http)s(?=:\/\/)/) ? 's' : ''
const usesHttps = s.length > 0
const connectSrc = [
  self,
  `http${s}://${domain}`,
  `ws${s}://${domain}`
]

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
  isModern: true
})

// add client versions to __meteor_runtime_config__
Object.keys(WebApp.clientPrograms).forEach(arch => {
  __meteor_runtime_config__.versions[arch] = {
    version: Autoupdate.autoupdateVersion || WebApp.clientPrograms[arch].version(),
    versionRefreshable: Autoupdate.autoupdateVersion || WebApp.clientPrograms[arch].versionRefreshable(),
    versionNonRefreshable: Autoupdate.autoupdateVersion || WebApp.clientPrograms[arch].versionNonRefreshable(),
    // comment the following line if you use Meteor < 2.0
    versionReplaceable: Autoupdate.autoupdateVersion || WebApp.clientPrograms[arch].versionReplaceable()
  }
})

const runtimeConfigScript = `__meteor_runtime_config__ = JSON.parse(decodeURIComponent("${encodeURIComponent(JSON.stringify(runtimeConfig))}"))`
const runtimeConfigHash = crypto.createHash('sha256').update(runtimeConfigScript).digest('base64')

const helpmentOptions = {
  contentSecurityPolicy: {
    blockAllMixedContent: true,
    directives: {
      defaultSrc: [self],
      scriptSrc: [
        self,
        // Remove / comment out unsafeEval if you do not use dynamic imports
        // to tighten security. However, if you use dynamic imports this line
        // must be kept in order to make them work.
        unsafeEval,
        `'sha256-${runtimeConfigHash}'`
      ],
      childSrc: [self],
      // If you have external apps, that should be allowed as sources for
      // connections or images, your should add them here
      // Call helmetOptions() without args if you have no external sources
      // Note, that this is just an example and you may configure this to your needs
      connectSrc: connectSrc.concat(allowedOrigins),
      fontSrc: [self, data],
      formAction: [self],
      frameAncestors: [self],
      frameSrc: ['*'],
      // This is an example to show, that we can define to show images only
      // from our self, browser data/blob and a defined set of hosts.
      // Configure to your needs.
      imgSrc: [self, data, 'blob:'].concat(allowedOrigins),
      manifestSrc: [self],
      mediaSrc: [self],
      objectSrc: [self],
      // these are just examples, configure to your needs, see
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/sandbox
      sandbox: [
        // allow-downloads-without-user-activation // experimental
        'allow-forms',
        'allow-modals',
        // 'allow-orientation-lock',
        // 'allow-pointer-lock',
        // 'allow-popups',
        // 'allow-popups-to-escape-sandbox',
        // 'allow-presentation',
        'allow-same-origin',
        'allow-scripts',
        // 'allow-storage-access-by-user-activation ', // experimental
        // 'allow-top-navigation',
        // 'allow-top-navigation-by-user-activation'
      ],
      styleSrc: [self, unsafeInline],
      workerSrc: [self, 'blob:']
    }
  },
  // see the helmet documentation to get a better understanding of
  // the following configurations and settings
  strictTransportSecurity: {
    maxAge: 15552000,
    includeSubDomains: true,
    preload: false
  },
  referrerPolicy: {
    policy: 'no-referrer'
  },
  expectCt: {
    enforce: true,
    maxAge: 604800
  },
  frameguard: {
    action: 'sameorigin'
  },
  dnsPrefetchControl: {
    allow: false
  },
  permittedCrossDomainPolicies: {
    permittedPolicies: 'none'
  }
}

// We assume, that we are working on a localhost when there is no https
// connection available.
// Run your project with --production flag to simulate script-src hashing
if (!usesHttps && Meteor.isDevelopment) {
  delete helpmentOptions.contentSecurityPolicy.blockAllMixedContent;
  helpmentOptions.contentSecurityPolicy.directives.scriptSrc = [
    self,
    unsafeEval,
    unsafeInline,
  ];
}

// finally pass the options to helmet to make them apply
helmet(helpmentOptions)