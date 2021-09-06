import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import Root from '../../ui/apps/Root';
import './config/toastConfig';

import '../../ui/stylesheets/application.scss';

Meteor.startup(() => {
  if ('serviceWorker' in navigator) {
    // const serviceWorkerUrl = (process.env.NODE_ENV === 'production') ? 'https://nammasuvai.com/js/sw.js' : '/sw.js';
    navigator.serviceWorker.register(`${window.location.origin}/sw.js`)
      .then(() => {})
      .catch((err) => console.log('ServiceWorker registration failed: ', err));
  }

  return render(<Root />, document.getElementById('react-root'));
});
