import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { toast, Slide } from 'react-toastify';
import Root from '../../ui/apps/Root';
// import * as serviceWorker from './serviceWorker';

import '../../ui/stylesheets/application.scss';

toast.configure({
  position: toast.POSITION.TOP_CENTER,
  autoClose: 3000,
  pauseOnHover: true,
  transition: Slide,
  hideProgressBar: true,
});

Meteor.startup(() => {
  if ('serviceWorker' in navigator) {
    // const serviceWorkerUrl = (process.env.NODE_ENV === 'production') ? 'https://nammasuvai.com/sw.js' : '/sw.js';
    navigator.serviceWorker.register(`${window.location.origin}/sw.js`).then().catch((err) => console.log('ServiceWorker registration failed: ', err));
  }
  /* serviceWorker.register();

  console.log(`window.location.origin ${window.location.origin}`);
  console.log(`window.location.href ${window.location.href}`);
  console.log(`process.env.PUBLIC_URL ${process.env.PUBLIC_URL}`); */

  return render(<Root />, document.getElementById('react-root'));
});

// Meteor.startup(() => render(<App />, document.getElementById('react-root')));
