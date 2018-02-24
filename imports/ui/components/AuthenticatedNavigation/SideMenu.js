import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { NavLink } from 'react-router-dom';
import { Panel, Row, Col, Button } from 'react-bootstrap';
import AdminNav from './AdminNav';
import Menu from './Menu';

const handleLogout = () => Meteor.logout();

const SideMenu = props => (
  <Menu alignment="right">
    <Panel className="menu-panel">
      <Row>
        <div className="container">
          <Col xs={12}>
            <ul>
              <li>
                <NavLink to="/order"> Place Order</NavLink>
              </li>
              <li>
                <NavLink to="/specials"> Specials </NavLink>
              </li>
              <li>
                <NavLink exact to="/"> My Orders</NavLink>
              </li>
              <li>
                <NavLink exact to="/vision">Our Vision</NavLink>
              </li>
              <li>
                <NavLink to="/invitations">Invite Friends</NavLink>
              </li>
              {/* <li>
                <NavLink to="/recover-password">Change Password</NavLink>
              </li> */}
              <li>
                <NavLink to="/profile">My Profile</NavLink>
              </li>
              <li className="visible-sm visible-xs" >
                <NavLink to="/vision">Our Vision</NavLink>
              </li>
            </ul>
            { <AdminNav {...props} /> }
            <ul>
              <li>
                <Button id="app-logout" onClick={handleLogout}>Logout</Button>
              </li>
            </ul>
          </Col>
        </div>
      </Row>
    </Panel>
  </Menu>
);

SideMenu.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default SideMenu;
