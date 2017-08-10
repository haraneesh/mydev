import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

const PublicNavigation = () => (
  <Nav className="pull-right">
    <li>
      <NavLink to="/about">About Us</NavLink>
    </li>
    {/* } <li>
      <NavLink to="/login">Log In</NavLink>
    </li> */}
  </Nav>
);

export default PublicNavigation;
