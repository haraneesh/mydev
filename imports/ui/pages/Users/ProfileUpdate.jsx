import React from 'react';
import { Bert } from 'meteor/themeteorchef:bert';
import { Row, Col, Button } from 'react-bootstrap';
import { findUser, adminUpdateUser, createUser } from '../../../api/Users/methods';
import { hookUpValidation, getUserData, findUserForm, userProfileForm } from './SubUserForms';

export default class ProfileUpdate extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      user: {},
    };
    this._handleFindUser = this._handleFindUser.bind(this);
    this._updateUserProfile = this._updateUserProfile.bind(this);
    this._createNewUser = this._createNewUser.bind(this);
    this._handleCreateUser = this._handleCreateUser.bind(this);
  }

  componentDidUpdate(prevState, prevProps) {
    switch (this.state.mode) {
      case 'new':
        hookUpValidation(this._createNewUser);
        break;
      case 'update':
        hookUpValidation(this._updateUserProfile);
        break;
    }
  }

  _createNewUser() {
    const user = getUserData();
    createUser.call(user, (error, msg) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else if (msg) {
        // msg comes as empty from client side method call
        Bert.alert(`${msg.profile.name.first} ${msg.profile.name.last} has been added.`, 'success');
        this.setState({ user: msg, mode: 'update' });
      }
    });
  }

  _updateUserProfile() {
    const user = getUserData();
    user._id = this.state.user._id;
    adminUpdateUser.call(user, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert("User's profile has been updated", 'success');
      }
    });
  }

  _handleCreateUser(e) {
    this.setState({ user: {}, mode: 'new' });
  }

  _handleFindUser(e) {
    const mobileNumber = $("[name='mobileNumber']")[0].value;

    findUser.call({ mobileNumber }, (error, msg) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else if (msg) {
        this.setState({ user: msg, mode: 'update' });
      } else {
        Bert.alert('There is no user with this mobile number.', 'info');
        this.setState({ user: {}, mode: null });
      }
    });
  }

  render() {
    return (<div className="updateProfile">
      <Row>
        <Col xs={12}>
          <h3 className="page-header"> Add or Update User Profile </h3>
        </Col>
        <Col xs={12}>
          <Button type="button" bsStyle="default" onClick={this._handleCreateUser}>Add User</Button>
          <h4> - OR - </h4>
        </Col>
      </Row>
      { findUserForm(this._handleFindUser) }
      <hr />
      { this.state.mode && userProfileForm((this.state.mode === 'new') ? null : this.state.user) }
    </div>
    );
  }
}
