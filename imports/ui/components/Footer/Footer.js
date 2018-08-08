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
        <Col xs={12}>
          <p className="text-center">&copy; {copyrightYear()} Organics | Healthy, Tasty and Organic</p>
        </Col>
      </Row>
      <Row>
        <Col sm={4} xs={12} className="text-center">
          <Link to="/pages/terms">Terms of Service</Link>
        </Col>
        <Col sm={4} xs={12} className="text-center">
          <Link to="/pages/refund">Refund Policy</Link>
        </Col>
        <Col sm={4} xs={12} className="text-center">
          <Link to="/pages/privacy">Privacy Policy</Link>
        </Col>
      </Row>
    </Grid>
  </div>
);

Footer.propTypes = {};

export default Footer;
