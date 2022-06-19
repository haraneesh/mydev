import React, {
  useState, forwardRef, useImperativeHandle,
} from 'react';

import { Meteor } from 'meteor/meteor';
import {
  Row, Col, FormGroup, ControlLabel,
} from 'react-bootstrap';
import PropTypes from 'prop-types';
// import OAuthLoginButtons from '../../../components/OAuthLoginButtons/OAuthLoginButtons';
import { toast } from 'react-toastify';
import InputHint from '../../InputHint/InputHint';
import { formValChange, formValid } from '../../../../modules/validate';

const defaultState = {
  signUpRequestSent: false,
  isError: {
    emailAddress: '',
    password: '',
    firstName: '',
    lastName: '',
    whMobilePhone: '',
    confirmWhMobileNumber: '',
    deliveryAddress: '',
    confirmPassword: '',
    eatingHealthyMeaning: '',
  },
};

const SpecialOrderDeliveryDetails = forwardRef((props, ref) => {
  const [state, setState] = useState(defaultState);

  function getUserDetails() {
    const user = {
      username: document.querySelector('[name="whMobilePhone"]').value,
      confirmWhMobileNumber: document.querySelector('[name="confirmWhMobileNumber"]').value,
      password: document.querySelector('[name="password"]').value,
      confirmPassword: document.querySelector('[name="confirmPassword"]').value,
      profile: {
        name: {
          first: document.querySelector('[name="firstName"]').value,
          last: document.querySelector('[name="lastName"]').value,
        },
        whMobilePhone: document.querySelector('[name="whMobilePhone"]').value,
        deliveryAddress: document.querySelector('[name="deliveryAddress"]').value,
      },
    };

    return user;
  }

  function validateForm() {
    const {
      username, confirmWhMobileNumber, password, confirmPassword, profile,
    } = getUserDetails();
    let IsDataValid = true;
    if ((!username || username.length === 0)) {
      IsDataValid = false;
    }
    if (
      (!profile.whMobilePhone) || (username !== profile.whMobilePhone)
        || (username !== confirmWhMobileNumber)) {
      IsDataValid = false;
    }

    if (!password || password.length === 0 || !confirmPassword || confirmPassword.length === 0) {
      IsDataValid = false;
    }

    if (!profile || !profile.name || !profile.name.first || !profile.name.last) {
      IsDataValid = false;
    }

    if (!profile || !profile.deliveryAddress || !profile.deliveryAddress.length === 0) {
      IsDataValid = false;
    }

    if (!IsDataValid) {
      formValid(state);
      toast.error('Please check if you have entered all the mandatory fields');
    }
    return IsDataValid;
  }

  useImperativeHandle(
    ref,
    () => ({
      validateUserDetails() {
        return validateForm();
      },
      createUser(userCreatedNowAddOrder) {
        const user = getUserDetails();
        delete user.confirmPassword;
        delete user.confirmWhMobileNumber;
        Meteor.call('users.createSelfSignUpsForSpecials', user, (error, createdUser) => {
          if (error) {
            toast.error(error.reason);
          } else {
            // Place order
            userCreatedNowAddOrder({ ...createdUser, password: user.password });
          }
        });
      },
    }),
  );

  function onValueChange(e) {
    e.preventDefault();
    const { isError } = state;
    const newState = formValChange(e,
      { ...isError },
      {
        password: document.querySelector('[name="password"]').value,
        confirmPassword: document.querySelector('[name="confirmPassword"]').value,
        whMobilePhone: document.querySelector('[name="whMobilePhone"]').value,
        confirmWhMobileNumber: document.querySelector('[name="confirmWhMobileNumber"]').value,

      });
    setState(newState);
  }

  const { isError } = state;

  return (
    <div className="SpecialOrderDeliveryDetails offset-sm-1">
      <div>
        <Col xs={12}>
          <Row>
            <Col xs={6}>
              <FormGroup
                validationState={isError.firstName.length > 0 ? 'error' : ''}
                style={{ paddingRight: '1px' }}
              >
                <ControlLabel>First Name</ControlLabel>
                <input
                  type="text"
                  name="firstName"
                  onBlur={onValueChange}
                  className="form-control"
                />
              </FormGroup>
              {isError.firstName.length > 0 && (
                <span className="small text-muted">{isError.firstName}</span>
              )}
            </Col>
            <Col xs={6}>
              <FormGroup
                validationState={isError.lastName.length > 0 ? 'error' : ''}
                style={{ paddingLeft: '1px' }}
              >
                <ControlLabel>Last Name</ControlLabel>
                <input
                  type="text"
                  name="lastName"
                  onBlur={onValueChange}
                  className="form-control"
                />
              </FormGroup>
              {isError.lastName.length > 0 && (
                <span className="small text-muted">{isError.lastName}</span>
              )}
            </Col>
          </Row>

          <FormGroup validationState={isError.whMobilePhone.length > 0 ? 'error' : ''}>
            <ControlLabel>Whats App Mobile Number</ControlLabel>
            <input
              type="text"
              name="whMobilePhone"
              placeholder="10 digit number example, 8787989897"
              className="form-control"
              onBlur={onValueChange}
            />
            {isError.whMobilePhone.length > 0 && (
            <span className="small text-muted">{isError.whMobilePhone}</span>
            )}
          </FormGroup>
          <FormGroup validationState={isError.confirmWhMobileNumber.length > 0 ? 'error' : ''}>
            <ControlLabel>Confirm Mobile Number</ControlLabel>
            <input
              type="password"
              name="confirmWhMobileNumber"
              placeholder="10 digit number example, 8787989897"
              onBlur={onValueChange}
              onPaste={(e) => { e.preventDefault(); }}
              className="form-control"
            />
            {isError.confirmWhMobileNumber.length > 0 && (
            <span className="small text-muted">{isError.confirmWhMobileNumber}</span>
            )}
          </FormGroup>
          <FormGroup validationState={isError.deliveryAddress.length > 0 ? 'error' : ''}>
            <ControlLabel>Delivery Address</ControlLabel>
            <textarea
              name="deliveryAddress"
              placeholder="Complete address to deliver at, including Landmark, Pincode."
              rows="6"
              className="form-control"
              onBlur={onValueChange}
            />
          </FormGroup>
          <FormGroup validationState={isError.password.length > 0 ? 'error' : ''}>
            <ControlLabel>Password</ControlLabel>
            <input
              id="password"
              type="password"
              name="password"
              className="form-control"
              onBlur={onValueChange}
            />
            <InputHint>Use at least six characters.</InputHint>
            {isError.password.length > 0 && (
            <span className="small text-muted">{isError.password}</span>
            )}
          </FormGroup>
          <FormGroup validationState={isError.confirmPassword.length > 0 ? 'error' : ''}>
            <ControlLabel>Confirm Password</ControlLabel>
            <input
              type="password"
              name="confirmPassword"
              className="form-control"
              onBlur={onValueChange}
              onPaste={(e) => { e.preventDefault(); }}
            />
            {isError.confirmPassword.length > 0 && (
            <span className="small text-muted">{isError.confirmPassword}</span>
            )}
          </FormGroup>
        </Col>
      </div>
    </div>
  );
});

SpecialOrderDeliveryDetails.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
};

export default SpecialOrderDeliveryDetails;
