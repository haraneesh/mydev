import React from 'react';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Col from 'react-bootstrap/Col';
import { formValid } from '../../../modules/validate';
import constants from '../../../modules/constants';
import { getDayWithoutTime } from '../../../modules/helpers';
import { dateSettings } from '../../../modules/settings';

export const findUserForm = (callBack) => (
  <Row>
    <Col xs={12} sm={6}>
      <Row>
        <label>User's Phone number</label>
        <Form.Control
          type="text"
          name="mobileNumber"
          placeholder="User's mobile phone number"
        />
      </Row>
      <Button onClick={callBack} className="mt-2">Find User</Button>
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
  <div className="updateProfile p-2 pb-4">
    <h3>
      {(user) ? 'Edit User Info' : 'Add New User'}
    </h3>
    <form
      onSubmit={(event) => { validateForm(event, isError, callBack); }}
      key={(user) ? user.username : 'new'}
      name="updateProfileForm"
      className="userProfileForm mb-4"
    >

      <Row className="bg-body p-2 m-2">
        <Col xs={12} sm={8}>
          {(user) && (
            <Row>
              <p>
                Join Date :
                {' '}
                {getDayWithoutTime(user.createdAt, dateSettings.timeZone)}
              </p>
            </Row>
          )}
          <Row className="py-2">
            <label>Salutation</label>
            <select
              name="salutation"
              className="form-select"
              defaultValue={(user && user.profile.salutation) ? user.profile.salutation : ''}
            >
              <option value="Mrs.">Mrs</option>
              <option value="Mr.">Mr</option>
              <option value="Miss"> Miss</option>
            </select>
          </Row>
          <Row className="py-2" validationState={isError.firstName.length > 0 ? 'error' : ''}>
            <label>First Name</label>
            <Form.Control
              onBlur={onValueChange}
              type="text"
              name="firstName"
              placeholder="First Name"
              defaultValue={(user) ? user.profile.name.first : ''}
            />
            {isError.firstName.length > 0 && (
              <span className="small text-info">{isError.firstName}</span>
            )}
          </Row>
          <Row className="py-2" validationState={isError.lastName.length > 0 ? 'error' : ''}>
            <label>Last Name</label>
            <Form.Control
              onBlur={onValueChange}
              type="text"
              name="lastName"
              placeholder="Last Name"
              defaultValue={(user) ? user.profile.name.last : ''}
            />
            {isError.lastName.length > 0 && (
              <span className="small text-info">{isError.lastName}</span>
            )}
          </Row>
          <Row className="py-2">
            <label>Account Status</label>
            <select
              className="form-select"
              id="idAccountStatus"
              name="accountStatus"
              defaultValue={(user && user.status && user.status.accountStatus) ? user.status.accountStatus : ''}
            >
              {
                  constants.UserAccountStatus.names.map((key) => (
                    <option key={key} value={`${constants.UserAccountStatus[key].name}`}>
                      {constants.UserAccountStatus[key].status_display_value}
                    </option>
                  ))
                }
            </select>
          </Row>
          <Row className="py-2" validationState={isError.emailAddress.length > 0 ? 'error' : ''}>
            <label>Email Address</label>
            <Form.Control
              onBlur={onValueChange}
              type="text"
              name="emailAddress"
              placeholder="Email Address"
              defaultValue={(user && user.emails) ? user.emails[0].address : ''}
            />
            {isError.emailAddress.length > 0 && (
              <span className="small text-info">{isError.emailAddress}</span>
            )}
          </Row>
          <Row className="py-2" validationState={isError.whMobilePhone.length > 0 ? 'error' : ''}>
            <label>Mobile Number</label>
            <Form.Control
              onBlur={onValueChange}
              type="text"
              name="whMobilePhone"
              placeholder="10 digit number example, 8787989897"
              defaultValue={(user) ? user.profile.whMobilePhone : ''}
            />
            {isError.whMobilePhone.length > 0 && (
              <span className="small text-info">{isError.whMobilePhone}</span>
            )}
          </Row>
          <Row className="py-2" validationState={isError.deliveryAddress.length > 0 ? 'error' : ''}>
            <label>Delivery Address</label>
            <textarea
              className="form-control"
              onBlur={onValueChange}
              name="deliveryAddress"
              placeholder="Complete address to deliver at, including Landmark, Pincode."
              rows={6}
              defaultValue={(user && user.profile.deliveryAddress) ? user.profile.deliveryAddress : ''}
            />
            {isError.deliveryAddress.length > 0 && (
              <span className="small text-info">{isError.deliveryAddress}</span>
            )}
          </Row>
          <Row className="py-2" validationState={isError.deliveryPincode.length > 0 ? 'error' : ''}>
            <label>Delivery Pincode</label>
            <Form.Control
              onBlur={onValueChange}
              name="deliveryPincode"
              placeholder="Delivery Pincode."
              type="text"
              defaultValue={(user && user.profile.deliveryPincode) ? user.profile.deliveryPincode : ''}
            />
            {isError.deliveryPincode.length > 0 && (
              <span className="small text-info">{isError.deliveryPincode}</span>
            )}
          </Row>
          <Row className="py-2" validationState={isError.deliveryAddressLatitude.length > 0 ? 'error' : ''}>
            <label>Delivery Address Latitude</label>
            <Form.Control
              onBlur={onValueChange}
              type="text"
              name="deliveryAddressLatitude"
              placeholder="Add Latitude value from Google Maps."
              defaultValue={(user) ? user.profile.deliveryAddressLatitude : ''}
            />
            {isError.deliveryAddressLatitude.length > 0 && (
              <span className="small text-info">{isError.deliveryAddressLatitude}</span>
            )}
          </Row>
          <Row className="py-2" validationState={isError.deliveryAddressLongitude.length > 0 ? 'error' : ''}>
            <label>Delivery Address Longitude</label>
            <Form.Control
              onBlur={onValueChange}
              type="text"
              name="deliveryAddressLongitude"
              placeholder="Add Latitude value from Google Maps."
              defaultValue={(user) ? user.profile.deliveryAddressLongitude : ''}
            />
            {isError.deliveryAddressLongitude.length > 0 && (
              <span className="small text-info">{isError.deliveryAddressLongitude}</span>
            )}
          </Row>
          <Row className="py-2" validationState={isError.password.length > 0 ? 'error' : ''}>
            <label>Password</label>
            <Form.Control
              onBlur={onValueChange}
              type="password"
              name="password"
              placeholder="Password"
            />
            {isError.password.length > 0 && (
              <span className="small text-info">{isError.password}</span>
            )}
          </Row>
          <Row className="py-2">
            <label>User Role</label>
            <select
              className="form-select"
              id="idUserRole"
              name="userRole"
              defaultValue={(user && user.roles) ? user.roles[0] : constants.Roles.customer.name}
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
          </Row>
        </Col>
      </Row>
      <Button type="submit" variant="secondary">
        {(user) ? 'Update Profile' : 'Add New User'}
      </Button>
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
      deliveryPincode: document.querySelector('[name="deliveryPincode"]').value,
      deliveryAddressLongitude: document.querySelector('[name="deliveryAddressLongitude"]').value,
      deliveryAddressLatitude: document.querySelector('[name="deliveryAddressLatitude"]').value,
      salutation: document.querySelector('[name="salutation"]').selectedOptions[0].value,
    },
    // isAdmin: $('[name="checkBoxIsAdmin"]')[0].checked
    role: document.querySelector('[name="userRole"]').value,
    status: { accountStatus: document.querySelector('[name="accountStatus"]').value },
  });
};
