import React from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';

import './Footer.scss';

const copyrightYear = () => {
  const currentYear = 2026;
  return currentYear;
};

const Footer = (args) => (
  <footer className={`bg-white px-2 ${(args.authenticated) ? 'footer-show-toolbar' : 'footer-no-toolbar'} `}>

    <Container fluid>

      <div className="footerContent">
        <div className="footerCopyright">
          &copy;
          {' '}
          {copyrightYear()}
          {' '}
          Suvai Organics
          <span className="d-sm-inline d-none"> | Eat Healthy, Live Healthy</span>
        </div>
        <div className="footerLinks">
          <Link to="/pages/terms" className="text-body">
            Terms
            <span className="d-sm-inline d-none"> of Service</span>
          </Link>
          <Link to="/pages/privacy" className="text-body">
            Privacy
            <span className="d-sm-inline d-none"> Policy</span>
          </Link>
        </div>
      </div>
    </Container>
  </footer>
);

Footer.propTypes = {};

export default Footer;
