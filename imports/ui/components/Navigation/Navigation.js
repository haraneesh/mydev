import React from 'react';
import PropTypes from 'prop-types';
import { Navbar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PublicNavigation from '../PublicNavigation/PublicNavigation';
import SideMenu from '../AuthenticatedNavigation/SideMenu';
import { EasyNavWideScreen, EasyNavNarrowScreen } from '../AuthenticatedNavigation/EasyNav';

import './Navigation.scss';


const Navigation = props => (
  <Navbar>
    <Navbar.Header>
      <Navbar.Brand>
        <Link to="/">
          <img
            className="brand-logo"
            src="/logo.png"
            alt="Suvai"
          />
        </Link>
      </Navbar.Brand>
      { !props.authenticated && <PublicNavigation /> }
      { !!props.authenticated && <EasyNavWideScreen /> }
      { !!props.authenticated && <SideMenu {...props} /> }
    </Navbar.Header>

    { !!props.authenticated && props.showEasyNav && <EasyNavNarrowScreen /> }

  </Navbar>
);

Navigation.defaultProps = {
  name: '',
};

Navigation.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
};

export default Navigation;
