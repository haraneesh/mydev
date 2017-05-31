import React from 'react'
import { ListGroup, Alert } from 'react-bootstrap'
import { CartProduct } from './cart-product.js'
import PropTypes from 'prop-types'

export const CartProductsList = ({ cartProducts }) => (
  cartProducts.length > 0 ? <ListGroup className="products-list">
    {cartProducts.map((cartProduct) => (
      <CartProduct key={ cartProduct._id } cartProduct={ cartProduct } />
    ))}
  </ListGroup> :
  <Alert bsStyle="warning">No products in cart yet.</Alert>
)

CartProductsList.propTypes = {
  cartProducts: PropTypes.array,
}
