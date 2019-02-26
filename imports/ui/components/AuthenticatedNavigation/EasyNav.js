import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink, Link } from 'react-router-dom';
import { Glyphicon } from 'react-bootstrap';

import './EasyNav.scss';

export const EasyNavNarrowScreen = () => (
  <ul className="sec-menu-bar visible-sm visible-xs row">
    <li className="col-xs-4 text-center">
      <Link to="/order"> <Glyphicon glyph="pencil" /> Place Order </Link>
    </li>
    <li className="col-xs-4 text-center">
      <Link to="/healthprinciples"> <Glyphicon glyph="heart" className="alertMenu"/> Health</Link>
    </li>
    <li className="col-xs-4 text-center">
      <Link to="/"> <Glyphicon glyph="list" /> My Orders</Link>
    </li>
  </ul>
);

export const EasyNavWideScreen = () => (
  <Nav className="hidden-xs hidden-sm wide-menu-bar" >
    <li>
      <NavLink to="/order"><Glyphicon glyph="pencil" /> Place Order</NavLink>
    </li>
    <li>
      <NavLink to="/healthprinciples"> <Glyphicon glyph="heart" className="alertMenu"/> Health </NavLink>
    </li>
    <li>
      <NavLink exact to="/"><Glyphicon glyph="list" /> My Orders</NavLink>
    </li>
    <li>
      <NavLink exact to="/vision">Vision </NavLink>
    </li>
  </Nav>
);
