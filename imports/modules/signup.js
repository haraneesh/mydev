/* eslint-disable no-undef */

import { browserHistory } from 'react-router';
import { Accounts } from 'meteor/accounts-base';
import { Bert } from 'meteor/themeteorchef:bert';
import { updateUser } from '../api/users/methods';
import './validation.js';

let component;

const getUserData = () => {
 const password = (document.querySelector('[name="password"]'))?document.querySelector('[name="password"]').value:""
  return ({
  username: document.querySelector('input[name="whMobilePhone"]').value,
  email: document.querySelector('[name="emailAddress"]').value,
  password: password,
  profile: {
    name: {
      first: document.querySelector('[name="firstName"]').value,
      last: document.querySelector('[name="lastName"]').value,
    },
    whMobilePhone:document.querySelector('input[name="whMobilePhone"]').value,
    deliveryAddress:document.querySelector('[name="deliveryAddress"]').value,
  },
});
}

const signup = () => {
  let user = getUserData();
  if (component.loggedInUser){
    delete user.password
    updateUser.call(user, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger')
      } else {
        Bert.alert('Your profile has been updated', 'success')
      }
    })
  }else{
    Accounts.createUser(user, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        browserHistory.push('/');
        Bert.alert('Welcome!', 'success');
      }
    });
  }  
};

const validate = () => {
  $(component.signupForm).validate({
    rules: {
      firstName: {
        required: true,
      },
      lastName: {
        required: true,
      },
      emailAddress: {
        required: true,
        email: true,
      },
      password: {
        required: true,
        minlength: 6,
      },
      whMobilePhone:{
        required:true,
        indiaMobilePhone:true,
      },
      deliveryAddress:{
        required:true,
      }
    },
    messages: {
      firstName: {
        required: 'First name?',
      },
      lastName: {
        required: 'Last name?',
      },
      emailAddress: {
        required: 'Need an email address here.',
        email: 'Is this email address legit?',
      },
      password: {
        required: 'Need a password here.',
        minlength: 'Use at least six characters, please.',
      },
      whMobilePhone:{
        required: 'Need your mobile number.',
        indiaMobilePhone: 'Is this a valid India mobile number?'
      },
      deliveryAddress:{
        required: 'Need your delivery address.'
      }
    },
    submitHandler() { signup(); },
  });
};

export default function handleSignup(options) {
  component = options.component;
  validate();
}
