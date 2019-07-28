import React from 'react';
import {Panel} from 'react-bootstrap';

import './Testimonials.scss';

const Testimonials = () => (
    <Panel className="testimonials text-center">
      <h2 class="mb-5">What people are saying...</h2>
      <div class="row">
      <div class="col-sm-4">
          <div class="testimonial-item mb-3 ">
            {/*<img class="img-fluid img-circle mb-3" src="about/testimonials-3.jpg" alt="" />*/}
            <h5>Dr Kanthamani Sundarkrishnan</h5>
            <p class="font-weight-light mb-0">"Very tasty paratha, quality of atta as well as the aval is awesome"</p>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="testimonial-item mb-5">
            {/*<img class="img-fluid img-circle mb-3" src="about/testimonials-1.jpg" alt="" />*/}
            <h5>Janani Ram</h5>
            <p class="font-weight-light mb-0">"All veggies r too good and tasty... Especially cabbage and kovakkai is awesome."</p>
          </div>
        </div>
        <div class="col-sm-4">
          <div class="testimonial-item mb-5">
            {/*<img class="img-fluid img-circle mb-3" src="about/testimonials-2.jpg" alt="" />*/}
            <h5>Ramya Sivaraman</h5>
            <p class="font-weight-light mb-0">"Coconut oil so pure. Tasty seethaphal ... and delicious yelakki too fantastic ..."</p>
          </div>
        </div>
      </div>
  </Panel>
)

Testimonials.propTypes = {};

export default Testimonials;