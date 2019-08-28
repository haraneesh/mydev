import React from 'react';
import PropTypes from 'prop-types';
import { Row, Panel, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ContactUs from '../../../components/ContactUs/ContactUs';
import Testimonials from '../../../components/Testimonials/Testimonials';

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
										<h3> Organic & Natural</h3> 
										<h4> produce delivered home, in Chennai </h4>
                  <p>100% Food - No Pesticides, No Artificial Colors, No Fillers</p>
				 {/* <Button className="membersBtn" bsStyle="primary" href="/login"> Members &rarr; </Button> */}
                </Col>
                <Col sm={6}>
                  <img src="about/1.jpg" width="100%"/>
                </Col>
				<Col xs={12} className="text-center">
				<h4> Try our sample basket </h4>
				<Button className="sampleBtn" bsStyle="primary" href="https://docs.google.com/forms/d/1nYjPnaM5E36RA-wjYHBGgWcFtWOd_UybB_1_fSKTCtY/"> Order Sample Basket &rarr; </Button>
			</Col>
			</Row>
      </Panel>

	  <Panel>
		<Row className="text-center">
			<h3 className="page-header no-margin-no-padding"> Why Us</h3>
			<Row>
				<Col sm={3} className="no-padding">
					<h3 class="dt-align">4+ Years</h3> promoting organic produce
				</Col>
				<Col sm={3} className="no-padding">
					<h3 class="dt-align">8+ Years</h3> Organic farmers network
				</Col>
				<Col sm={3} className="no-padding">
					<h3 class="dt-align">300+ families</h3> as members
				</Col>
				<Col sm={3} className="no-padding">
					<h3 class="dt-align">2 times</h3> a week delivery
				</Col>
			</Row>	
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
								Eating Variety
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
{/*
	<Panel>
		<div class="how-section1">
			<div class="row">
				<h3 className="page-header"> Suvai Story </h3>
				<div class="col-md-2">
					<h1 class="dt-align">2014</h1>
				</div>
				<div class="col-md-10">
					<h4>Farming</h4>
					<h4 class="subheading">We started as Farmers</h4>
					<p>
						Our friends turned Organic farmers and spent their time learning organic farming and turning their barren land around.
						Being interested in farming and coming from a farming background we took great interest in learning and helping them.
						We had slowly started rediscovering the values of Orgnic food and health benefits.
					</p>
				</div>
			</div>
			<div class="row">
				<div class="col-md-2">
					<h1 class="dt-align">2015</h1>
				</div>
				<div class="col-md-10">
					<h4>Spread the Word</h4>
								<h4 class="subheading">Most people are not fully aware</h4>
								<p>
									As our friends started selling their Organic produce, we realized that most people
									did not realize the benefits of Organic food and what a good wholesome plant based diet 
									could do to one's wellbeing.<br/>
									Years of marketing and ignorance of the changes happening in the farm have made general public oblivious
									to ill effects of modern farming and are used to artifical low costs of produce.
								</p>
				</div>
				
			</div>
			<div class="row">
				<div class="col-md-2">
					<h1 class="dt-align">2015</h1>
				</div>
				<div class="col-md-10">
					<h4>Variety</h4>
								<h4 class="subheading">People shop variety</h4>
								<p>
									From any one farm only a few varieties of ingredients can be produced. 
									However our diet needs several ingredients. We realized that unless we truly made a variety of Organic food available,
									it was diffivult for people to switch and reap the full benefits. 
									<br/>
									Farming and Distribution are both full time jobs. It is difficult to do both well at the same time.
								</p>
				</div>
			</div>
			<div class="row">
				<div class="col-md-2">
					<h1 class="dt-align">2015</h1>
				</div>
				<div class="col-md-10">
					<h4>Zero Budget Natural Farming</h4>
								<h4 class="subheading">Spread organic farming</h4>
								<p>
									For variety we need several farmers across many geographies to do organic farming. 
									ZBNF was started by a group of friends with this intent and we are a member and active participant.
									This gives us access to very good high quality produce and most importantly a sense of doing good for society.
								</p>
				</div>
			</div>
		</div>
	</Panel>
*/}

	{/*
	<Panel>
	<Row className="text-center">
	<Col xs={12}>
		<h4><span className="text-danger"> <strong> New! </strong> </span> </h4> <h3> Create your Basket</h3>
			<p>Create custom basket according to your liking, health goals and tips on balanced diet. We will remember your choices and ship a basket based on your preferred cycle. </p>
			<p>No more hassle of remembering to order and having to decide what is good for your family every week. </p> 
		</Col>
		</Row>
	</Panel>
	*/}

	<Panel>
	   <Row className="text-center">
       <h4> <p> To Join the community, do send us a Whatsapp Message at <br /> <a href="tel:+917397459010" className="text-primary">+91 7397459010</a> </p></h4>
       </Row>
	</Panel>

	<Testimonials />

    <ContactUs />
      </div>
    );
  }
}

About.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default About;
