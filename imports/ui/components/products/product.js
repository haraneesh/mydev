import React, { Component } from 'react'
import InsertProduct from './insert-product.js'
import { Row, Col, ListGroupItem, Form, FormControl, Button, ControlLabel, Thumbnail } from 'react-bootstrap'
import { Bert } from 'meteor/themeteorchef:bert'
import { insertCartProduct } from '../../../api/cart/methods.js'

export const Product = ({ product }) => (
  <ListGroupItem key={ product._id }>
    <Row>
      <Col xs={ 4 } sm={ 5 }>
        <Thumbnail src={ product.image } />
      </Col>
      <Col xs={ 4 } sm={ 5 }>
        <h2>{ product.name }</h2>
        <p>$ { product.price }</p>
        <p>{ product.description }</p>
      </Col>
      <Col xs={ 4 } sm={ 2 }>
        <InsertProduct product={ product }/>
      </Col>
    </Row>
  </ListGroupItem>
)
