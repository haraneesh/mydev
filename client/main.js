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
// Test PayTM Plugin Availability
Meteor.startup(() => {
  if (Meteor.isCordova) {
    console.log('=== PAYTM PLUGIN TEST ===');
    
    // Wait for device to be ready
    document.addEventListener('deviceready', () => {
      console.log('Device is ready, checking PayTM plugin...');
      
      // Check if AllInOneSDK is available
      const checkPayTM = () => {
        console.log('Window object keys:', Object.keys(window).join(', '));
        
        if (window.AllInOneSDK) {
          console.log('AllInOneSDK found!');
          console.log('Available methods:', Object.keys(window.AllInOneSDK).join(', '));
          
          if (typeof window.AllInOneSDK.startTransaction === 'function') {
            console.log('startTransaction is available');
          } else {
            console.error('startTransaction is NOT available');
          }
        } else {
          console.error('AllInOneSDK not found in window object');
          // Try again after a delay if not found immediately
          setTimeout(checkPayTM, 2000);
        }
      };
      
      // Initial check
      checkPayTM();
    }, false);
  }
});

if (!isCordova) {
  import('/imports/infra/serviceWorkerInit')
    .then(() => console.log('serviceWorkerInit loaded'))
    .catch((err) => console.error('Failed to load serviceWorkerInit', err));
} else {
  console.log('Cordova detected: skipping service worker initialization');
}
