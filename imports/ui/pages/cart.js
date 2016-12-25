import React from 'react'
import { Row, Col } from 'react-bootstrap'
import CartProductsList from '../containers/cart-products-list.js'

export const Cart = () => (
  <Row>
    <Col xs={ 12 }>
      <h3 className="page-header">Cart</h3>
      <CartProductsList />
    </Col>
  </Row>
)
