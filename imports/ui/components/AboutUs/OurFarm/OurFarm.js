import React from 'react';
import { Row, Col } from 'react-bootstrap';
import FarmAccordion from './FarmAccordion';

function OurFarm() {
  return (
    <div className="page-header text-center no-padding">
      <h1>
        Our Farm
      </h1>
      <h4 style={{ display: 'block' }}>
        We practice Regenerative Organic Farming
      </h4>
      <Row>
        <Col xs={12} sm={6}>
          <FarmAccordion />
        </Col>

        <Col xs={12} sm={5} className="d-flex justify-content-center text-center panel-body offset-sm-1">
          <div style={{
            alignSelf: 'center',
            listStyleType: 'none',
            textAlign: 'left',
          }}
          >
            <h4>
              Intent is to promote ecological balance, conserve biological diversity and regenerate the soil.
            </h4>
            <h4>
              This is a less intrusive way of organic farming, that sees soil, water, plants, animals and humans as interconnected parts of one whole system.
            </h4>
            <h4>
              The reality is that working with nature is complex, it takes patience and understanding of local ecological dynamics.
            </h4>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default OurFarm;
