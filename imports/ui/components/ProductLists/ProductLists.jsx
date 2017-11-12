import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem, Alert, Row, Col, Label } from 'react-bootstrap';
import { getDisplayDateTitle, getProductListStatus } from '../../../modules/helpers';
import constants from '../../../modules/constants';

const DisplayProductLists = ({ productLists }) => (
    productLists.length > 0 ? <ListGroup className="productsList-list">{
    productLists.map(({ _id, activeStartDateTime, activeEndDateTime }) => {
      const productListStatus = getProductListStatus(activeStartDateTime, activeEndDateTime);
      return (
        <ListGroupItem key={_id} href={`/productLists/${_id}`}>
          <ProductListTitleRow
            dateRangeToDisplay={getDisplayDateTitle(activeStartDateTime, activeEndDateTime)}
            statusToDisplay={constants.ProductListStatus[productListStatus].display_value}
            labelStyle={constants.ProductListStatus[productListStatus].label}
          />
        </ListGroupItem>
      );
    },
 )}
    </ListGroup> :
    <Alert bsStyle="info">No Product Lists have been created yet.</Alert>
);

export const ProductListTitleRow = ({ dateRangeToDisplay, labelStyle, statusToDisplay }) => (
  <Row>
    <Col xs={4} sm={3}> <Label bsStyle={labelStyle}> { statusToDisplay } </Label> </Col>
    <Col xs={8} sm={9}> { dateRangeToDisplay } </Col>
  </Row>
  );

DisplayProductLists.propTypes = {
  productLists: PropTypes.array,
};
export default DisplayProductLists;
