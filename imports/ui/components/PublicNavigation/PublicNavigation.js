import React from 'react';
import { Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import './PublicNavigation.scss';

const PublicNavigation = (props) => (
  <div className="publicNavigation row pull-right">
    <Col xs={12} className="text-center row">
      { (props.routeName !== 'About') ? (<Link className="col-7" to="/about">About Us</Link>) : (<Link className="col-7" to="/signup">Sign Up</Link>) }
      <Link className="col-5" to="/vision">Our Vision</Link>
    </Col>
    {/* } <li>
      <NavLink to="/login">Log In</NavLink>
    </li> */}
  </div>
);

export default PublicNavigation;
