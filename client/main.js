import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Root from '/imports/ui/apps/Root';
import '/imports/startup/client/index';
import '/imports/ui/stylesheets/application.scss';

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container);
  root.render(<Root />);
});
