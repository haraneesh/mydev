import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Root from '/imports/ui/apps/Root';
import '/imports/startup/client/index';
import '/imports/infra/one-signal';
import '/imports/ui/stylesheets/application.scss';

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container);
  root.render(<Root />);
});

// Conditionally initialize the service worker only when not running in Cordova.
// We intentionally avoid importing `/imports/infra/serviceWorkerInit` statically
// because that module registers a service worker immediately on import.
const isCordova = (typeof Meteor !== 'undefined' && Meteor.isCordova) || (typeof window !== 'undefined' && !!window.cordova);
if (!isCordova) {
  import('/imports/infra/serviceWorkerInit')
    .then(() => console.log('serviceWorkerInit loaded'))
    .catch((err) => console.error('Failed to load serviceWorkerInit', err));
} else {
  console.log('Cordova detected: skipping service worker initialization');
}
