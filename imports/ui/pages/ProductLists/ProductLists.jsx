import React from 'react';
import { Row, Col } from 'react-bootstrap';
import DisplayProductLists from '../../containers/ProductLists/DisplayProductLists';

const ProductLists = ({ history }) => (
  <Row>
    <Col xs={12}>
      <h2 className="page-header">All Product Lists</h2>
      <DisplayProductLists history={history} />
    </Col>
  </Row>
);

export default ProductLists;
