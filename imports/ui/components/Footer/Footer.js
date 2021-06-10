import React from 'react';
import { Link } from 'react-router-dom';
import { Grid } from 'react-bootstrap';

import './Footer.scss';

const copyrightYear = () => {
  const currentYear = 2020;
  return currentYear;
};

const Footer = () => (
  <div className="Footer">

    <Grid fluid="true">

      <div className="row">
        <div className="col-xs-7 col-sm-8 text-left">
          &copy;
          {' '}
          {copyrightYear()}
          {' '}
          Suvai Organics
          <span className="d-sm-inline d-none"> | Eat Healthy, Live Healthy</span>
        </div>
        <div className="col-xs-5 col-sm-4 text-right">
          <Link to="pages/terms" style={{ paddingRight: '15px' }}>
            Terms
            <span className="d-sm-inline d-none"> of Service</span>
          </Link>
          <Link to="/pages/privacy">
            Privacy
            <span className="d-sm-inline d-none"> Policy</span>
          </Link>
        </div>
      </div>
    </Grid>
  </div>
);

Footer.propTypes = {};

export default Footer;
