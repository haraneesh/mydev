import React from 'react';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';

import './Testimonials.scss';

const Testimonials = () => (
  <Card className="testimonials text-center bodyCursText py-3 my-3">
    <h2 className="m-5">What people are saying...</h2>

    <Row>
      <div className="col-sm-4">
        <div className="testimonial-item mb-3 ">
          {/* <img class="img-fluid img-circle mb-3" src="about/testimonials-3.jpg" alt="" /> */}
          <h4>Dr Kanthamani Sundarkrishnan</h4>
          <p className="font-weight-light mb-0">"Very tasty paratha, quality of atta as well as the aval is awesome"</p>
        </div>
      </div>
      <div className="col-sm-4">
        <div className="testimonial-item mb-5">
          {/* <img class="img-fluid img-circle mb-3" src="about/testimonials-1.jpg" alt="" /> */}
          <h4>Janani Ram</h4>
          <p className="font-weight-light mb-0">"All veggies r too good and tasty... Especially cabbage and kovakkai is awesome."</p>
        </div>
      </div>
      <div className="col-sm-4">
        <div className="testimonial-item mb-5">
          {/* <img class="img-fluid img-circle mb-3" src="about/testimonials-2.jpg" alt="" /> */}
          <h4>Ramya Sivaraman</h4>
          <p className="font-weight-light mb-0">"Coconut oil so pure. Tasty seethaphal ... and delicious yelakki too fantastic ..."</p>
        </div>
      </div>
    </Row>
  </Card>
);

Testimonials.propTypes = {};

export default Testimonials;
