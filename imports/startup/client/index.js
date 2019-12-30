import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import App from '../../ui/layouts/App/App';
import * as serviceWorker from './serviceWorker';

import '../../ui/stylesheets/application.scss';

Bert.defaults.style = 'growl-top-right';
Bert.defaults.type = 'default';

Meteor.startup(() => render(<App />, document.getElementById('react-root')));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
