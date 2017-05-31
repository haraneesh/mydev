import React from 'react'
import { ListGroup, ListGroupItem, Alert, Accordion, Panel, Row,  Col, Glyphicon, Label } from 'react-bootstrap'
import { formatMoney } from 'accounting-js'
import { accountSettings, dateSettings } from '../../../modules/settings'
import moment from 'moment'
import 'moment-timezone'
import PropTypes from 'prop-types'

const MyOrderList = ({ orders }) =>(
    orders.length > 0 ? <ListGroup className = "orders-list">{
    orders.map(({ _id, invoice_Id, order_status, createdAt, total_bill_amount }) => (
    <ListGroupItem key={ _id } href={`/order/${_id}`}>
       < OrderTitleRow
            orderDate =  { moment(createdAt).tz(dateSettings.timeZone).format(dateSettings.format) }
            orderAmount = { formatMoney(total_bill_amount, accountSettings) }
            invoice_Id = { invoice_Id }
            statusToDisplay = { constants.OrderStatus[order_status].display_value }
            labelStyle = { constants.OrderStatus[order_status].label }
      />
    </ListGroupItem>
    ))
  }
  </ListGroup> :
  <Alert bsStyle="info">You are yet to place an order.</Alert>
);

export const OrderTitleRow = ( { statusToDisplay, labelStyle, invoice_Id, orderDate, orderAmount } ) => (
    <Row>
      <Col xs = { 4 } sm = { 2 }> <Label bsStyle = { labelStyle }> { statusToDisplay } </Label> </Col>
      <Col xs = { 4 } sm = { 4 }> { orderDate } </Col>
      <Col xs = { 4 } sm = { 6 }> <span className = "text-muted"> Amount: </span> <strong> { orderAmount } </strong> </Col>
    </Row>
  )

MyOrderList.propTypes = {
  orders: PropTypes.array,
};
export default MyOrderList;
