import React from 'react';
import PropTypes from 'prop-types';
import { Row, Panel, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

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
            <h3 className="page-header"> Living Healthy, Made Easy </h3>
            <Col xs={12}>
              <p>Hello,</p>
              <p>We are a community of parents who pride ourselves on feeding our family tasty, nutrient-rich, fresh organic
                and non GMO food.</p>
              <p> Here, we connect, source, sell and share information about healthful food
                that nourishes and replenishes us. </p>
              <p>Food that is sourced here comes from our farms or from farmers and farms we know personally.</p>
            </Col>
            <Col xs={12}>
              <p>You can learn more about us from <Link className="visionLink" to={'/vision'}>our vision</Link></p>
            </Col>
          </Row>
          <Row className="text-left">
            <Col xs={12}>
              <p>
                We are invite only, to join us please call us at <span className="text-warning">+91 739 745 9010</span> or ask a member to send you
                an invite. We are always keen to welcome like minded members to learn from and share.
              </p>
            </Col>
          </Row>
          { !this.props.authenticated &&
          (<Row className="text-center member-section" >
            <Col xs={12}>
              <Button bsStyle="primary" href="/login"> Members &rarr; </Button>
            </Col>
          </Row>)
          }
        </Panel>
        <Row className="text-right" >
          {/* <img alt="" className="splash-banner" src="about/about_banner.png" />*/}
        </Row>
      </div>
    );
  }
}

About.propTypes = {
  authenticated: PropTypes.bool.isRequired,
};

export default About;
