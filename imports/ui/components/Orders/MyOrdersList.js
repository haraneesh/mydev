/* eslint-disable max-len, no-return-assign */

import React from 'react';
import PropTypes from 'prop-types';
import { ListGroup, ListGroupItem, Alert, Row, Col, Label, Glyphicon } from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../modules/settings';
import { getDisplayShortDate,getNumDaysBetween } from '../../../modules/helpers';
import ModalFeedBack from '../FeedBacks/ModalFeedBack/ModalFeedBack';
import constants from '../../../modules/constants';

import './MyOrdersList.scss';


const feedBackPeriodInDays = 15;
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
  icon,
  invoiceTotals }) => (
    <Row>
      <Col xs={11}>
        <Row>
          <Col xs={12} sm={3}>
            <Label bsStyle={labelStyle}> { statusToDisplay } </Label>
          </Col>
          <Col xs={12} sm={9}>
            <strong>
              { orderDate }
            </strong>
          </Col>
        </Row>
        <Row>
          <Col xs={12} >
            <Row>
              <Col xs={6}>
                <span className="text-muted">Amount: </span>
              </Col>
              <Col xs={6}>
                {(invoiceTotals && invoiceTotals.balanceInvoicedAmount > 0) ? (
                  <span className="text-muted">Pending: </span>
                  ) : ''}

              </Col>
            </Row>
            <Row>
              <Col xs={6}>
                { invoiceTotals ?
                    formatMoney(invoiceTotals.totalInvoicedAmount, accountSettings) :
                    orderAmount
                }

              </Col>
              <Col xs={6}>
                {(invoiceTotals && invoiceTotals.balanceInvoicedAmount > 0) ?
                formatMoney(invoiceTotals.balanceInvoicedAmount, accountSettings) : '' }
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>

      <Col xs={1} className="alignVertCenter addSpace">
        <span className="text-muted">
          <Glyphicon glyph="menu-right" bsSize="large" />
        </span>
      </Col>
    </Row>
  );


const OrderTitleRow1 = ({
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

export default class MyOrderList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showFeedBackForm: true,
    };
    this.feedBackPostId = '';
    this.receiveFeedBack = this.receiveFeedBack.bind(this);
    this.saveFeedBack = this.saveFeedBack.bind(this);
    this.showFeedBack = this.showFeedBack.bind(this);
  }

  receiveFeedBack(feedBack) {
    this.setState({
      showFeedBackForm: false,
    });
    this.saveFeedBack(feedBack);
  }

  saveFeedBack(feedBack, postId){
    const methodToCall = 'feedbacks.upsert';
    const fB = {
      postId: this.feedBackPostId,
      postType: constants.PostTypes.Order.name,
      description:feedBack.description,
      rating:feedBack.rating,
    };

    Meteor.call(methodToCall, fB, (error, feedBackId) => {
      if (error){
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Thank you for your feedback', 'success');
      }
    });
  }

  showFeedBack(orders){

    if (orders.length < 0){
      return '';
    }

    let lastDate = null;
    orders.find(function(order, index){
      if (order.receivedFeedBack === true ){
        lastDate = order.createdAt;
        return true;
      }
      return false;
    });

    const latestOrder = orders[0];

    if (!lastDate) {
      return latestOrder._id;
    }


    if (latestOrder.order_status === constants.OrderStatus.Completed.name &&
       latestOrder.receivedFeedBack === false && 
       (getNumDaysBetween(new Date(), lastDate) > feedBackPeriodInDays)
      ){
          return latestOrder._id;
    }
    return '';
  }

  render() {
    const { orders } = this.props;
    this.feedBackPostId = this.showFeedBack(orders);
    const showFeedBackForm = this.state.showFeedBackForm && this.feedBackPostId;
    return (
      orders.length > 0 ?  
      (<div>
      
      { showFeedBackForm && <ModalFeedBack 
        onClose={this.receiveFeedBack} 
        feedBackQuestion = {`How would you rate your experience, in the last ${feedBackPeriodInDays} days?`} /> 
        }

      {
      (<ListGroup className="orders-list">{
      orders.map(({ _id, invoice_Id, order_status, createdAt, total_bill_amount, invoices }, index) => (
          <ListGroupItem key={_id} href={`/order/${_id}`}>
            <OrderTitleRow
              orderDate={getDisplayShortDate(createdAt)}
              orderAmount={formatMoney(total_bill_amount, accountSettings)}
              invoice_Id={invoice_Id}
              statusToDisplay={constants.OrderStatus[order_status].display_value}
              labelStyle={constants.OrderStatus[order_status].label}
              invoiceTotals={getInvoiceTotals(invoices)}
              key={`order-${index}`}
              icon={constants.OrderStatus[order_status].icon}
            />
          </ListGroupItem>
        ))}
      </ListGroup>)}</div>):
      (<Alert bsStyle="info">You are yet to place an order.</Alert>)
    );
  }
}


MyOrderList.propTypes = {
  orders: PropTypes.array,
};

MyOrderList.defaultProps = {
  orders: [],
};

