import React from 'react';
import PropTypes from 'prop-types';
import { Navbar } from 'react-bootstrap';
import PublicNavigation from '../PublicNavigation/PublicNavigation';
import SideMenu from '../AuthenticatedNavigation/SideMenu';
import { EasyNavWideScreen, EasyNavNarrowScreen } from '../AuthenticatedNavigation/EasyNav';

import './Navigation.scss';


const Navigation = props => (
  <Navbar>
    <Navbar.Header>
      <Navbar.Brand>
        <a onClick={() => { props.history.push('/'); }}>
          <img
            className="brand-logo"
            src="/logo.png"
            alt="Suvai"
          />
        </a>
      </Navbar.Brand>
      { !props.authenticated && <PublicNavigation {...props} /> }
      { !!props.authenticated && <EasyNavWideScreen isAdmin={props.isAdmin} /> }
      { !!props.authenticated && <SideMenu {...props} /> }
    </Navbar.Header>

    { !!props.authenticated && props.showEasyNav && <EasyNavNarrowScreen isAdmin={props.isAdmin} /> }

  </Navbar>
);

Navigation.defaultProps = {
  name: '',
};

Navigation.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export default Navigation;
