import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import App from '../../ui/layouts/App/App';

import '../../ui/stylesheets/application.scss';

Bert.defaults.style = 'growl-top-right';
Bert.defaults.type = 'default';

Meteor.startup(() => {

  const serviceWorkerUrl = (process.env.NODE_ENV === 'production')? 'https://www.nammasuvai.com/sw.js' : '/sw.js';
  navigator.serviceWorker.register(serviceWorkerUrl) .then() .catch(error => console.log('ServiceWorker registration failed: ', err));

  return render(<App />, document.getElementById('react-root'));
});

//Meteor.startup(() => render(<App />, document.getElementById('react-root')));
