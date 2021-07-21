import React from 'react';
import { Row, Col } from 'react-bootstrap';

function OurPromise() {
  return (
    <div className="page-header text-center no-padding">
      <h1>
        Our promise to you
      </h1>
      <h7 style={{ display: 'block' }}>
        We believe living well begins with eating well.
        <br />
        That's why our food has
      </h7>
      <Row>
        <Col xs={12} sm={7} className="d-flex justify-content-center text-center panel-body">
          <div style={{ alignSelf: 'center', listStyleType: 'none', textAlign: 'left' }}>
            <h7>
              <p>
                <span className="underline">No</span>
                {' '}
                Pesticides
              </p>
            </h7>
            <h7>
              <p>
                <span className="underline">No</span>
                {' '}
                Preservatives
              </p>
            </h7>
            <h7>
              <p>
                <span className="underline">No</span>
                {' '}
                Artificial Colors
              </p>
            </h7>
            <h7>
              <p>
                <span className="underline">No</span>
                {' '}
                Artificial Flavor Enhancers
              </p>
            </h7>
            <h7>
              <p>
                <span className="underline">No</span>
                {' '}
                Artificial Sweetners
              </p>
            </h7>
            <h7>
              <p>
                <span className="underline">No</span>
                {' '}
                Refined flour (Maida, White flour)
              </p>
            </h7>
            <h7>
              <p>
                <span className="underline">No</span>
                {' '}
                Refined Sugar
              </p>
            </h7>
            <h7>
              <p>
                <span className="underline">No</span>
                {' '}
                Trans Fat and Unhealthy Oils
              </p>
            </h7>
          </div>
        </Col>
        <Col xs={12} sm={5} className="d-flex justify-content-center text-center">
          <img src="about/foodPlate.jpg" alt="Food Plate" style={{ maxWidth: '90%' }} />
        </Col>
      </Row>
      {/*
        <Col xs={12} sm={6} className="text-center no-padding">
          <div className="heading-text">
            <h1 style={{ width: '100%' }}>
              {' '}
              <span> Our Beh4ef</span>
              {' '}
            </h1>
          </div>
        </Col>
        <Col xs={12} sm={6} className="text-left-not-xs no-padding">
          <div />
        </Col>

</div>
      <section className="text-center">
        <Col xs={12} sm={4}>
          <div>
            <Col className="image_service" xs={12}>
              <img src="about/agriculture1.png" height="120" width="120" />
            </Col>
            <Col className="describe_service" xs={12}>
              <h6 className="name_service">
                Eating Natural
              </h7>
              <p style={{ padding: '0 2rem 0 2rem' }}>
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
              <h6 className="name_service">
                Eating Variety
              </h7>
              <p style={{ padding: '0 2rem 0 2rem' }}>
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
              <h6 className="name_service">
                Eating Whole Food
              </h7>
              <p style={{ padding: '0 2rem 0 2rem' }}>
                Avoid highly processed food, refined sugar and refined flour. Choose mostly minimally processed, whole foods.
              </p>
            </Col>
          </div>
        </Col>
        <Col xs={12}>
          <h4>
            You can learn more about us from
            {' '}
            <h4nk className="visionh4nk" to="/vision">our vision</h4nk>
          </h4>
        </Col>
      </section>
      */}
    </div>
  );
}

export default OurPromise;
