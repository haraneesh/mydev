import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col,
} from 'react-bootstrap';

function ShowReturnables({ productReturnables }) {
  function retReturnableRowsForDisplay(productKeys) {
    const imgPath = (imagePath) => `${Meteor.settings.public.Product_Images}${imagePath}?${Meteor.settings.public.Product_Images_Version}`;

    if (productKeys.length > 0) {
      return productKeys.map((key) => {
        if (productReturnables[key].quantitySold > 0) {
          return (
            <Row key={key} className="d-flex align-items-center">
              <Col xs={3} sm={4} className="text-center">
                <img src={imgPath(productReturnables[key].image_path)} height="64" width="64" />
              </Col>
              <Col xs={7} sm={5} className="text-left">
                {productReturnables[key].productName}
              </Col>
              <Col xs={1} sm={3} className="text-center">
                {productReturnables[key].quantitySold}
              </Col>
            </Row>
          );
        }
      });
    }
  }

  const productKeys = Object.keys(productReturnables);

  if (productKeys.length > 0) {
    return (
      <div className="panel panel-default">
        <div className="panel-heading text-center" style={{ padding: '2px' }}>
          <h6 style={{ margin: '5px' }}> Let's Recycle </h6>
          <p>Please return these and help us recycle </p>
        </div>

        <div className="panel-body">
          { retReturnableRowsForDisplay(productKeys) }
        </div>
      </div>
    );
  }
  return <div />;
}

ShowReturnables.defaultProps = {
  productReturnables: {},
};

ShowReturnables.propTypes = {
  productReturnables: PropTypes.object,
};

export default ShowReturnables;
