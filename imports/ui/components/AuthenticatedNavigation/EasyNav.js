import React from 'react';
import { Nav, Glyphicon } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';


import './EasyNav.scss';

export const EasyNavNarrowScreen = props => (
  <ul className="sec-menu-bar visible-sm visible-xs">
    <li className="col-xs-4 text-center" style={{ padding: '0px 0px 10px' }}>
      <Link to="/neworder/selectbasket"> <Glyphicon glyph="pencil" /> Place Order </Link>
    </li>
    <li className="col-xs-4 text-center" style={{ padding: '0px 0px 10px' }}>
      <Link to="/"> <Glyphicon glyph="list" /> My Orders</Link>
    </li>
    <li className="col-xs-4 text-center" style={{ padding: '0px 0px 10px' }}>
      <Link to={(props.isAdmin) ? '/messagesadmin' : '/messages'}> <Glyphicon glyph="comment" className="highlightMenu" /> Message Us</Link>
    </li>
    {/*
    <li className="col-xs-4 text-center" style={{ padding: '0px 0px 10px' }}>
      <a href="https://docs.google.com/forms/d/1IrtpOWphX8mVs8U25QoFhmQgJD_YFw0K7By-9Qw0tKw/" target="_blank">
        <Glyphicon glyph="comment" /> Give Feedback
      </a>
    </li> */}
  </ul>
);

export const EasyNavWideScreen = props => (
  <Nav className="hidden-xs hidden-sm wide-menu-bar" >
    <li>
      <NavLink to="/neworder/selectbasket"><Glyphicon glyph="pencil" /> Place Order</NavLink>
    </li>
    <li>
      <NavLink exact to="/"><Glyphicon glyph="list" /> My Orders</NavLink>
    </li>
    <li>
      <NavLink to="/healthprinciples"> <Glyphicon glyph="heart" /> Health </NavLink>
    </li>
    <li>
      <NavLink to={(props.isAdmin) ? '/messagesadmin' : '/messages'}> <Glyphicon glyph="comment" className="highlightMenu" /> Message Us </NavLink>
      {/* } <a href="https://docs.google.com/forms/d/1IrtpOWphX8mVs8U25QoFhmQgJD_YFw0K7By-9Qw0tKw/" target="_blank">
        <Glyphicon glyph="comment" /> Give Feedback
</a> */}
    </li>
  </Nav>
);
