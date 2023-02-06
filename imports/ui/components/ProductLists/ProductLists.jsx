import React from 'react';
import PropTypes from 'prop-types';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { getDisplayDateTitle, getProductListStatus } from '../../../modules/helpers';
import constants from '../../../modules/constants';

const DisplayProductLists = ({ productLists }) => (
  productLists.length > 0 ? (
    <ListGroup className="productsList-list">
      {
    productLists.map(({ _id, activeStartDateTime, activeEndDateTime }) => {
      const productListStatus = getProductListStatus(activeStartDateTime, activeEndDateTime);
      return (
        <ListGroup.Item key={_id} href={`/productLists/${_id}`} action>
          <ProductListTitleRow
            dateRangeToDisplay={getDisplayDateTitle(activeStartDateTime, activeEndDateTime)}
            statusToDisplay={constants.ProductListStatus[productListStatus].display_value}
            labelStyle={constants.ProductListStatus[productListStatus].label}
          />
        </ListGroup.Item>
      );
    })
}
    </ListGroup>
  )
    : <Alert variant="info">No Product Lists have been created yet.</Alert>
);

export const ProductListTitleRow = ({ dateRangeToDisplay, labelStyle, statusToDisplay }) => (
  <Row>
    <Col xs={4} sm={3}>
      {' '}
      <label>
        {' '}
        { statusToDisplay }
        {' '}
      </label>
      {' '}
    </Col>
    <Col xs={8} sm={9}>
      {' '}
      { dateRangeToDisplay }
      {' '}
    </Col>
  </Row>
);

DisplayProductLists.propTypes = {
  productLists: PropTypes.array,
};
export default DisplayProductLists;
