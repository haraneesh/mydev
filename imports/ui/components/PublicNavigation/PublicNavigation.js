import React from 'react';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';

import './PublicNavigation.scss';

const PublicNavigation = (props) => (
  <div className="publicNavigation col-sm-8">
    <Col xs={12} className="text-sm-end text-center py-2 px-2 pt-2">
      { (props.routeName !== 'About')
        ? (<Link className="row-col-6 p-sm-3 pe-6" to="/about">About Us</Link>)
        : (<Link className="row-col-6 p-sm-3 pe-6" to="/login">Sign In</Link>) }
      <Link className="row-col-6 ps-xs-6 p-sm-3" to="/vision">Our Vision</Link>
    </Col>
    {/* } <li>
      <NavLink to="/login">Sign in</NavLink>
    </li> */}
  </div>
);

export default PublicNavigation;
