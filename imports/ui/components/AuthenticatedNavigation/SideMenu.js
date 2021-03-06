import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { NavLink } from 'react-router-dom';
import {
  Panel, Col, Button,
} from 'react-bootstrap';
import AdminNav from './AdminNav';
import Menu from './Menu';

const handleLogout = (props) => {
  props.history.push('/about');
  Meteor.logout();
};

const SideMenu = (props) => (
  <Menu alignment="right" {...props}>
    <Panel className="menu-panel">
      <div className="offset-1">
        <div className="container row">
          {props.isAdmin && (
          <Col xs={12} sm={6}>
            <AdminNav {...props} />
          </Col>
          )}
          <Col xs={12} sm={6}>
            <ul>
              <li>
                <NavLink to="/">My Orders</NavLink>
              </li>
              <li>
                <NavLink to="/profile">My Profile</NavLink>
              </li>
              <li>
                <NavLink to="/invitations/new">Invite Friends</NavLink>
              </li>
              <br />
              <li>
                <NavLink to="/about">About Us</NavLink>
              </li>
              <li>
                <NavLink exact to="/healthprinciples"> Our Health Principles </NavLink>
              </li>
              <li>
                <NavLink to="/vision">Our Vision</NavLink>
              </li>
              {/* <li>
                <NavLink to="/recover-password">Change Password</NavLink>
              </li> */}
              <li>
                <Button id="app-logout" onClick={() => handleLogout(props)}>Logout</Button>
              </li>
            </ul>
          </Col>
        </div>
      </div>
    </Panel>
  </Menu>
);

SideMenu.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default SideMenu;
