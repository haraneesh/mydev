import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import App from '../../ui/layouts/App/App';
//import * as serviceWorker from './serviceWorker';

import '../../ui/stylesheets/application.scss';

Bert.defaults.style = 'growl-top-right';
Bert.defaults.type = 'default';

Meteor.startup(() => {

  //const serviceWorkerUrl = (process.env.NODE_ENV === 'production') ? 'https://nammasuvai.com/sw.js' : '/sw.js';
  navigator.serviceWorker.register(`${window.location.origin}/sw.js`).then().catch(err => console.log('ServiceWorker registration failed: ', err));

  /*serviceWorker.register();

  console.log(`window.location.origin ${window.location.origin}`);
  console.log(`window.location.href ${window.location.href}`);
  console.log(`process.env.PUBLIC_URL ${process.env.PUBLIC_URL}`);*/

  return render(<App />, document.getElementById('react-root'));
});

//Meteor.startup(() => render(<App />, document.getElementById('react-root')));
