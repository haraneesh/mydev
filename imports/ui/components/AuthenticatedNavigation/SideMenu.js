import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { NavLink } from 'react-router-dom';

import ListGroup from 'react-bootstrap/ListGroup';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import AdminNav from './AdminNav';
import Menu from './Menu';

const handleLogout = (props) => {
  props.history.push('/about');
  Meteor.logout();
};

const SideMenu = (props) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <Menu {...props} show={show} handleClose={handleClose} handleShow={handleShow}>

      {props.isAdmin && (
      <Col xs={6}>
        <AdminNav {...props} handleClose={handleClose} />
      </Col>
      )}
      <Col className="ps-3">
        <ListGroup style={{ listStyle: 'none' }}>
          <li className="p-1">
            <NavLink to="/" onClick={handleClose}>My Orders</NavLink>
          </li>
          <li className="p-1">
            <NavLink to="/profile" onClick={handleClose}>My Profile</NavLink>
          </li>
          <li className="p-1">
            <NavLink to="/invitations/new" onClick={handleClose}>Invite Friends</NavLink>
          </li>
          <br />
          <li className="p-1">
            <NavLink to="/about" onClick={handleClose}>About Us</NavLink>
          </li>
          <li className="p-1">
            <NavLink to="/healthprinciples" onClick={handleClose}> Our Health Principles </NavLink>
          </li>
          <li className="p-1">
            <NavLink to="/vision" onClick={handleClose}>Our Vision</NavLink>
          </li>
          {/* <li className="p-1">
                <NavLink to="/recover-password">Change Password</NavLink>
              </li> */}
          <li className="py-2">
            <Button id="app-logout" onClick={() => handleLogout(props)}>Logout</Button>
          </li>
        </ListGroup>
      </Col>

    </Menu>
  );
};

SideMenu.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default SideMenu;
