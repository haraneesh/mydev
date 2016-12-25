import React from 'react'
import { Row, Col } from 'react-bootstrap'
import ProductsList from '../containers/products-list.js'

export const Products = () => (
  <Row>
    <Col xs={ 12 }>
      <h3 className="page-header">Products</h3>
      <ProductsList />
    </Col>
  </Row>
)
