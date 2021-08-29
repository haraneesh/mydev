import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import Root from '../../ui/apps/Root';
import './config/toastConfig';
import addToHomescreen from '../../ui/components/AddToHomeScreen/AddToHomeScreen';

import '../../ui/stylesheets/application.scss';

Meteor.startup(() => {
  if ('serviceWorker' in navigator) {
    // const serviceWorkerUrl = (process.env.NODE_ENV === 'production') ? 'https://nammasuvai.com/js/sw.js' : '/sw.js';
    navigator.serviceWorker.register(`${window.location.origin}/js/sw.js`).then().catch((err) => console.log('ServiceWorker registration failed: ', err));
  }

  const ath = addToHomescreen({
    autostart: true,
    lifespan: 5,
    logging: true,
    minSessions: 2,
    onShow() {
      console.log('showing');
    },
    onInit() {
      console.log('initializing');
    },
    onAdd() {
      console.log('adding');
    },
    onInstall() {
      console.log('Installing');
    },
    onCancel() {
      console.log('Cancelling');
    },
    customCriteria: true,
    displayPace: 10,
    customPrompt: {
      title: 'custom message',
      src: 'https://love2dev.com/meta/android/android-launchericon-48-48.png',
      cancelMsg: 'go away',
      installMsg: 'do it',
    },
  });

  // ath.trigger();

  return render(<Root />, document.getElementById('react-root'));
});

// Meteor.startup(() => render(<App />, document.getElementById('react-root')));
