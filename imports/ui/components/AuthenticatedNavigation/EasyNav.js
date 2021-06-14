import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';

import './EasyNav.scss';

export const EasyNavNarrowScreen = (props) => (
  <ul className="sec-menu-bar d-sm-none row">
    <li className="col-xs-6 text-center">
      {/* <Link to="/neworder/selectbasket"> Place Order </Link> */}
      <Link to="/neworder"> Place Order </Link>
    </li>
    <li className="col-xs-6 text-center">
      <Link to="/mywallet">My Wallet</Link>
    </li>
    {/* <li className="col-xs-4 text-center" style={{ padding: '0px 0px 10px' }}>
      <Link to={(props.isAdmin) ? '/messagesadmin' : '/messages'}> Message Us</Link>
    </li>

    <li className="col-xs-4 text-center" style={{ padding: '0px 0px 10px' }}>
      <a href="https://docs.google.com/forms/d/1IrtpOWphX8mVs8U25QoFhmQgJD_YFw0K7By-9Qw0tKw/" target="_blank">
        <Glyphicon glyph="comment" /> Give Feedback
      </a>
    </li> */}
  </ul>
);

export const EasyNavWideScreen = (props) => (
  <Nav className="d-none d-md-block wide-menu-bar">
    <li>
      { /* <NavLink to="/neworder/selectbasket"> Place Order</NavLink> */}
      <Link to="/neworder"> Place Order </Link>
    </li>
    <li>
      <NavLink exact to="/"> My Orders</NavLink>
    </li>
    <li>
      <NavLink to="/healthprinciples"> Health </NavLink>
    </li>
    <li>
      <NavLink to="/mywallet"> My Wallet </NavLink>
    </li>
  </Nav>
);
