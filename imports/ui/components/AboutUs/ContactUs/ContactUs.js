import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Panel, Row, Col } from 'react-bootstrap';

import './ContactUs.scss';

const WhatsAppSupport = Meteor.settings.public.Support_Numbers.whatsapp;
const LandLineSupport = Meteor.settings.public.Support_Numbers.landline;

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
          <a href={`tel:${LandLineSupport.replace(' ', '')}`}>{LandLineSupport}</a>
        </address>
        <address>
          <strong>Whats App</strong>
          <br />
          <a href={`tel:${WhatsAppSupport.replace(' ', '')}`}>{WhatsAppSupport}</a>
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
