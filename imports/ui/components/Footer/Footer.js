import React from 'react';
import { Link } from 'react-router-dom';
import { Grid, Row, Col } from 'react-bootstrap';

import './Footer.scss';

const copyrightYear = () => {
  const currentYear = 2018;
  return currentYear;
};

const Footer = () => (
  <div className="Footer">
    <Grid>
      <Row>
        <Col sm={6} xs={12}>
          <p className="text-left text-center-xs">&copy; {copyrightYear()} Organics | Healthy, Tasty and Organic</p>
        </Col>
        <Col sm={6} xs={12}>
          <p className="text-right text-center-xs">
            <Link to="/pages/terms">Terms of Service</Link>
            <Link to="/pages/refund">Refund Policy</Link>
            {/*<Link to="/pages/privacy">Privacy Policy</Link> */}
          </p>
        </Col>
      </Row>
    </Grid>
  </div>
);

Footer.propTypes = {};

export default Footer;
