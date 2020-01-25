import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import { Glyphicon } from 'react-bootstrap';

import './EasyNav.scss';

export const EasyNavNarrowScreen = () => (
  <ul className="sec-menu-bar visible-sm visible-xs row">
    <li className="col-xs-4 text-center">
      <Link to="/neworder/selectbasket"> <Glyphicon glyph="pencil" /> Place Order </Link>
    </li>
    <li className="col-xs-4 text-center">
      <Link to="/"> <Glyphicon glyph="list" /> My Orders</Link>
    </li>
    <li className="col-xs-4 text-center">
      <a href="https://docs.google.com/forms/d/1IrtpOWphX8mVs8U25QoFhmQgJD_YFw0K7By-9Qw0tKw/" target="_blank">
        <Glyphicon glyph="comment" /> Give Feedback
      </a>
    </li>
  </ul>
);

export const EasyNavWideScreen = () => (
  <Nav className="hidden-xs hidden-sm wide-menu-bar" >
    <li>
      <NavLink to="/neworder/selectbasket"><Glyphicon glyph="pencil" /> Place Order</NavLink>
    </li>
    <li>
      <NavLink exact to="/"><Glyphicon glyph="list" /> My Orders</NavLink>
    </li>
    <li>
      <NavLink to="/healthprinciples"> <Glyphicon glyph="heart" className="highlightMenu" /> Health </NavLink>
    </li>
    <li>
      <a href="https://docs.google.com/forms/d/1IrtpOWphX8mVs8U25QoFhmQgJD_YFw0K7By-9Qw0tKw/" target="_blank">
        <Glyphicon glyph="comment" /> Give Feedback
      </a>
    </li>
  </Nav>
);
