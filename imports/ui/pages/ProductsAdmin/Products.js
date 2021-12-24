import React from 'react';
import { Row, Col } from 'react-bootstrap';
import ProductsList from '../containers/Products/ProductsList';

export const Products = ({ history }) => (
  <Row>
    <Col xs={12}>
      <h2 className="page-header">Products</h2>
      <ProductsList history={history} />
    </Col>
  </Row>
);
