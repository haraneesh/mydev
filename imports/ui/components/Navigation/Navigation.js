import React from 'react';
import PropTypes from 'prop-types';
import { Navbar, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import PublicNavigation from '../PublicNavigation/PublicNavigation';
import SideMenu from '../AuthenticatedNavigation/SideMenu';
import { EasyNavWideScreen, EasyNavNarrowScreen } from '../AuthenticatedNavigation/EasyNav';

import './Navigation.scss';

function Navigation(props) {
  const history = useHistory();
  return (
    <Navbar fluid="true">

      <Navbar.Header style={{ margin: '0px' }}>
        {props.authenticated
        && (

        <button
          type="button"
          className="btn-link backButton"
          onClick={() => { history.goBack(); }}
          id="backIcon"
        >
          <i className="fa fa-arrow-left" style={{ color: '#522E23' }} />
        </button>

        )}

        <Navbar.Brand>

          <img
            className="brand-logo"
            src="/logo.png"
            alt="Suvai"
          />

        </Navbar.Brand>

        { !props.authenticated && <PublicNavigation {...props} /> }
        { !!props.authenticated && <EasyNavWideScreen isAdmin={props.isAdmin} /> }
        { !!props.authenticated && <SideMenu {...props} /> }

      </Navbar.Header>

      { !!props.authenticated && props.showEasyNav && <EasyNavNarrowScreen isAdmin={props.isAdmin} /> }

    </Navbar>
  );
}

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
