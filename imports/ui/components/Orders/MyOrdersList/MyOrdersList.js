/* eslint-disable max-len, no-return-assign */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Bert } from 'meteor/themeteorchef:bert';
import { ListGroup, ListGroupItem, Alert, Tabs, Tab } from 'react-bootstrap';
// import NPSFeedBack from '../../FeedBacks/NPSFeedBack/NPSFeedBack';
// import SurveyFeedBack from '../../FeedBacks/SurveyFeedBack/SurveyFeedBack';
import ProductFit from '../../FeedBacks/ProductFit/ProductFit';
import { getNumDaysBetween } from '../../../../modules/helpers';
import constants from '../../../../modules/constants';
import OrderSummaryRow from './OrderSummaryRow';
import AddToWallet from './AddToWallet';
import ListCreditNotes from '../../CreditNotes/ListCreditNotes/ListCreditNotes';
import ListPayments from '../../Payments/ListPayments/ListPayments';

const feedBackPeriodInDays = 30;

export default class MyOrderList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showFeedBackForm: true,
      wallet: this.props.loggedInUser.wallet,
    };
    this.feedBackPostId = '';
    this.receiveFeedBack = this.receiveFeedBack.bind(this);
    this.receiveProductFit = this.receiveProductFit.bind(this);
    this.saveFeedBack = this.saveFeedBack.bind(this);
    this.showFeedBack = this.showFeedBack.bind(this);
  }

  componentDidMount() {
    this.checkAndSyncUserWallet();
  }

  checkAndSyncUserWallet() {
    Meteor.call('users.getUserWallet', {}, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      }
    });
  }

  receiveProductFit({ ratingsObjectWithValue }) {
    this.setState({
      showFeedBackForm: false,
    });

    const ratingsArrayWithValue = [];

    Object.keys(ratingsObjectWithValue).forEach((key) => {
      ratingsArrayWithValue.push(ratingsObjectWithValue[key]);
    });

    this.saveProductFit(ratingsArrayWithValue);
  }

  saveProductFit(ratingsArrayWithValue) {
    const methodToCall = 'feedbacks.insertSurvey';
    const fB = {
      postId: this.feedBackPostId,
      postType: constants.PostTypes.Order.name,
      feedBackType: 'SURVEY',
      ratingsArrayWithValue,
    };

    Meteor.call(methodToCall, fB, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Thank you for your feedback', 'success');
      }
    });
  }

  receiveFeedBack(feedBack) {
    this.setState({
      showFeedBackForm: false,
    });
    this.saveFeedBack(feedBack);
  }

  saveFeedBack(feedBack) {
    const methodToCall = 'feedbacks.upsert';
    const fB = {
      postId: this.feedBackPostId,
      postType: constants.PostTypes.Order.name,
      feedBackType: 'PRODUCTFIT',
      rating: feedBack.rating,
      questionAsked: feedBack.questionAsked,
      description: feedBack.description,
    };

    Meteor.call(methodToCall, fB, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert('Thank you for your feedback', 'success');
      }
    });
  }

  showFeedBack(orders) {
    if (orders.length < 1) {
      return '';
    }

    const latestOrder = orders[0];
    if (latestOrder.order_status !== constants.OrderStatus.Completed.name) {
      return '';
    }

    let lastDate = null;
    orders.find((order, index) => {
      if (order.receivedFeedBack === true) {
        lastDate = order.createdAt;
        return true;
      }
      return false;
    });

    if (!lastDate || (!latestOrder.receivedFeedBack &&
        getNumDaysBetween(new Date(), lastDate) > feedBackPeriodInDays)
    ) {
      return latestOrder._id;
    }
    return '';
  }

  render() {
    const { orders } = this.props;
    this.feedBackPostId = this.showFeedBack(orders);
    const showFeedBackForm = this.state.showFeedBackForm && this.feedBackPostId;
    // const showFeedBackForm = true;

    const displayOrderRows = [];
    let numberOfAwaitingPayments = 0;

    orders.map(
    (
      {
    _id,
        invoice_Id,
        order_status,
        createdAt,
        total_bill_amount,
        invoices,
  },
      index,
    ) => {
 displayOrderRows.push(
      <ListGroupItem key={_id} href={`/order/${_id}`}>
          <OrderSummaryRow
            orderDate={createdAt}
            orderAmount={total_bill_amount}
            order_status={order_status}
            invoices ={invoices}
            key={`order-${index}`}
            userWallet={this.state.wallet}
          />
        </ListGroupItem>,
      );

      if (order_status === constants.OrderStatus.Awaiting_Payment.name) {
        numberOfAwaitingPayments += 1;
      }
    },
  );

    return (
      <div>
        <AddToWallet userWallet={this.state.wallet} numberOfAwaitingPayments={numberOfAwaitingPayments} />

        <Tabs defaultActiveKey={1} id="" bsStyle="pills">
          <Tab eventKey={1} title="Orders" tabClassName=" text-center">
            {
                orders.length > 0 ? (
                  <div>
                    {showFeedBackForm && (
                      <ProductFit
                        onClose={this.receiveProductFit}
                      />
                    )}

                    <ListGroup className="orders-list">
                      {displayOrderRows}
                    </ListGroup>

                  </div>
                ) : (
                  <Alert bsStyle="info">You are yet to place an order.</Alert>
                  )
              }
          </Tab>
          <Tab eventKey={2} title="Payments" tabClassName=" text-center">
            <ListPayments />
          </Tab>
          <Tab eventKey={3} title="Refunds" tabClassName=" text-center">
            <ListCreditNotes />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

MyOrderList.propTypes = {
  orders: PropTypes.array,
  loggedInUser: PropTypes.object.isRequired,
};

MyOrderList.defaultProps = {
  orders: [],
};
