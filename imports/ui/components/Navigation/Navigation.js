import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { useNavigate } from 'react-router-dom';
import {
  EasyNavNarrowScreen,
  EasyNavWideScreen,
} from '../AuthenticatedNavigation/EasyNav';
import SideMenu from '../AuthenticatedNavigation/SideMenu';
import Icon from '../Icon/Icon';
import PublicNavigation from '../PublicNavigation/PublicNavigation';

function Navigation(props) {
  const navigate = useNavigate();
  return (
    <>
      <Container fluid="true" className="bg-white py-2">
        <Row>
          {props.authenticated && (
            <span className="text-left col-1">
              <Button
                variant="white"
                onClick={() => {
                  navigate(-1, { replace: true });
                }}
                className="backButton"
                id="backIcon"
              >
                <Icon icon="arrow_back" className="fs-2" type="mt" />
              </Button>
            </span>
          )}

          <span className="text-left col ps-1">
            <img
              className="brand-logo ms-3"
              src="/logo.svg?v200"
              alt="Suvai"
              style={{ maxWidth: '8em' }}
              onClick={() => {
                navigate('/');
              }}
            />
          </span>

          {/*! props.authenticated && <PublicNavigation {...props} /> */}
          {<EasyNavWideScreen isAdmin={props.isAdmin} {...props} />}

          {<SideMenu {...props} />}
        </Row>
        {/*  </header> */}
        <Row>
          {!!props.authenticated && props.showEasyNav && (
            <EasyNavNarrowScreen isAdmin={props.isAdmin} />
          )}
        </Row>
      </Container>
    </>
  );
}

Navigation.propTypes = {
  authenticated: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  showEasyNav: PropTypes.bool.isRequired,
};

export default Navigation;
