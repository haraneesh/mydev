import React from 'react';
import { toast } from 'react-toastify';
import { Row, Col, Button } from 'react-bootstrap';
import { findUser, adminUpdateUser, createUser } from '../../../api/Users/methods';
import {
  getUserData, findUserForm, userProfileForm,
} from './SubUserForms';

import { formValChange } from '../../../modules/validate';

export default class ProfileUpdate extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = this.defaultState();
    this.onValueChange = this.onValueChange.bind(this);
    this.handleFindUser = this.handleFindUser.bind(this);
    this.updateUserProfile = this.updateUserProfile.bind(this);
    this.createNewUser = this.createNewUser.bind(this);
    this.handleCreateUser = this.handleCreateUser.bind(this);
  }

  /* componentDidUpdate(prevState, prevProps) {
    switch (this.state.mode) {
      case 'new':
        hookUpValidation(this.createNewUser);
        break;
      case 'update':
        hookUpValidation(this.updateUserProfile);
        break;
      default:
        break;
    }
  } */

  onValueChange(e) {
    const { isError } = this.state;
    const newState = formValChange(e, { ...isError });
    this.setState(newState);
  }

  defaultState() {
    return ({
      user: {},
      isError: {
        emailAddress: '',
        password: '',
        firstName: '',
        lastName: '',
        whMobilePhone: '',
        deliveryAddress: '',
      },
    });
  }

  createNewUser() {
    const user = getUserData();
    createUser.call(user, (error, msg) => {
      if (error) {
        toast.error(error.reason);
      } else {
        // msg comes as empty from client side method call
        toast.success(`${msg.profile.name.first} ${msg.profile.name.last} has been added.`);
        this.setState({ user: msg, mode: 'update' });
      }
    });
  }

  validateForm(e, isError, callBack) {
    e.preventDefault();
    if (formValid({ isError })) {
      callBack();
    }
  }

  updateUserProfile() {
    const user = getUserData();
    user._id = this.state.user._id;
    adminUpdateUser.call(user, (error) => {
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success("User's profile has been updated");
      }
    });
  }

  handleCreateUser(e) {
    this.setState({ user: {}, mode: 'new' });
  }

  handleFindUser(e) {
    const mobileNumber = document.getElementsByName('mobileNumber')[0].value;

    findUser.call({ mobileNumber }, (error, msg) => {
      if (error) {
        toast.error(error.reason);
      } else if (msg) {
        this.setState({ user: msg, mode: 'update' });
      } else {
        toast.info('There is no user with this mobile number.');
        this.setState({ ...this.defaultState(), mode: null });
      }
    });
  }

  render() {
    const { mode, isError, user } = this.state;
    return (
      <div className="updateProfile">
        <Row>
          <Col xs={12}>
            <h3 className="page-header"> Add or Update User Profile </h3>
          </Col>
          <Col xs={12}>
            <Button type="button" bsStyle="default" onClick={this.handleCreateUser}>Add User</Button>
            <h4> - OR - </h4>
          </Col>
        </Row>
        { findUserForm(this.handleFindUser) }
        <hr />
        { mode && userProfileForm(
          (mode === 'new') ? null : user,
          isError,
          this.onValueChange,
          (mode === 'new') ? this.createNewUser : this.updateUserProfile,
        )}
      </div>
    );
  }
}
