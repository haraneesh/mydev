import React from 'react'
import { Row, Col } from 'react-bootstrap'
import ProductsOrderList from '../../containers/orders/ProductsOrderList'

const Order = () => (
    <ProductsOrderList dateValue = {new Date()} />
)

export default Order
