/* eslint-disable max-len, no-return-assign */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import {
  ListGroup, ListGroupItem, Alert, Tabs, Tab,
} from 'react-bootstrap';
// import NPSFeedBack from '../../FeedBacks/NPSFeedBack/NPSFeedBack';
// import SurveyFeedBack from '../../FeedBacks/SurveyFeedBack/SurveyFeedBack';
import ProductFit from '../../FeedBacks/ProductFit/ProductFit';
import { getNumDaysBetween } from '../../../../modules/helpers';
import constants from '../../../../modules/constants';
import OrderSummaryRow from './OrderSummaryRow';
import AddToWallet from './AddToWallet';
import ListCreditNotes from '../../CreditNotes/ListCreditNotes/ListCreditNotes';
import ListPayments from '../../Payments/ListPayments/ListPayments';
import ShowStatement from '../../Payments/Statement';

import './MyOrdersList.scss';

const feedBackPeriodInDays = 3000; // was 30 before

export default class MyOrderList extends React.Component {
  constructor(props) {
    super(props);
    const { loggedInUser } = this.props;
    this.state = {
      showFeedBackForm: true,
      wallet: loggedInUser.wallet,
    };
    this.feedBackPostId = '';
    this.receiveFeedBack = this.receiveFeedBack.bind(this);
    this.receiveProductFit = this.receiveProductFit.bind(this);
    this.saveFeedBack = this.saveFeedBack.bind(this);
    this.showFeedBack = this.showFeedBack.bind(this);
    this.onFilterChange = this.onFilterChange.bind(this);
    this.setClasses = this.setClasses.bind(this);
  }

  onFilterChange(event, filter) {
    const { myOrderViewFilter } = this.props;
    myOrderViewFilter(filter);
  }

  setClasses(buttonName) {
    const { orderFilter } = this.props;
    if (buttonName === orderFilter) {
      return 'nav-link active';
    }
    return 'nav-link';
  }

  checkAndSyncUserWallet() {
    Meteor.call('users.getUserWallet', {}, (error) => {
      if (error) {
        // toast.error(error.reason);
        toast.error(error.reason);
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
        toast.error(error.reason);
      } else {
        toast.success('Thank you for your feedback');
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
        toast.error(error.reason);
      } else {
        toast.success('Thank you for your feedback');
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

    if (!lastDate || (!latestOrder.receivedFeedBack
        && getNumDaysBetween(new Date(), lastDate) > feedBackPeriodInDays)
    ) {
      return latestOrder._id;
    }
    return '';
  }

  render() {
    const { orders } = this.props;
    this.feedBackPostId = this.showFeedBack(orders);
    // const showFeedBackForm = this.state.showFeedBackForm && this.feedBackPostId;
    const showFeedBackForm = false; // disable for now

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
      /* <ListGroupItem key={_id} href={`/order/${_id}`}> */
        displayOrderRows.push(
          <ListGroupItem key={_id} onClick={() => { this.props.history.push(`/order/${_id}`); }}>
            <OrderSummaryRow
              orderDate={createdAt}
              orderAmount={total_bill_amount}
              order_status={order_status}
              invoices={invoices}
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
        <AddToWallet userWallet={this.state.wallet} numberOfAwaitingPayments={numberOfAwaitingPayments} history={this.props.history} />

        <Tabs defaultActiveKey={1} id="" bsStyle="pills">
          <Tab eventKey={1} title="Orders" tabClassName=" text-center">
            <ul className="nav justify-content-end">
              <li className="nav-item">
                <a className={this.setClasses('Active')} onClick={(e) => { this.onFilterChange(e, 'Active'); }} name="Active" href="#"> Active</a>
              </li>
              <li className="nav-item" style={{ paddingTop: '10px', paddingRight: '5px' }}>/</li>
              <li className="nav-item">
                <a className={this.setClasses('All')} name="All" href="#" onClick={(e) => { this.onFilterChange(e, 'All'); }}> All </a>
              </li>
            </ul>
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
                <Alert bsStyle="info">
                  You do not have any active orders.
                </Alert>
              )
            }
          </Tab>
          <Tab eventKey={2} title="Payments" tabClassName=" text-center">
            <ListPayments />
          </Tab>
          <Tab eventKey={3} title="Refunds" tabClassName=" text-center">
            <ListCreditNotes />
          </Tab>
          <Tab eventKey={4} title="Statements" tabClassName="text-center">
            <ShowStatement
              emailVerified={this.props.emailVerified}
              loggedInUserId={this.props.loggedInUserId}
              emailAddress={this.props.emailAddress}
              history={this.props.history}
            />
          </Tab>
        </Tabs>
      </div>
    );
  }
}

MyOrderList.propTypes = {
  orders: PropTypes.array,
  loggedInUser: PropTypes.object.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
  emailVerified: PropTypes.bool.isRequired,
  emailAddress: PropTypes.string.isRequired,
  myOrderViewFilter: PropTypes.func.isRequired,
  orderFilter: PropTypes.string.isRequired,
};

MyOrderList.defaultProps = {
  orders: [],
};
