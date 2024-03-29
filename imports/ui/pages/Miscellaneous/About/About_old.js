import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
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
      <>
        <div className="about-page">
          <Row className="about-section text-left bg-body m-2 p-2">
            <Col sm={6} className="about-getOrganic text-center">
              <h3> Authentic Organic & Wholesome</h3>
              <h4> Vegetables, Fruits, Groceries and products delivered home, in Chennai </h4>
              <p>100% Food - No Pesticides, No Artificial Colors, No Fillers, Non-toxic and sustainable</p>

              <Button className="membersBtn" variant="secondary" href="/login"> Members &rarr; </Button>
            </Col>
            <Col sm={6}>
              <img src="about/1.jpg" width="100%" />
            </Col>
          </Row>
        </diw>

    
          <Row className="text-center bg-body m-2 p-2">
            <h3 className="py-4"> Our Beliefs - Eating Healthy is</h3>
            <Col xs={12} sm={4}>
              <Row>
                <Col className="image_service" xs={12}>
                  <img src="about/agriculture1.png" height="120" width="120" />
                </Col>
                <Col className="describe_service" xs={12}>
                  <h4 className="name_service">
                    Eating Natural
                  </h4>
                  <p>
                    Our vegetables and farm made produce have no chemical pesticides, artificial
                    colouring agents and additives.
                  </p>
                </Col>
              </Row>
            </Col>
            <Col xs={12} sm={4}>
              <Row>
                <Col className="image_service" xs={12}>
                  <img src="about/agriculture3.png" height="120" width="120" />
                </Col>
                <Col className="describe_service" xs={12}>
                  <h4 className="name_service">
                    Eating Right
                  </h4>
                  <p>
                    We can help in creating a custom Basket for you that ensures that your family eats the
                    macro and micro nutrients necessary for your family's well being.
                  </p>
                </Col>
              </Row>
            </Col>
            <Col xs={12} sm={4}>
              <Row>
                <Col className="image_service" xs={12}>
                  <img src="about/agriculture2.png" height="120" width="120" />
                </Col>
                <Col className="describe_service" xs={12}>
                  <h4 className="name_service">
                    Eating Fresh
                  </h4>
                  <p>
                    Some nutrients in fruits and vegetables start to decay right after picking.
                    Eating fresh ensures that you get the full nutrition from food.
                  </p>
                </Col>
              </Row>
            </Col>
            <Col xs={12}>
              <h4>
                You can learn more about us from
                {' '}
                <Link className="visionLink" to="/vision">our vision</Link>
              </h4>
            </Col>
          </Row>

          <Row className="text-center">
            <Col xs={12}>
              <h4>
                <span className="text-danger">
                  <strong> New! </strong>
                </span>
              </h4>
              <h3> Create your Basket</h3>
              <p>Create custom basket according to your liking, health goals and tips on balanced diet. We will remember your choices and ship a basket based on your preferred cycle. </p>
              <p>No more hassle of remembering to order and having to decide what is good for your family every week. </p>
            </Col>
          </Row>
  
        <Row className="bg-body m-2 p-2">
          <div className="text-center">
            <h4>
              <p>
                To Join the community, do send us a Whatsapp Message at
                <br />
                <a href="tel:+919361032849" className="text-primary">+91 9361032849</a>
              </p>
            </h4>
          </div>
        </Row>
        <ContactUs />
      </>
    );
  }
}

About.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default About;
