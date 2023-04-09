import React from 'react';
import Nav from 'react-bootstrap/Nav';
import { NavLink, Link } from 'react-router-dom';

export const EasyNavNarrowScreen = (props) => (
  <ul className="sec-menu-bar d-sm-none pt-4 row" style={{ listStyleType: 'none' }}>
    <li className="col-4 text-center">
      <Link to="/myorders">My Orders</Link>
    </li>
    <li className="col-4 text-center">
      <Link to="/mywallet">My Wallet</Link>
    </li>
    <li className="col-4 text-center">
      {/* <Link to="/neworder/selectbasket"> Place Order </Link> */}
      <Link to="/neworder"> Place Order </Link>
    </li>
    {/* <li className="col-4 text-center" style={{ padding: '0px 0px 10px' }}>
      <Link to={(props.isAdmin) ? '/messagesadmin' : '/messages'}> Message Us</Link>
    </li>

    <li className="col-4 text-center" style={{ padding: '0px 0px 10px' }}>
      <a href="https://docs.google.com/forms/d/1IrtpOWphX8mVs8U25QoFhmQgJD_YFw0K7By-9Qw0tKw/" target="_blank">
        <Glyphicon glyph="comment" /> Give Feedback
      </a>
    </li> */}
  </ul>
);

export const EasyNavWideScreen = (props) => (
  <div className="d-none d-md-block text-center col">
    <span className="col text-center  px-2">
      <NavLink exact to="/myorders"> My Orders</NavLink>
    </span>
    <span className="col text-center px-2">
      { /* <NavLink to="/neworder/selectbasket"> Place Order</NavLink> */}
      <Link to="/neworder"> Place Order </Link>
    </span>
    {!!props.authenticated && (
    <span className="col text-center  px-2">
      <NavLink to="/mywallet"> My Wallet </NavLink>
    </span>
    )}
    <span className="col text-center  px-2">
      <NavLink to="/about">About Us</NavLink>
    </span>
  </div>
);
