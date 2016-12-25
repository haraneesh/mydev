import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import { Row, Col, ListGroupItem, Form, FormControl, Button, ControlLabel, Thumbnail } from 'react-bootstrap'
import { Bert } from 'meteor/themeteorchef:bert'
import { insertCartProduct } from '../../../api/cart/methods.js'

export default class InsertProduct extends Component {
  handleInsertCartProduct(productId) {
    const quantity = parseInt(ReactDOM.findDOMNode(this.refs.quantity).value.trim())
    console.log(quantity)
    if (quantity !== '' || event.keyCode === 13) {
      insertCartProduct.call({
        productId: productId,
        quantity: quantity,
      }, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger')
        } else {
          Bert.alert('Quantity updated!', 'success')
        }
      })
    }
  }
  render() {
    const { product } = this.props
    return (
      <div>
        <Row>
          <FormControl
            ref="quantity"
            type="number"
            standalone
          />
        </Row>
        <Row>
          <Button
            bsStyle="success"
            className="btn-block"
            onClick={ this.handleInsertCartProduct.bind(this, product._id) }>
            Add To Cart
          </Button>
        </Row>
      </div>
    )
  }
}
