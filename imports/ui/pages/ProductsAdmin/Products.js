import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ProductsList from '../containers/Products/ProductsList';

export const Products = ({ history }) => (
  <Row>
    <Col xs={12}>
      <h2 className="py-4">Products</h2>
      <ProductsList history={history} />
    </Col>
  </Row>
);
