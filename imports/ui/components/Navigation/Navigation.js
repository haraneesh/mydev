import React from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import { useHistory } from 'react-router-dom';
import Icon from '../Icon/Icon';
import PublicNavigation from '../PublicNavigation/PublicNavigation';
import SideMenu from '../AuthenticatedNavigation/SideMenu';
import { EasyNavWideScreen, EasyNavNarrowScreen } from '../AuthenticatedNavigation/EasyNav';

function Navigation(props) {
  const history = useHistory();
  return (
    <>
      <Container fluid="true" className="bg-white py-2">
        <Row>
          <span className="text-left col col-sm-3 ps-2">
            {props.authenticated
        && (

        <Button
          variant="white"
          onClick={() => { history.goBack(); }}
          className="backButton"
          id="backIcon"
        >
          <Icon icon="arrow_back" className="fs-2" type="mt" />
        </Button>

        )}

            <img
              className="brand-logo ms-3"
              src="/logo.svg?v200"
              alt="Suvai"
              style={{ maxHeight: '3.6em' }}
              onClick={() => { history.push('/'); }}
            />
          </span>

          { /*! props.authenticated && <PublicNavigation {...props} /> */ }
          { <EasyNavWideScreen isAdmin={props.isAdmin} {...props} /> }

          { <SideMenu {...props} /> }
        </Row>
        {/*  </header> */}
        <Row>
          { !!props.authenticated && props.showEasyNav && <EasyNavNarrowScreen isAdmin={props.isAdmin} /> }
        </Row>
      </Container>

    </>
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
};

export default Navigation;
