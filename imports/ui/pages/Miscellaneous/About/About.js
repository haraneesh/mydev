import React from 'react';
import PropTypes from 'prop-types';
import { Row, Panel, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ContactUs from '../../../components/ContactUs/ContactUs';

import './About.scss';

class About extends React.Component {
  componentDidMount() {
   // $('body').attr('class', 'about-body');
    const bodyClassList = document.getElementsByTagName('body')[0].classList;
    bodyClassList.add('about-body');

    // const htmlClassList = document.getElementsByTagName('html')[0].classList;
    // htmlClassList.add('aboutHtml');
  }

  componentWillUnmount() {
    // $('body').removeClass('about-body');
    const bodyClassList = document.getElementsByTagName('body')[0].classList;
    bodyClassList.remove('about-body');

    // const htmlClassList = document.getElementsByTagName('html')[0].classList;
    // htmlClassList.remove('aboutHtml');
  }
  render() {
    // <img className = "about_to_lt" src="about/to_lt.jpg"/>
    // <img className = "about_to_rt" src="about/to_rt.jpg"/>
    // <img className = "about_bo_lt" src="about/bo_lt.jpg"/>
    // <img className = "about_bo_rt" src="about/bo_rt.jpg"/>

    return (
      <div>
        <Panel className="about-page">
          <Row className="about-section text-left">
            <Col xs={12}>
              <h3 className="page-header"> Living Healthy, Made Easy </h3>
              <h4>Welcome to Namma Suvai</h4>
              <Row>
                <Col xs={12}>
                  <p>
                     We are a community of parents who are trying to revive healthy eating habits for our kids and family.
                     To us Eating Healthy is,
                  </p>
                </Col>
                <Col xs={12}>
                  <h4> 1. Eat Natural </h4>

                  <p>
                      Our bodies are not capable of digesting synthetic chemicals or toxins.
                  </p>
                  <p>
                      We source food from our farms or from farmers and farms we know
                      personally. It has no chemical pesticides, artificial colouring agents and additives.
                  </p>
                </Col>
                <Col xs={12}>
                  <h4> 2. Eat Fresh</h4>

                  <p>
                      Some nutrients in fruits and vegetables start to decay right after picking.
                      Eating fresh ensures that you get the full nutrition from food.
                  </p>
                  <p>
                      We ensure that food reaches you within hours of picking.
                  </p>
                </Col>
                <Col xs={12}>
                  <h4> 3. Eat Right </h4>

                  <p>
                      We need several macro and micro nutrients in appropriate proportions for our well being.
                      So, It is imperative to eat the right food in the right proportions that our bodies needs.
                  </p>
                  <p>
                      We, as a community, share and recommend how much to eat and what to eat. To help you eat the right food in the right amounts.
                  </p>
                </Col>
                <Col xs={12}>
                  <p>You can learn more about us from <Link className="visionLink" to={'/vision'}>our vision</Link> or we can be reached at <span className="text-warning">+91 44 48569950</span>
                  </p>
                </Col>
                <Col xs={12}>
                  <p> We are always keen to welcome like minded members to learn from and share.</p>
                </Col>
              </Row>
              { !this.props.authenticated &&
          (<Row className="text-center member-section">
            <Col xs={12}>
                { /*<Button href="/signup">  Join </Button> */ }
                <Button bsStyle="primary" href="/login"> Members &rarr; </Button>
            </Col>
          </Row>)
          }

            </Col>
          </Row>
        </Panel>
        <Row className="text-right" >
          {/* <img alt="" className="splash-banner" src="about/about_banner.png" /> */}
        </Row>
        <ContactUs />
      </div>
    );
  }
}

About.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default About;
