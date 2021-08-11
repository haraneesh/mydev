import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Panel,
} from 'react-bootstrap';

function ShowReturnables({ productReturnables }) {
  function retReturnableRowsForDisplay() {
    const productKeys = Object.keys(productReturnables);

    return productKeys.map((key) => (
      <Row key={key} className="d-flex align-items-center">
        <Col xs={3} className="text-center">
          <img src={productReturnables[key].image_path} height="64" width="64" />
        </Col>
        <Col xs={7} className="text-left">
          {productReturnables[key].productName}
        </Col>
        <Col xs={2} className="text-center">
          {productReturnables[key].quantitySold}
        </Col>
      </Row>
    ));
  }

  return (
    <div className="panel panel-default">
      <div className="panel-heading text-center" style={{ padding: '2px' }}>
        <h6 style={{ margin: '5px' }}> Recycle </h6>
        <p>Please return these and help us recycle </p>
      </div>

      <div className="panel-body">
        { retReturnableRowsForDisplay() }
      </div>
    </div>

  );
}

ShowReturnables.defaultProps = {
  productReturnables: {},
};

ShowReturnables.propTypes = {
  productReturnables: PropTypes.object,
};

export default ShowReturnables;
