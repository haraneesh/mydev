import React from 'react'
import { ListGroup, Alert } from 'react-bootstrap'
import  Product  from './product'

export const ProductsList = ({ products }) => (
  products.length > 0 ? <ListGroup className="products-list">
    {products.map((product) => (
      <Product key={ product._id } product={ product } />
    ))}
  </ListGroup> :
  <Alert bsStyle="warning">No products yet.</Alert>
)

ProductsList.propTypes = {
  products: React.PropTypes.array,
}
