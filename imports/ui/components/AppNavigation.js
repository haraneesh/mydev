import React from 'react';
import { Navbar } from 'react-bootstrap';
import { Link } from 'react-router';
import PublicNavigation from './PublicNavigation.js';
import AuthenticatedNavigation from './AuthenticatedNavigation.js';

const renderNavigation = hasUser => (hasUser ? <AuthenticatedNavigation /> : <PublicNavigation />);

const AppNavigation = ({ hasUser }) => {
  return(
    <Navbar>
      <Navbar.Header>
        <Navbar.Brand>
          <Link to="/">Rocket Shop</Link>
        </Navbar.Brand>
        <Navbar.Toggle />
      </Navbar.Header>
      <Navbar.Collapse>
        { renderNavigation(hasUser) }
      </Navbar.Collapse>
    </Navbar>
  );
}

AppNavigation.propTypes = {
  hasUser: React.PropTypes.object,
};

export default AppNavigation;
