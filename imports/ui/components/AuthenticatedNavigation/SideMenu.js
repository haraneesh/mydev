import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { NavLink } from 'react-router-dom';
import { Panel, Row, Col, Button } from 'react-bootstrap';
import AdminNav from './AdminNav';
import Menu from './Menu';

const handleLogout = (props) => {
  props.history.push('/about');
  Meteor.logout();
};

const SideMenu = props => (
  <Menu alignment="right">
    <Panel className="menu-panel">
      <Row>
        <div className="container">
        { props.isAdmin && (<Col xs={12} sm={6}>
            { <AdminNav {...props} /> }
          </Col>)
        }
          <Col xs={12} sm={6}>
            <ul>
              {/*
              <li>
                <NavLink to="/order"> Place Order</NavLink>
              </li>
              <li>
                <NavLink to="/specials"> Specials </NavLink>
              </li>
              <li>
                <NavLink exact to="/"> My Orders</NavLink>
              </li> 
              */}
              <li>
                <NavLink to="/about">About Us</NavLink>
              </li>
              <li>
                <NavLink exact to="/healthprinciples"> Our Health Principles </NavLink>
              </li>
              <li>
                <NavLink to="/vision">Our Vision</NavLink>
              </li>
              <br/>
              <li>
                <NavLink to="/approveSignUps"> Approve Sign Ups</NavLink>
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
              <li>
                <Button id="app-logout" onClick={() => handleLogout(props) }>Logout</Button>
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
