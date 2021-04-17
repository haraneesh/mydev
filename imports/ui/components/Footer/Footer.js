import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Row, Col } from 'react-bootstrap';

import './Footer.scss';

const copyrightYear = () => {
  const currentYear = 2020;
  return currentYear;
};

const Footer = () => (
  <div className="Footer">

    <Grid>
      <p className="pull-left">
        &copy;
        {' '}
        {copyrightYear()}
        {' '}
        Suvai Organics
        <span className="hidden-xs"> | Eat Healthy, Live Healthy</span>
      </p>
      <ul className="pull-right">
        <li>
          <Link to="pages/terms">
            Terms
            <span className="hidden-xs"> of Service</span>
          </Link>
        </li>
        <li>
          <Link to="/pages/privacy">
            Privacy
            <span className="hidden-xs"> Policy</span>
          </Link>
        </li>
      </ul>
    </Grid>
  </div>
);

Footer.propTypes = {};

export default Footer;
