/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem, Alert, Row, Col, Label } from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../modules/settings';
import { getDisplayDate } from '../../../modules/helpers';
// import moment from 'moment';
// import 'moment-timezone';

import './MyOrdersList.scss';

const getInvoiceTotals = (invoices) => {
  if (!invoices) return;

  return invoices.reduce((previousValue, currentValue) => ({
    balanceInvoicedAmount: previousValue.balanceInvoicedAmount + currentValue.balanceInvoicedAmount,
    totalInvoicedAmount: previousValue.totalInvoicedAmount + currentValue.totalInvoicedAmount,
  }), {
    balanceInvoicedAmount: 0,
    totalInvoicedAmount: 0,
  });
};

const OrderTitleRow = ({
  statusToDisplay,
  labelStyle,
  invoice_Id,
  orderDate,
  orderAmount,
  invoiceTotals }) => (
    <Row>
      <Col xs={6} md={3} className="addSpace"> <Label bsStyle={labelStyle}> { statusToDisplay } </Label> </Col>
      <Col xs={6} md={3} className="addSpace"> { orderDate } </Col>
      {!invoiceTotals && (
      <Col xs={12} md={3} className="addSpace">
        <span className="text-muted">Amount: </span>
        <strong> { orderAmount } </strong>
      </Col>
    )}

    {invoiceTotals && (
      <Col xs={6} md={3} className="addSpace">
        <span className="text-muted">Amount: </span>
        <strong> { formatMoney(invoiceTotals.totalInvoicedAmount, accountSettings) } </strong>
      </Col>
    )}

    {invoiceTotals && invoiceTotals.balanceInvoicedAmount > 0 && (
      <Col xs={6} md={3} className="addSpace">
        <span className="text-muted">Pending: </span>
        <strong> { formatMoney(invoiceTotals.balanceInvoicedAmount, accountSettings) } </strong>
      </Col>
    )}
    </Row>
  );


const MyOrderList = ({ orders }) => (
      orders.length > 0 ? <ListGroup className="orders-list">{
      orders.map(({ _id, invoice_Id, order_status, createdAt, total_bill_amount, invoices }, index) => (
        <ListGroupItem key={_id} href={`/order/${_id}`}>
          <OrderTitleRow
            orderDate={getDisplayDate(createdAt)}
            orderAmount={formatMoney(total_bill_amount, accountSettings)}
            invoice_Id={invoice_Id}
            statusToDisplay={constants.OrderStatus[order_status].display_value}
            labelStyle={constants.OrderStatus[order_status].label}
            invoiceTotals={getInvoiceTotals(invoices)}
            key={`order-${index}`}
          />
        </ListGroupItem>
      ))
    }
      </ListGroup> :
      <Alert bsStyle="info">You are yet to place an order.</Alert>
);

MyOrderList.propTypes = {
  orders: PropTypes.array,
};

MyOrderList.defaultProps = {
  orders: [],
};

export default MyOrderList;
