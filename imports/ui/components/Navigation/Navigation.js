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
      {props.authenticated &&
        <span
          id="backIcon"
          className="visible-xs-inline"
          style={{ marginTop: '18px', marginLeft: '10px', float: 'left', fontSize: '1.25em', display: 'block' }}
        >
          <a onClick={() => { props.history.goBack(); }} href="#">
            <i className="fa fa-arrow-left" style={{ color: '#522E23' }} />
          </a>
        </span>}

      <Navbar.Brand>
        <a onClick={() => { props.history.push('/'); }} style={{marginLeft: '1rem'}}>
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
  showEasyNav: PropTypes.bool.isRequired,
  containerWidth: PropTypes.bool.isRequired,
};

export default Navigation;
