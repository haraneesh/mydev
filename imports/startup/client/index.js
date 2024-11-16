import { Meteor } from 'meteor/meteor';
import React from 'react';
import { render } from 'react-dom';
import Root from '../../ui/apps/Root';
import './config/toastConfig';

import '../../ui/stylesheets/application.scss';

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  alert('here');
  return render(<Root />, container);
});
