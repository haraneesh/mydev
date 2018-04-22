import React from 'react';
import { Nav, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import './PublicNavigation.scss';

const PublicNavigation = (props) => (
  <div className="publicNavigation pull-right">
    <Col xs={6} className="text-center">
     { (props.routeName !== "About") ?  (<Link to="/about">About Us</Link>) : (<Link to="/login">Log In</Link>) }
    </Col>
    <Col xs={6} className="text-center">
      <Link to="/vision">Our Vision</Link>
    </Col>
    {/* } <li>
      <NavLink to="/login">Log In</NavLink>
    </li> */}
  </div>
);

export default PublicNavigation;
