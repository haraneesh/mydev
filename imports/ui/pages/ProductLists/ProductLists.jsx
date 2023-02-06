import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import DisplayProductLists from '../../containers/ProductLists/DisplayProductLists';

const ProductLists = ({ history }) => (
  <Row>
    <Col xs={12} className="mb-4">
      <h2 className="py-4 ps-2">All Product Lists</h2>
      <DisplayProductLists history={history} />
    </Col>
  </Row>
);

export default ProductLists;
