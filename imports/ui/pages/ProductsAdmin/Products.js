import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProductsList from '../containers/Products/ProductsList';

export const Products = ({ history }) => (
  <Row>
    <Col xs={12}>
      <h3 className="page-header">Products</h3>
      <ProductsList history={history} />
    </Col>
  </Row>
);
