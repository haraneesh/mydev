import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import Root from '../../ui/apps/Root';
import './config/toastConfig';

import '../../ui/stylesheets/application.scss';

Meteor.startup(() => {
  if ('serviceWorker' in navigator) {
    // Register service worker
    navigator.serviceWorker
      .register(`${window.location.origin}/sw.js?v1`)
      .then(() => {})
      .catch((err) => console.log('ServiceWorker registration failed: ', err));
  }
  const container = document.getElementById('react-target');
  return render(<Root />, container);
});
