import React from 'react';
import { Grid, Panel, Row, Col, Glyphicon } from 'react-bootstrap';

import './ContactUs.scss';

const ContactUs = () => (
  <Panel className="ContactUs">
    <h3>Contact Us</h3>
    <Grid>
      <Row>
        <Col xs={12} sm={6}>
          <address>
            <h4>Address </h4>
              59 Kurinji Street, <br />
              Fathima Nagar, <br />
              Valasaravakkam, <br />
              Tamil Nadu 600089 <br />
            <p>
              <a href="https://goo.gl/maps/GnWveu17Jb42" target="_blank">
                <span className="text-primary">View on Maps &rarr;</span>
              </a>
            </p>
          </address>
        </Col>
        <Col xs={12} sm={6}>
          <address>
            <h4>Land Line </h4>
            <a href="tel:+914448569950"> +91 44 48569950</a>
          </address>
          <address>
            <h4>Whats App </h4>
            <a href="tel:+917397459010">+91 7397459010</a>
          </address>
          <address>
            <h4>E-Mail</h4>
            <a href="mailto:#">community@nammasuvai.com</a>
          </address>
        </Col>
      </Row>
    </Grid>
  </Panel>
);

ContactUs.propTypes = {};

export default ContactUs;

