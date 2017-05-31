import React from 'react';
import { Row, Panel, Col, Button } from 'react-bootstrap';

class About extends React.Component {
  componentDidMount() {
     $("body").attr("class","about-body")
  }
  componentWillUnmount() {
     $("body").removeClass("about-body")
  }
  render(){

    //<img className = "about_to_lt" src="about/to_lt.jpg"/>
    //<img className = "about_to_rt" src="about/to_rt.jpg"/>
    //<img className = "about_bo_lt" src="about/bo_lt.jpg"/>
    //<img className = "about_bo_rt" src="about/bo_rt.jpg"/> 

    return (
      <div>
       <h3 className="page-header">Hello!</h3>
       <Panel className = "about-page">
              <Row className = "about-section text-left">
                <Col xs = { 12 }>
                  <p>Namma Suvai is a community of parents who believe that feeding our family healthy organic food comes first. </p>
                  <p>We buy, source and share information about healthy food. All food that is sourced here comes from our farms or from farmers and farms we know personally.</p>
                  <p>We are an invite only community, to join us you will have to know one of our members. If you do, please ask them to send you an invite. </p>
                </Col>
              </Row>
              <Row className = "text-left">
                <Col xs = { 12 }>
                  <p>Thanks for your interest in us. We will be glad if you can send us a Hi, at Hi[AT]nammasuvai.com</p>
                </Col>
              </Row>
              <Row className = "text-center member-section" >
                <Col xs = { 12 }>
                  <Button bsStyle="primary" href="/login"> Members &rarr; </Button>
                </Col>
              </Row>
        </Panel>
        <Row className = "text-right" >
          <img className = "splash-banner" src="about/about_banner.png"/> 
        </Row>
       </div>
    )
  }
}

export default About
