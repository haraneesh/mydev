import React from 'react';
import {
  Row, Col, FormGroup, Panel, label, FormControl, Button,
} from 'react-bootstrap';
import { formValid } from '../../../modules/validate';
import constants from '../../../modules/constants';

export const findUserForm = (callBack) => (
  <Row>
    <Col xs={12} sm={6}>
      <FormGroup>
        <label>User's Phone number</label>
        <FormControl
          type="text"
          name="mobileNumber"
          placeholder="User's mobile phone number"
        />
      </FormGroup>
      <Button type="button" bsStyle="default" onClick={callBack}>Find User</Button>
    </Col>
  </Row>
);

const validateForm = (e, isError, callBack) => {
  e.preventDefault();
  if (formValid({ isError })) {
    callBack();
  }
};

export const userProfileForm = (user, isError, onValueChange, callBack) => (
  <div className="updateProfile">
    <h4>
      {' '}
      {(user) ? 'Edit User Info' : 'Add New User'}
      {' '}
    </h4>
    <form
      onSubmit={(event) => { validateForm(event, isError, callBack); }}
      key={(user) ? user.username : 'new'}
      name="updateProfileForm"
      className="userProfileForm"
    >
      <Panel>
        <Row>
          <Col xs={12} sm={8}>
            <FormGroup>
              <label>Salutation</label>
              <select
                name="salutation"
                className="form-control"
                defaultValue={(user && user.profile.salutation) ? user.profile.salutation : ''}
              >
                <option value="Mrs.">Mrs</option>
                <option value="Mr.">Mr</option>
                <option value="Miss"> Miss</option>
              </select>
            </FormGroup>
            <FormGroup validationState={isError.firstName.length > 0 ? 'error' : ''}>
              <label>First Name</label>
              <FormControl
                onBlur={onValueChange}
                type="text"
                name="firstName"
                placeholder="First Name"
                defaultValue={(user) ? user.profile.name.first : ''}
              />
              {isError.firstName.length > 0 && (
              <span className="control-label">{isError.firstName}</span>
              )}
            </FormGroup>
            <FormGroup validationState={isError.lastName.length > 0 ? 'error' : ''}>
              <label>Last Name</label>
              <FormControl
                onBlur={onValueChange}
                type="text"
                name="lastName"
                placeholder="Last Name"
                defaultValue={(user) ? user.profile.name.last : ''}
              />
              {isError.lastName.length > 0 && (
              <span className="control-label">{isError.lastName}</span>
              )}
            </FormGroup>
            <FormGroup validationState={isError.emailAddress.length > 0 ? 'error' : ''}>
              <label>Email Address</label>
              <FormControl
                onBlur={onValueChange}
                type="text"
                name="emailAddress"
                placeholder="Email Address"
                defaultValue={(user) ? user.emails[0].address : ''}
              />
              {isError.emailAddress.length > 0 && (
              <span className="control-label">{isError.emailAddress}</span>
              )}
            </FormGroup>
            <FormGroup validationState={isError.whMobilePhone.length > 0 ? 'error' : ''}>
              <label>Mobile Number</label>
              <FormControl
                onBlur={onValueChange}
                type="text"
                name="whMobilePhone"
                placeholder="10 digit number example, 8787989897"
                defaultValue={(user) ? user.profile.whMobilePhone : ''}
              />
              {isError.whMobilePhone.length > 0 && (
              <span className="control-label">{isError.whMobilePhone}</span>
              )}
            </FormGroup>
            <FormGroup validationState={isError.deliveryAddress.length > 0 ? 'error' : ''}>
              <label>Delivery Address</label>
              <FormControl
                onBlur={onValueChange}
                componentClass="textarea"
                name="deliveryAddress"
                placeholder="Complete address to deliver at, including Landmark, Pincode."
                rows="6"
                defaultValue={(user && user.profile.deliveryAddress) ? user.profile.deliveryAddress : ''}
              />
              {isError.deliveryAddress.length > 0 && (
              <span className="control-label">{isError.deliveryAddress}</span>
              )}
            </FormGroup>
            <FormGroup validationState={isError.password.length > 0 ? 'error' : ''}>
              <label>Password</label>
              <FormControl
                onBlur={onValueChange}
                type="password"
                name="password"
                placeholder="Password"
              />
              {isError.password.length > 0 && (
              <span className="control-label">{isError.password}</span>
              )}
            </FormGroup>
            <FormGroup>
              <label>User Role</label>
              <select
                className="form-control"
                id="idUserRole"
                name="userRole"
                defaultValue={(user && user.roles && user.roles[0])
                  ? user.roles[0]
                  : constants.Roles.customer.name}
              >
                <option value={`${constants.Roles.admin.name}`}>
                  {constants.Roles.admin.display_value}
                </option>
                <option value={`${constants.Roles.shopOwner.name}`}>
                  {constants.Roles.shopOwner.display_value}
                </option>
                <option value={`${constants.Roles.customer.name}`}>
                  {constants.Roles.customer.display_value}
                </option>
              </select>
            </FormGroup>
          </Col>
        </Row>
        <Button type="submit" bsStyle="primary">
          {' '}
          {(user) ? 'Update Profile' : 'Add New User'}
          {' '}
        </Button>
      </Panel>
    </form>

  </div>
);

export const getUserData = () => {
  const password = document.querySelector('[name="password"]').value;

  return ({
    username: document.querySelector('input[name="whMobilePhone"]').value,
    email: document.querySelector('[name="emailAddress"]').value,
    password: (password) ? Accounts._hashPassword(password) : null,
    profile: {
      name: {
        first: document.querySelector('[name="firstName"]').value,
        last: document.querySelector('[name="lastName"]').value,
      },
      whMobilePhone: document.querySelector('input[name="whMobilePhone"]').value,
      deliveryAddress: document.querySelector('[name="deliveryAddress"]').value,
      salutation: document.querySelector('[name="salutation"]').selectedOptions[0].value,
    },
    // isAdmin: $('[name="checkBoxIsAdmin"]')[0].checked
    role: document.querySelector('[name="userRole"]').value,
  });
};
