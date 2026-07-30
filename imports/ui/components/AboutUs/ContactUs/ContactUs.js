import { Meteor } from 'meteor/meteor';
import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import './ContactUs.scss';

const WhatsAppSupport = Meteor.settings.public.Support_Numbers.whatsapp;
const LandLineSupport = Meteor.settings.public.Support_Numbers.landline;

const ContactUs = () => (
  <Card className="ContactUs text-center my-3 py-4">
    <p className="py-3"><h1>Contact Us</h1></p>
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
              <span className="text-secondary">View on Maps &rarr;</span>
            </a>
          </p>
        </address>
      </Col>
      <Col xs={12} sm={6}>
        <address>
          <strong>Call Us / Whats App</strong>
          <br /> 
          <p>          
            <a href={`tel:${WhatsAppSupport.replace(' ', '')}`}>{WhatsAppSupport}</a>
            <br />
            <a href={"tel:+919789897882"}>{'+91 9789897882'}</a>
          </p>
        </address>
        <address>
          <strong>E-Mail</strong>
          <br />
          <a href="mailto:#">suvaiorganics@gmail.com</a>
        </address>
      </Col>
    </Row>
  </Card>
);

ContactUs.propTypes = {};

export default ContactUs;
