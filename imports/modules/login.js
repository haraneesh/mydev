/* eslint-disable no-undef */

import { browserHistory } from 'react-router';
import { Meteor } from 'meteor/meteor';
import { Bert } from 'meteor/themeteorchef:bert';
import './validation.js';

let component;

const login = () => {
  //const email = document.querySelector('[name="emailAddress"]').value;
  const username = document.querySelector('[name="whMobilePhone"]').value;
  const password = document.querySelector('[name="password"]').value;

  Meteor.loginWithPassword(username, password, (error) => {
    if (error) {
      Bert.alert(error.reason, 'warning');
    } else {
      Bert.alert('Logged in!', 'success');

      const { location } = component.props;
      if (location.state && location.state.nextPathname) {
        browserHistory.push(location.state.nextPathname);
      } else {
        browserHistory.push('/');
      }
    }
  });
};

const validate = () => {
  $(component.loginForm).validate({
    rules: {
      whMobilePhone:{
        required:true,
        indiaMobilePhone:true,
      },
      password: {
        required: true,
      },
    },
    messages: {
      whMobilePhone:{
        required: 'Need your mobile number.',
        indiaMobilePhone: 'Is this a valid India mobile number?'
      },
      password: {
        required: 'Need a password here.',
      },
    },
    submitHandler() { login(); },
  });
};

export default function handleLogin(options) {
  component = options.component;
  validate();
}
