import React from 'react';
import { Row, Col, Glyphicon } from 'react-bootstrap';
import './FAQ.scss';

const FAQ = () => (
  <div className="FAQ">
    <div className="Page">
      <div className="panel panel-default">
        <div className="panel-body">
          <div className="PageHeader">
            <div className="PageHeader-container">
              <h3>Organic Whole Food Plant Based Diet, Low in Sugar and Fat <br/>
              <small>Let food be thy medicine</small>
              </h3>
            </div>
          </div>
          <div className="Content">
            <section className="text-center page-section">
              <div className="Introduction font-serif">
              <blockquote>
                <p>
                <em> 80% of heart disease, stroke and diabetes, 40% of cancer can be prevented<sup>1</sup></em><br/>
                <footer>World Health Organization</footer>
                </p>
                </blockquote>
                </div>
              </section>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default FAQ;
