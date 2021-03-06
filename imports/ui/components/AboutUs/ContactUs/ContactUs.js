import React from 'react';
import { Panel, Row, Col } from 'react-bootstrap';

import './ContactUs.scss';

const ContactUs = () => (
  <Panel className="ContactUs text-center">
    <p><h3>Contact Us</h3></p>
    <Row>
      <Col xs={12} sm={6}>
        <address>
          <strong>Address</strong>
          <br />
          59 Kurinji Street,
          <br />
          Fathima Nagar,
          <br />
          Valasaravakkam,
          <br />
          Tamil Nadu 600089
          <br />
          <p>
            <a href="https://goo.gl/maps/GnWveu17Jb42" target="_blank">
              <span className="text-primary">View on Maps &rarr;</span>
            </a>
          </p>
        </address>
      </Col>
      <Col xs={12} sm={6}>
        <address>
          <strong>Land Line</strong>
          <br />
          <a href="tel:+914448569950">+91 44 48569950</a>
        </address>
        <address>
          <strong>Whats App</strong>
          <br />
          <a href="tel:+919361032849">+91 9361032849</a>
        </address>
        <address>
          <strong>E-Mail</strong>
          <br />
          <a href="mailto:#">hi@nammasuvai.com</a>
        </address>
      </Col>
    </Row>
  </Panel>
);

ContactUs.propTypes = {};

export default ContactUs;
