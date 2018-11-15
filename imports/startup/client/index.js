import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import App from '/imports/ui/layouts/App/App';

import '/imports/ui/stylesheets/application.scss';

Meteor.startup(() => render(<App />, document.getElementById('react-root')));
