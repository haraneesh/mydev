/* eslint-disable max-len */
/* eslint-disable no-tabs */
import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Col, Button } from 'react-bootstrap';
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
          <div className="about-section text-left">
            <Col sm={6} className="no-padding">
              <img src="about/1.jpg" width="100%" alt="food" />
            </Col>
            <Col sm={6} className="about-getOrganic text-center">
              <h3> Organic & Natural</h3>
              <h4> produce delivered home, in Chennai </h4>
              <p>No Pesticides, No Artificial Colors, No Fillers, Non-toxic and Sustainable</p>
              <Button className="membersBtn" bsStyle="primary" href="/login"> Shop Now &rarr; </Button>
            </Col>
          </div>
          {/* <div>
             <Col sm={12} className="text-center">
              <h4>  Member </h4>
              <Button className="sampleBtn" bsStyle="primary" href="/order"> Place Order </Button>
            </Col>
            <Col sm={6} className="text-center">
              <h4> Not a Member </h4>
              <Button className="sampleBtn" href="https://docs.google.com/forms/d/1nYjPnaM5E36RA-wjYHBGgWcFtWOd_UybB_1_fSKTCtY/"> Order Sample Basket </Button>
            </Col>
              </div> */}
        </Panel>

        <Panel>
          <Col xs={12} className="text-center">
            <h3 className="page-header"> Belong to a Better Market</h3>

            <p>
              Suvai is an online community that leverages the power of direct buying to deliver the consumers best healthy food and natural products
              while ensuring that the farmer gets paid above market prices thus encouraging them to continue doing good.
            </p>
            <p>
              We work with passionate farmers who are into natural farming for about 10+ years inspite of struggling to market their produce.
              We collect the produce from them at reasonable prices (mostly fixed by them) and cater to our members at affordable prices.
            </p>
            <p>
              We began working with a few, select farmers and supplied to our close friends and families.
              Now, We are proud to say that we are able to source more than 250 products (a range of fruits, vegetables and groceries) from over 500 farmers of 3 FPOs spanning across
              3 states Andhra, Tamilnadu and Karnataka.
            </p>
          </Col>
        </Panel>

        <Panel>
          <div className="text-center bodyCursText">
            <h3 className="page-header no-margin-no-padding"> Why Us</h3>

            <Col sm={3}>
              <h3 className="dt-align">4+ Years</h3> <p> promoting organic produce</p>
            </Col>
            <Col sm={3}>
              <h3 className="dt-align">8+ Years</h3> <p> Organic farmers network</p>
            </Col>
            <Col sm={3}>
              <h3 className="dt-align">300+ families</h3> <p> as members</p>
            </Col>
            <Col sm={3}>
              <h3 className="dt-align">2 times</h3> <p> a week delivery</p>
            </Col>

          </div>
        </Panel>

        <Panel>
          <div>
            <Col xs={12} sm={12} className="page-header text-center no-padding">
              <h3> <span> Our Belief - Eating Healthy Is </span> </h3>
            </Col>
            {/*
			<Col xs={12} sm={6} className="text-center no-padding">
					<div className="heading-text">
						<h3 style={{width:'100%'}}> <span> Our Belief</span> </h3>
					</div>
			</Col>
		  <Col xs={12} sm={6} className="text-left-not-xs no-padding">
			<div>
				<div class="heading-text">
					<svg class="heading-highlight" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 197 43">
						<path d="M172.6 35h.9c-.2-.2-.5-.7-.7-.7-1.4-.1-2.7-.1-4.4-.2 0 0-.2.3-.1.4.4 1 1.3.9 2.2.7.7-.3 1.4-.2 2.1-.2zm-6.2.2c.1 0 .4-.1.6-.2-.4-.2-.7-.4-1.1-.6-.2.1-.3.2-.5.3.3.2.6.4 1 .5zm-2.3-.2c.1-.5 0-.9 0-1.4-.5.1-1.1 0-1.4.2-1.3.8-2.5.6-3.7.1-.7-.3-1.5-.3-2.2-.5-.2.1-.4.3-.6.4-.2.2-.4.3-.6.5.3.1.5.1.8.2.9.1 1.7.2 2.6.3.6.1 1.2.1 1.8.2.8.1 1.7.1 2.5.2.2 0 .7-.1.8-.2zm-6.7 2c.3-.1.5-.3.7-.5-.2-.1-.3-.2-.6-.4l-.6.6c.2.2.4.4.5.3zm-1.4-3.8l-.1.1c.2 0 .5.1.7.1-.2 0-.4-.1-.6-.2zm.9-7.1c-.2 0-.3 0-.5.1.1.1.3.2.4.2 1.3.1 2.6.2 4 .2.1 0 .3-.1.4-.1-.1-.1-.2-.2-.3-.2l-3-.3v.1h-1zm3.8 7.4c-.2-.1-.3-.3-.5-.3-.1 0-.4.2-.4.2 0 .2.1.4.3.6.4-.3.5-.4.6-.5zm1.9-3.1c-.5-.1-.9-.3-1.3-.4-.6.2-1 .3-1.4.4.4.1.9.3 1.3.3.5-.1 1-.2 1.4-.3zm.2-4c-.2 0-.4.2-.5.2.1.1.3.2.4.2 1.6 0 3.2 0 4.9-.1-1.7 0-3.3-.2-4.8-.3zm-9.7 0c.3 0 .6-.1.9-.2-.3-.1-.5-.4-.8-.4-2.9-.2-5.9-.4-8.8-.5-1.4-.1-2.9-.1-4.3-.1-.2 0-.4.1-.6.1.2.1.4.2.7.2 1.3.1 2.7.3 4 .4v-.1c.6 0 1.2 0 1.8.1 2.3.2 4.7.4 7.1.5zM152 34c.1.1.4-.3.7-.4-.4-.2-.7-.4-1.1-.6-.2.2-.4.2-.5.3.3.2.6.5.9.7zm-3.5.3c.4-.2.8-.4 1.1-.5-.4-.2-.8-.4-1.2-.4-.2 0-.5.3-.7.4.2.1.5.3.8.5zm-2.6-1c.4-.1.8-.3 1.1-.5-.3-.1-.6-.3-1.1-.4-.3.2-.5.4-.7.5.2.2.5.5.7.4zm-4 2.8c.4-.2.6-.4.9-.5-.3-.1-.6-.4-1-.4s-.8.2-1.1.3l1.2.6zm1.9-27.4c-.2 0-.4.2-.7.2l.6.3.6-.3c-.2-.1-.4-.2-.5-.2zm-6.2 16.9c.2 0 .4-.1.5-.2-.2-.1-.3-.3-.5-.3-1.2-.1-2.4-.2-3.5-.2v.1c-.6 0-1.2 0-1.9.1-.3 0-.5.1-.8.2.3.1.5.2.8.2.8 0 1.5.1 2.3.1 1.1-.1 2.1 0 3.1 0zm-7.7-.2c.3 0 .5-.2.8-.3-.2-.1-.5-.3-.7-.3-1.5-.1-3-.1-4.5-.1-4.3-.1-8.6-.1-12.9-.2v-.2c-.3.1-.6.2-.8.2.3.1.5.3.8.3.3.1.7.1 1 .1l11.4.3c1.6.1 3.2.2 4.9.2zm-25-.4c.6-.2 1.1-.3 1.7-.4l-1.5-.3h-.1l-1.8.3c.5.1 1.1.3 1.7.4zM90.6 9.3c4.2-.1 8.4-.2 12.5-.3.2 0 .4 0 .6-.1-.2-.1-.4-.2-.6-.1-3.4.1-6.8.2-10.3.3v-.3c-.7 0-1.5 0-2.2.1-.2 0-.5.1-.7.2.2.1.5.2.7.2zm10.8 15.5c.2 0 .4-.1.6-.2-.2-.1-.4-.2-.7-.2-.7 0-1.4 0-2-.1-.7 0-1.2 0-1.8.1-.1 0-.2.1-.4.1.1.1.2.1.3.1 1.5.1 2.7.1 4 .2zm-6-.1c.1 0 .3-.1.4-.2-.1-.1-.3-.2-.4-.2h-2.5c-.6 0-.9.1-1.1.1-.2 0-.4.1-.6.1.2 0 .4.1.6.1 1.2.1 2.4.1 3.6.1zm-8.2 0c.1 0 .3-.1.4-.1-.1-.1-.3-.2-.4-.2-1.4 0-2.9.1-4.3.1v-.1c-.4 0-.7.1-1.1.1-.1 0-.3.1-.4.2.1 0 .3.1.4.1 1.8 0 3.6 0 5.4-.1zm-2.4 7.1c.3-.1.5-.1.8-.2v-.2c-.3 0-.6-.1-.8-.1-.8.1-1.5.3-2.2.5-.2 0-.3.2-.5.3.2.1.4.2.6.2.7-.2 1.5-.4 2.2-.7-.1.1-.1.2-.1.2zm-6.5-6.9c.3 0 .6-.1.9-.2-.5-.1-1-.3-1.5-.4-.2.1-.5.3-.7.4.5 0 .9.2 1.3.2zM75.2 9.4c.1 0 .2-.1.3-.2-.1 0-.2-.1-.4-.1-1.2 0-2.3.1-3.5.1v-.1h-.9c-.1 0-.2.1-.3.1.1 0 .2.1.2.1 1.6.1 3.1.1 4.6.1zm-7.8.1c.2-.1.3-.1.5-.2-.2 0-.4-.1-.5-.1-.2 0-.3.1-.5.1.1.1.3.1.5.2zm-1.9-.1c.1 0 .2-.1.4-.1-.2-.1-.3-.1-.4-.1-.1 0-.2.1-.3.1.1 0 .2.1.3.1zm13.2-.3c-.2 0-.3.1-.5.1.2.1.3.2.5.2 2.6 0 5.2 0 7.8-.1.1 0 .3-.1.4-.1-.2 0-.3-.1-.5-.1-1.8-.1-3.8-.1-5.7-.1v.1h-2zm55.1-.5c-.5 0-1.1.1-1.6.2.5.1 1 .2 1.4.3.7-.1 1.1-.2 1.6-.3-.5-.1-1-.2-1.4-.2zM41.1 34.9c.3 0 .6-.2.9-.3-.4-.1-.8-.3-1.2-.4-.4.1-.8.3-1.2.4.6.1 1.1.3 1.5.3zm-8.9-.2c.3 0 .6-.1.9-.2-.5-.1-.9-.3-1.3-.4-.3.1-.6.1-.8.2.2.1.5.2.7.3.2.1.4.1.5.1zM177 32c-.3.2-.4.3-.6.4.2.1.5.3.8.4.2 0 .4-.2.6-.3-.3-.1-.5-.3-.8-.5zm19.9 10.3c.1.1.1.4 0 .6-.1.1-.4.1-.5.1-4.8-.8-5.1-1.3-9.9-1.8-10.4-1.1-20.8-2.1-31.3-2.8-9.3-.6-18.7-1-28-1.3-8.1-.3-16.2-.3-24.3-.4-5.5-.1-11-.2-16.5-.1-8.7.1-17.4.3-26.1.3-4.9 0-9.8-.2-14.7-.3-8.8-.3-17.6-.6-26.4-.8-4.9-.1-9.8-.1-14.6-.1-1.4 0-2-.5-1.7-1.7.4-1.6.5-3.2-.1-4.9-.2-.5.1-1.2.1-1.8 0-.5.1-1 .1-1.5 0-.8.1-1.6-.1-2.3-.1-.3-.6-.8-.9-.8-1.4-.2-2-.7-1.9-2 .1-1.3-.1-2.6 0-3.8 0-.8.1-1.7.2-2.5 0-.2.1-.4.1-.5-.7-3.4.1-6.6.1-9.9C.5 1 .5.8 4 .7 12.7.5 21.5.4 30.2.4c5.8 0 11.6.1 17.4.1 4.6 0 9.2.1 13.7.1 6.5 0 13 0 19.5-.1C86.9.5 93.1.4 99.2.3c5.9-.1 11.7-.3 17.6-.3 3.9 0 7.8.1 11.7.2h10c5.3.1 10.5.2 15.8.4 6.7.2 13.3.5 20 .8 2.4.1 4.7.6 7 .9.1 0 .3.1.4.2-.2 0-.3.1-.5.1-.2.1-.3.2-.5.2.1.1.2.3.4.3.4.2.8.3 1.1.5.1.1.1.4.2.6.1.2.1.7.2.7 1.1.1.9.9 1.1 1.5 0 .1-.4.4-.6.4-1.3.1-2.6.1-3.9.2-.2 0-.4.2-.7.3.2.2.3.4.5.5 1.2.4 2.5.7 3.7 1.1.4.1.7.6 1 .9-.4.1-.8.3-1.1.3-3.7-.1-7.3-.4-11-.5-8-.3-15.9-.5-23.9-.7-.3 0-.7.1-1 .2.3.1.6.2 1 .3 5.2.2 10.3.3 15.5.6 5.8.3 11.6.7 17.3 1.1.8.1 1.5.2 2.2.4.4.2 1 .9.9 1-.5.6-1.1 1.4-1.8 1.4-1.3.1-2.6-.3-3.9-.3-1.6-.1-3.2 0-4.7 0-.1 0-.3.2-.4.3.2.1.3.3.5.3 2.3.3 4.6.5 6.9.8.2 0 .5.1.7.2-.2.1-.4.1-.6.2-.3.1-.6.2-1 .3.3.2.6.3.9.5.7.3 1.4.5 2.1.8.2.1.2.5.3.7-.3 0-.5.1-.8 0l-6-.6-7.8-.6c-.3 0-.7.2-1 .3.3.1.6.2.9.2 4.4.5 8.9.9 13.3 1.4.4 0 .8.2 1.2.4.9.4 1.7.8 2.5 1.3.2.1.3.2.5.2-.2 0-.3.1-.5.1-.1 0-.2.1-.3.2.1.1.3.2.4.2 1.4.3 1.8.5 3.2.8.2.1.4.3.6.4-.2.1-.4.1-.7.2-.2.1-.3.1-.5.2.1.1.3.2.4.3.2.1.4.3.5.4-.2 0-.5.1-.7.1-.7 0-1.5-.1-2.2-.1-.2 0 .5.1.2.2.2.1.4.3.6.3 2.4.5 2.8.9 3.5 1.5.2.2.4.2.6.3-.2 0-.5.1-.7.1-2.9-.1-2-.2-4.9-.3-.2 0-.4-.1-.6 0-.3.1-.5.3-.8.4.2.2.4.4.7.5 1 .2 1.1.4 2.1.5 2.6.4 1 .1 3.6.6.8.1 1.6.5 2.4.8.1 0 .2.2.3.2-.2.1-.3.2-.5.1-1.3-.1-2.5-.2-3.8-.3-2-.2.3.1-1.7 0-3.8-.3-6.6-.6-10.5-.9-3-.2-5.9-.3-8.9-.4.7.2 1.3.5 2 .6 5.3.6 10.6 1.1 15.8 1.7 3.3.4 3.2.7 6.5 1.2.8.1 1.5.5 2.2.7.2.1.3.2.4.3-.2.1-.3.2-.5.2-1.7 0-2.5.1-4.2 0-1.4-.1-1.3-.5-2.7.3-.1.1-.5-.1-.6-.2-.9-.6-.6-.8-1.9-.3-1 .4-2.4.2-3.6.1-2.3-.1-4.5-.4-6.8-.6-.2 0-.5.1-.7 0-2.2-1.1-4.6-.5-6.9-.8-.2 0-.4-.1-.7-.1-.4 0-.8 0-1.2.1 0 0-.1.2 0 .3.4.2.8.6 1.2.6 1.3.1 2.7.1 4.1.1.3 0 .6.1.8.3 1.1 1.1 2.7 1.3 4.3.6 1.3-.6 3.4-.1 4.4.7.6.5 1.7.8 2.6.9 3 .4 2.9.3 5.8.7 2.5.4 1.8.5 4.2 1.1.3.1.6.3.9.5-.3 0-.7.1-1 .1-4.3-.5-2.4-.2-6.7-.8-3-.4-6-.7-9.1-1-.5 0-1.1 0-1.4.3-.2.2-.1.9.1 1.2.3.3 1.1.6 1.5.5 1.9-.6 3.6.2 5.3.5.4.1.9.1 1.3.2.7.1 1.4.3 2.1.5.4.1.8.2 1.2.2 1.8 0 2.7 0 4.6.1 1.6.1-.3-.2 1.3.2 1.4.3 2.7.9 4 1.4.1 0 .2.2.3.3-.2.1-.3.1-.5.2-.9.2-1 .6-.4 1.2.9.5 1.3 1 1.7 1.5z"></path>
					</svg>
					<h3 style={{zIndex:2, width:'100%' }}>
						<span>Eating Healthy Is</span>
					</h3>
				</div>
			</div>
			</Col> */}
          </div>
          <section className="text-center">
            {/* <h3 className="page-header"> Our Beliefs - Eating Healthy is</h3> */}
            <Col xs={12} sm={4}>
              <div>
                <Col className="image_service" xs={12}>
                  <img src="about/agriculture1.png" height="120" width="120" />
                </Col>
                <Col className="describe_service" xs={12}>
                  <h4 className="name_service">
                    Eating Natural
                  </h4>
                  <p >
                    Our vegetables and farm made produce have no chemical pesticides, no artificial
                    colouring agents and no unnecessary additives.
                  </p>
                </Col>
              </div>
            </Col>
            <Col xs={12} sm={4}>
              <div>
                <Col className="image_service" xs={12}>
                  <img src="about/agriculture2.png" height="120" width="120" />
                </Col>
                <Col className="describe_service" xs={12}>
                  <h4 className="name_service">
                    Eating Variety
                  </h4>
                  <p>
                    Eat a variety of vegetables and beans of different colors and type while avoiding the ones that don't suit you and your family for a balanced diet.
                  </p>
                </Col>
              </div>
            </Col>
            <Col xs={12} sm={4}>
              <div>
                <Col className="image_service" xs={12}>
                  <img src="about/agriculture3.png" height="120" width="120" />
                </Col>
                <Col className="describe_service" xs={12}>
                  <h4 className="name_service">
                    Eating Whole Food
                  </h4>
                  <p>
                    Avoid highly processed food, refined sugar and refined flour. Choose mostly minimally processed, whole foods.
                  </p>
                </Col>
              </div>
            </Col>
            <Col xs={12}>
              <h4>You can learn more about us from <Link className="visionLink" to={'/vision'}>our vision</Link>
              </h4>
            </Col>
          </section>
        </Panel>

        {/*
	 <Panel>
		<section className="text-center">
			<h3 className="page-header"> Our Quality Manifesto </h3>
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
	<div className="text-center">
	<Col xs={12}>
		<h4><span className="text-danger"> <strong> New! </strong> </span> </h4> <h3> Create your Basket</h3>
			<p>Create custom basket according to your liking, health goals and tips on balanced diet. We will remember your choices and ship a basket based on your preferred cycle. </p>
			<p>No more hassle of remembering to order and having to decide what is good for your family every week. </p>
		</Col>
		</div>
	</Panel>


        <Panel>
          <div>
            <Col xs={12} sm={12} className="page-header text-center no-padding">
              <h3> <span> We Deliver Here </span> </h3>
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
            <h4> <p> To Join the community, do send us a Whatsapp Message at <br /> <a href="tel:+917397459010" className="text-primary">+91 7397459010</a> </p></h4>
          </Col>
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
