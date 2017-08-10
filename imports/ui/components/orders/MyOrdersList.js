import React from 'react';
import { ListGroup, ListGroupItem, Alert, Row, Col, Label } from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings, dateSettings } from '../../../modules/settings';
import { getDisplayDate } from '../../../modules/helpers';
//import moment from 'moment';
//import 'moment-timezone';
import PropTypes from 'prop-types';

const MyOrderList = ({ orders }) => (
      orders.length > 0 ? <ListGroup className="orders-list">{
      orders.map(({ _id, invoice_Id, order_status, createdAt, total_bill_amount }, index) => (
        <ListGroupItem key={_id} href={`/order/${_id}`}>
          < OrderTitleRow
            orderDate={getDisplayDate(createdAt)}
            orderAmount={formatMoney(total_bill_amount, accountSettings)}
            invoice_Id={invoice_Id}
            statusToDisplay={constants.OrderStatus[order_status].display_value}
            labelStyle={constants.OrderStatus[order_status].label}
            key={`order-${index}`}
        />
        </ListGroupItem>
      ))
    }
      </ListGroup> :
      <Alert bsStyle="info">You are yet to place an order.</Alert>
);
 
export const OrderTitleRow = ({ statusToDisplay, labelStyle, invoice_Id, orderDate, orderAmount }) => (
  <Row>
    <Col xs={12} sm={3}> <Label bsStyle={labelStyle}> { statusToDisplay } </Label> </Col>
    <Col xs={6} sm={5}> { orderDate } </Col>
    <Col xs={6} sm={4}> <span className="text-muted"> Amount: </span> <strong> { orderAmount } </strong> </Col>
  </Row>
  );

MyOrderList.propTypes = {
  orders: PropTypes.array,
};
export default MyOrderList;
