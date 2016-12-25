import React from 'react'
import { Row, Col, ListGroupItem, Form, FormControl, Button } from 'react-bootstrap'
import { Bert } from 'meteor/themeteorchef:bert'
import { updateCartProductQty, removeCartProduct } from '../../../api/cart/methods.js'

const handleUpdateCartProductQty = (productId, event) => {
  const quantity = event.target.value.trim()
  if (quantity !== '' || event.keyCode === 13) {
    updateCartProductQty.call({
      _id: productId,
      update: { quantity },
    }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger')
      } else {
        Bert.alert('Quantity updated!', 'success')
      }
    })
  }
}

const handleRemoveCartProduct = (productId, event) => {
  event.preventDefault()
  if (confirm('Are you sure? This is permanent.')) {
    removeCartProduct.call({
      _id: productId,
    }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger')
      } else {
        Bert.alert('Product removed!', 'success')
      }
    })
  }
}

export const CartProduct = ({ cartProduct }) => (
  <ListGroupItem key={ cartProduct._id }>
    <Row>
      <Col xs={ 8 } sm={ 10 }>
        <Form horizontal>
          <h2>{ cartProduct.name }</h2>
          <p>{ cartProduct.price }</p>
          <p>{ cartProduct.description }</p>
          <FormControl
            type="number"
            standalone
            defaultValue={ cartProduct.quantity }
            onBlur={ handleUpdateCartProductQty.bind(this, cartProduct._id) }
          />
        </Form>
      </Col>
      <Col xs={ 4 } sm={ 2 }>
        <Button
          bsStyle="danger"
          className="btn-block"
          onClick={ handleRemoveCartProduct.bind(this, cartProduct._id) }>
          Remove
        </Button>
      </Col>
    </Row>
  </ListGroupItem>
)
