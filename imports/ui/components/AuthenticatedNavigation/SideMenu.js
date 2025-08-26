import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';

import { useNavigate } from 'react-router-dom';

import AdminNav from './AdminNav';
import Menu from './Menu';

const SideMenu = (props) => {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const { authenticated } = props;
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/about');
    Meteor.logout();
  };

  return (
    <Menu
      {...props}
      show={show}
      handleClose={handleClose}
      handleShow={handleShow}
    >
      {props.isAdmin && (
        <Col xs={6}>
          <AdminNav {...props} handleClose={handleClose} />
        </Col>
      )}
      <Col className="ps-3">
        <ListGroup style={{ listStyle: 'none' }}>
          <li className="p-1">
            <NavLink to="/myorders" onClick={handleClose}>
              My Orders
            </NavLink>
          </li>
          <li className="p-1">
            <NavLink to="/neworder" onClick={handleClose}>
              Place Order
            </NavLink>
          </li>
          <br />
          <li className="p-1">
            <NavLink to="/openinvoices" onClick={handleClose}>
              {' '}
              My Wallet{' '}
            </NavLink>
          </li>
          <br />
          <li className="p-1">
            <NavLink to="/profile" onClick={handleClose}>
              My Profile
            </NavLink>
          </li>
          <li className="p-1">
            <NavLink to="/invitations/new" onClick={handleClose}>
              Invite Friends
            </NavLink>
          </li>
          <br />
          <li className="p-1">
            <NavLink to="/about" onClick={handleClose}>
              About Us
            </NavLink>
          </li>
          <li className="p-1">
            <NavLink to="/healthprinciples" onClick={handleClose}>
              {' '}
              Our Health Principles{' '}
            </NavLink>
          </li>
          <li className="p-1">
            <NavLink to="/vision" onClick={handleClose}>
              Our Vision
            </NavLink>
          </li>
          {/* <li className="p-1">
                <NavLink to="/recover-password">Change Password</NavLink>
              </li> */}
          {!!authenticated && (
            <li className="py-2">
              <Button
                id="app-logout"
                onClick={() => {
                  handleClose();
                  handleLogout();
                }}
              >
                Log Out
              </Button>
            </li>
          )}
          {!authenticated && (
            <li className="py-2">
              <Button
                id="app-login"
                onClick={() => {
                  handleClose();
                  navigate('/login');
                }}
              >
                Log In
              </Button>
            </li>
          )}
        </ListGroup>
      </Col>
    </Menu>
  );
};

SideMenu.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default SideMenu;
