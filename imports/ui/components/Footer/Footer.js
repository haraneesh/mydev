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
        <Col xs={12} sm={6}>
          <p className="text-center">
            &copy; {copyrightYear()} Organics | Healthy, Tasty and Organic
          </p>
        </Col>
        <Col xs={6} sm={3} className="text-center">
          <p><Link to="/pages/terms">Terms of Service</Link></p>
        </Col>
        {/*
          <Col sm={4} xs={12} className="text-center">
          <p><Link to="/pages/refund">Refund Policy</Link></p>
          </Col>
        */}
        <Col xs={6} sm={3} className="text-center">
          <p><Link to="/pages/privacy">Privacy Policy</Link></p>
        </Col>
      </Row>
    </Grid>
  </div>
);

Footer.propTypes = {};

export default Footer;
