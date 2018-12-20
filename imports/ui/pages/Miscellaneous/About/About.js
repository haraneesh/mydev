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
                <Col sm={6} className="about-getOrganic text-center">
                  <h4 className="page-header"> 
					<span className="text-success">Get </span> <br />
					Variety of Fresh Naturally Grown Vegetables, and Farm products delivered in 
					<br />Chennai
				  </h4>
                  <p>100% Food - No Pesticides, No Artificial Colors, No Fillers</p>
				  <Button className="membersBtn" bsStyle="primary" href="/login"> Members &rarr; </Button>
                </Col>
                <Col sm={6}>
                  <img src="about/1.png" width="100%"/>
                </Col>
            </Row>
      </Panel>

	<Panel>
		<Row className="text-center">
		<h3 className="page-header"> Our Beliefs - Eating Healthy is</h3>
			<Col xs={12} sm={4}>
				<Row>
					<Col className="image_service" xs={12}>
						<img src="about/agriculture1.png" height="120" width="120"/>
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
						<img src="about/agriculture3.png" height="120" width="120"/>
					</Col>
					<Col className="describe_service" xs={12}>
							<h4 className="name_service">
								Eating Right
							</h4>
							<p>
							We can help in creating a custom Basket for you that ensures that your family eats the 
							macro and micro nutrients necessary for you family's well being.
					  		</p>
					</Col>
				</Row>
			</Col>
			<Col xs={12} sm={4}>
				<Row>
					<Col className="image_service" xs={12}>
						<img src="about/agriculture2.png" height="120" width="120"/>
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
                  <h4>You can learn more about us from <Link className="visionLink" to={'/vision'}>our vision</Link> 
                  </h4>
                </Col>
		</Row>
	</Panel>
	<Panel>
	<Row className="text-center">
	<Col xs={12}>
		<h4><span className="text-danger"> <strong> New! </strong> </span> </h4> <h3> Create your Basket</h3>
			<p>Create custom basket according to your liking, health goals and tips on balanced diet. We will remember your choices and ship a basket based on your preferred cycle. </p>
			<p>No more hassle of remembering to order and having to decide what is good for your family every week. </p> 
		</Col>
		</Row>
	</Panel>

	<Panel>
	   <Row className="text-center">
       <h4> <p> To Join the community, do send us a Whatsapp Message at <a href="tel:+917397459010" className="text-primary">+91 7397459010</a> </p></h4>
       </Row>
	</Panel>
    <ContactUs />
      </div>
    );
  }
}

About.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default About;
