import React from 'react';
import { Row, Col } from 'react-bootstrap';
import DisplayProductLists from '../../containers/ProductLists/DisplayProductLists';

const ProductLists = ({ history }) => (
  <Row>
    <Col xs={12}>
      <h3 className="page-header">All Product Lists</h3>
      <DisplayProductLists history={history} />
    </Col>
  </Row>
);

export default ProductLists;
