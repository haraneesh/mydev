/* eslint-disable max-len */
/* eslint-disable no-tabs */
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Panel, Row, Col, Button,
} from 'react-bootstrap';
import OurPromise from '../../../components/AboutUs/OurPromise/OurPromise';
import ContactUs from '../../../components/AboutUs/ContactUs/ContactUs';
import Testimonials from '../../../components/AboutUs/Testimonials/Testimonials';
import HomePageSlider from '../../../components/AboutUs/HomePageSlider/HomePageSlider';
import HighLightText from '../../../components/AboutUs/HighlightText/HighLightText';

import './About.scss';
import { relativeTimeRounding } from 'moment';

// class About extends React.Component {

const About = () => {
  useEffect(() => {
    // console.log("Here, useEffect act as componentDidMount")
    const bodyClassList = document.getElementsByTagName('body')[0].classList;
    bodyClassList.add('about-body');
    return () => {
      // componentWillUnmount
      // const bodyClassList = document.getElementsByTagName('body')[0].classList;
      bodyClassList.remove('about-body');
    };
  }, []);

  return (

    <div className="about-page">
      <section>
        <Panel>
          <div className="about-section text-left row d-flex align-items-center">
            <Col sm={6} xs={12} className="d-flex justify-content-center">
              <img src="about/basket_vegetables.png" style={{ width: '100%' }} alt="vegetable basket" />
            </Col>
            <Col sm={6} xs={12} className="about-getOrganic text-center">
              <h1> Fresh </h1>
              <h2> Organic and Natural </h2>
              <h4> produce delivered home, in Chennai </h4>
              <HighLightText highLightText="100% Food" />
              <Button className="membersBtn" bsStyle="primary" href="/login"> Shop Now &rarr; </Button>
            </Col>
          </div>
        </Panel>
      </section>

      <Panel>
        <OurPromise />
      </Panel>

      <Panel>
        <section className="text-center">
          <HomePageSlider />
        </section>
      </Panel>

      <Panel>
        <div className="text-center bodyCursText">
          <h2 className="page-header no-margin-no-padding"> Why Us</h2>
          <Row>
            <Col sm={3}>
              <h1 className="dt-align">6+ Years</h1>
              {' '}
              <p> promoting organic produce</p>
            </Col>
            <Col sm={3}>
              <h1 className="dt-align">9+ Years</h1>
              {' '}
              <p> Organic farmers network</p>
            </Col>
            <Col sm={3}>
              <h1 className="dt-align">1000+ families</h1>
              {' '}
              <p> as members</p>
            </Col>
            <Col sm={3}>
              <h1 className="dt-align">5 days</h1>
              {' '}
              <p> a week delivery</p>
            </Col>
          </Row>
        </div>
      </Panel>

      <Panel>
        <section className="text-left text-center-xs row" style={{ height: '20%' }}>
          <Col sm={5} className="d-flex align-items-center justify-content-center">
            <h2>
              Our journey, from the
              <br />
              person behind Suvai
            </h2>
          </Col>
          <Col sm={7} className="panel-body">
            <div
              className="video"
            >
              <iframe
                title="Success Story Of Divya Pamuru, Namma Suvai"
                style={{
                  position: 'relative',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '20em',
                  borderRadius: '10px',
                }}
                src="https://www.youtube.com/embed/KLpGnPyJcKE"
                frameBorder="0"
              />

            </div>
          </Col>
        </section>
      </Panel>

      {/*
      <Panel>
        <Col xs={12} className="text-center">
          <h2 className="page-header"> Belong to a Better Market</h2>
          <p style={{ padding: '0 0 2.5rem 0' }}>
            Suvai is an online community that leverages the power of direct buying to deliver the consumers best healthy food and natural products
            while ensuring that the farmer gets paid above market prices thus encouraging them to continue doing good.
          </p>
          <p style={{ padding: '0 0 2.5rem 0' }}>
            We work with passionate farmers who are into natural farming for about 10+ years inspite of struggling to market their produce.
            We collect the produce from them at reasonable prices (mostly fixed by them) and cater to our members at affordable prices.
          </p>
          <p style={{ padding: '0 0 2.5rem 0' }}>
            We began working with a few, select farmers and supplied to our close friends and families.
            Now, We are proud to say that we are able to source more than 250 products (a range of fruits, vegetables and groceries) from over 500 farmers of 3 FPOs spanning across
            3 states Andhra, Tamilnadu and Karnataka.
          </p>
        </Col>
      </Panel> */}

      {/*
	 <Panel>
		<section className="text-center">
			<h1 className="page-header"> Our Quality Manifesto </h1>
			<Col xs={12}>
				<div>
					<Col className="describe_service" xs={12}>
							<h4 className="name_service">
								We carry only the best version of everything.
					  		</h4>
							  <p>
								  <ul>
									  <li> We visit the source or the farmer </li>
									  <li> We evaluate the producer </li>
									  <li> We validate the production process </li>
									  <li> We use it ourselves before we put it up</li>
									  <li> We listen to every feedback from the community </li>
								  </ul>
							  </p>

					</Col>
				</div>
			</Col>
		</section>
	</Panel> */}
      {/*
	<Panel>
		<div class="how-section1">
			<div class="row">
				<h1 className="page-header"> Suvai Story </h1>
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
	<div className="text-center">
	<Col xs={12}>
		<h4><span className="text-danger"> <strong> New! </strong> </span> </h4> <h1> Create your Basket</h1>
			<p>Create custom basket according to your liking, health goals and tips on balanced diet. We will remember your choices and ship a basket based on your preferred cycle. </p>
			<p>No more hassle of remembering to order and having to decide what is good for your family every week. </p>
		</Col>
		</div>
	</Panel>

        <Panel>
          <div>
            <Col xs={12} sm={12} className="page-header text-center no-padding">
              <h1> <span> We Deliver Here </span> </h1>
            </Col>
          </div>
          <section className="text-left">
            <Col xs={12} sm={4}>
            Valasravakkam, Ramapuram, Virugambakkam, koyembedu, Anna nagar,Kelly's, Kilpauk, Egmore, Chetpet, Choolaimedu, Kodambakkam, Vadapalani, Saligrammam, KK Nagar, Ashok Nagar, Arumbakkam, Nanganallur, Velachery, Cathedral road, Mylapore, Rangarajapuram, Adayar, Besant Nagar, Perungudi

              <ul>
                <li>Ramapuram</li>
                <li>Virugambakkam</li>
                <li>Valasaravakkam</li>
                <li>Saligrammam</li>
                <li>KK Nagar</li>
                <li>Ashok Nagar</li>
                <li>Vadapalani</li>
                <li>Porur</li>
                <li>Iyapathangal</li>
              </ul>
            </Col>
            <Col xs={12} sm={4}>
              <ul>
                <li>Arumbakkam</li>
                <li>Anna nagar</li>
                <li>Koyembedu</li>
                <li>Kodambakkam</li>
                <li>Kelly's</li>
                <li>Kilpauk</li>
                <li>Egmore</li>
                <li>Chetpet</li>
                <li>Choolaimedu</li>
              </ul>
            </Col>
            <Col xs={12} sm={4}>
              <ul>
                <li>Adayar</li>
                <li>Nanganallur</li>
                <li>Velachery</li>
                <li>Cathedral road</li>
                <li>Mylapore</li>
                <li>Rangarajapuram</li>
                <li>Besant Nagar</li>
                <li>Perungudi</li>
              </ul>
            </Col>
        </section>
        </Panel> */}

      <Panel>
        <Col xs={12} className="text-center">
          <h4>
            <p>
              To Join the community, send us a Whatsapp Message at
              <br />
              <a href="tel:+919361032849" className="text-primary">+91 9361032849</a>
            </p>
          </h4>
        </Col>
      </Panel>

      <Testimonials />

      <ContactUs />
    </div>
  );
};

About.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default About;
