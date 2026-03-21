import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FarmAccordion from './FarmAccordion';

function OurFarm() {
  return (
    <div className="py-4 px-sm-4 text-center">
      <h1 className="pb-2">
        Our Farm
      </h1>
      <p>
        We practice Regenerative Organic Farming
      </p>
      <Row>
        <Col xs={12} sm={6}>
          <FarmAccordion />
        </Col>

        <Col xs={12} sm={6} className="d-flex justify-content-center text-center p-2">
          <div style={{
            alignSelf: 'center',
            listStyleType: 'none',
            textAlign: 'left',
          }}
          >
            <p>
              Intent is to promote ecological balance, conserve biological diversity and regenerate the soil.
            </p>
            <p>
              This is a less intrusive way of organic farming, that sees soil, water, plants, animals and humans as interconnected parts of one whole system.
            </p>
            <p>
              The reality is that working with nature is complex, it takes patience and understanding of local ecological dynamics.
            </p>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default OurFarm;
