import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
/* eslint-disable max-len, no-return-assign */
import React from 'react';
import { toast } from 'react-toastify';
import { withTracker } from 'meteor/react-meteor-data';
import { ZhInvoices } from '../../../../api/ZhInvoices/ZhInvoices';
import { format } from 'date-fns';

import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import ListGroupItem from 'react-bootstrap/ListGroupItem';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import { useNavigate } from 'react-router-dom';
import constants from '../../../../modules/constants';
import { getNumDaysBetween } from '../../../../modules/helpers';
import ListCreditNotes from '../../CreditNotes/ListCreditNotes/ListCreditNotes';
// import NPSFeedBack from '../../FeedBacks/NPSFeedBack/NPSFeedBack';
// import SurveyFeedBack from '../../FeedBacks/SurveyFeedBack/SurveyFeedBack';
import ProductFit from '../../FeedBacks/ProductFit/ProductFit';
import ListPayments from '../../Payments/ListPayments/ListPayments';
import ShowStatement from '../../Payments/Statement';
import AddToWallet from './AddToWallet';
import OrderSummaryRow from './OrderSummaryRow';
import ShowReturnables from './ShowReturnables';
import InvoiceListItem from './InvoiceListItem';

import './MyOrdersList.scss';

const feedBackPeriodInDays = 3000; // was 30 before

class MyOrderList extends React.Component {
  constructor(props) {
    super(props);
    const { loggedInUser } = this.props;
    this.state = {
      showFeedBackForm: false, // disable for now
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
      return 'nav-link text-secondary';
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

    if (
      !lastDate ||
      (!latestOrder.receivedFeedBack &&
        getNumDaysBetween(new Date(), lastDate) > feedBackPeriodInDays)
    ) {
      return latestOrder._id;
    }
    return '';
  }

  handleTabSelect = (key) => {
    // Call the appropriate handler based on the selected tab
    if (this.props.onTabSelect) {
      if (key === '1') {
        this.props.onTabSelect('orders');
      } else if (key === '4') {
        this.props.onTabSelect('invoices');
      }
    }
  };

  render() {
    const { showFeedBackForm } = this.state;
    const {
      orders = [], 
      productReturnables = [], 
      loggedInUser = {},
      invoices = [], 
      invoicesLoading = false,
      orderFilter = 'Active'
    } = this.props;
    
    this.feedBackPostId = this.showFeedBack(orders);
    // const showFeedBackForm = this.state.showFeedBackForm && this.feedBackPostId;

    // Filter orders based on the current filter
    const filteredOrders = orders.filter((order) => {
      if (orderFilter === 'All') return true;
      return order.order_status !== 'Delivered' && order.order_status !== 'Cancelled';
    });
    
    // Calculate number of awaiting payments
    const numberOfAwaitingPayments = orders.filter(
      (order) => order.paymentStatus === 'Pending'
    ).length;
    
    // Sort invoices by date in descending order
    const sortedInvoices = [...invoices].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
    
    // Prepare order rows for rendering
    const displayOrderRows = filteredOrders.map((order) => (
      <ListGroupItem
        key={order._id}
        onClick={() => {
          this.props.navigate(`/order/${order._id}`);
        }}
        style={{ cursor: 'pointer' }}
      >
        <OrderSummaryRow
          orderDate={order.createdAt}
          orderAmount={order.total_bill_amount}
          order_status={order.order_status}
          invoices={order.invoices}
          userWallet={this.state.wallet}
        />
      </ListGroupItem>
    ));

    return (
      <div>
        <AddToWallet
          userWallet={this.state.wallet}
          numberOfAwaitingPayments={numberOfAwaitingPayments}
        />

        <Row className="my-2 pb-3 MyOrderList">
          <Tabs 
            
            id="orders-tabs" 
            onSelect={this.handleTabSelect}
          >
            <Tab eventKey={1} title="Orders" tabClassName="text-center px-2">
              <ul className="nav justify-content-end bg-body py-1">
                <li className="nav-item text-center">
                  <Button
                    variant="link"
                    className={this.setClasses('Active')}
                    onClick={(e) => {
                      this.onFilterChange(e, 'Active');
                    }}
                    name="Active"
                  >
                    Active
                  </Button>
                </li>
                <li className="nav-item" style={{ paddingTop: '8px' }}>
                  /
                </li>
                <li className="nav-item text-center">
                  <Button
                    variant="link"
                    className={this.setClasses('All')}
                    onClick={(e) => {
                      this.onFilterChange(e, 'All');
                    }}
                    name="All"
                  >
                    All
                  </Button>
                </li>
              </ul>
              {orders.length > 0 ? (
                <div>
                  {showFeedBackForm && (
                    <ProductFit onClose={this.receiveProductFit} />
                  )}

                  <ListGroup className="orders-list">
                    {displayOrderRows}
                  </ListGroup>
                </div>
              ) : (
                <Alert variant="light">
                  You do not have any active orders.
                </Alert>
              )}
            </Tab>
          {/*
            <Tab
              eventKey={2}
              title="Statements"
              tabClassName="text-center px-2"
            >
              <ShowStatement
                emailVerified={this.props.emailVerified}
                loggedInUserId={this.props.loggedInUserId}
                emailAddress={this.props.emailAddress}
              />
            </Tab>
            */}
            <Tab eventKey={4} title="Invoices" tabClassName="text-center px-2">
              <div className="invoices-list card">
                <ListGroup>
                  <ListGroupItem className="bg-light fw-bold">
                    <Row>
                      <Col xs={4} md={3}>Status</Col>
                      <Col xs={4} md={4}>Date</Col>
                      <Col xs={3} md={4} className="text-end pe-0">Amount</Col>
                      <Col xs={1} />
                    </Row>
                  </ListGroupItem>
                  {invoicesLoading ? (
                    <ListGroupItem className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </ListGroupItem>
                  ) : sortedInvoices.length > 0 ? (
                    sortedInvoices.map((invoice) => (
                      <InvoiceListItem key={invoice._id || invoice.invoice_id} invoice={invoice} />
                    ))
                  ) : (
                    <ListGroupItem className="text-center py-4">
                      No invoices found
                    </ListGroupItem>
                  )}
                </ListGroup>
              </div>
            </Tab>
            <Tab
              eventKey={3}
              title="Refund Details"
              tabClassName="text-center px-2"
            >
              <ListCreditNotes />
            </Tab>
          </Tabs>
        </Row>
      </div>
    );
  }
}

MyOrderList.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.object),
  productReturnables: PropTypes.arrayOf(PropTypes.object),
  loggedInUser: PropTypes.shape({
    _id: PropTypes.string,
    emails: PropTypes.arrayOf(PropTypes.object),
    profile: PropTypes.shape({
      name: PropTypes.string,
      zh_contact_id: PropTypes.string,
    }),
    wallet: PropTypes.number,
  }).isRequired,
  loggedInUserId: PropTypes.string,
  emailVerified: PropTypes.bool,
  emailAddress: PropTypes.string,
  history: PropTypes.object.isRequired,
  myOrderViewFilter: PropTypes.func.isRequired,
  orderFilter: PropTypes.string,
  invoices: PropTypes.array,
  invoicesLoading: PropTypes.bool,
  onTabSelect: PropTypes.func,
  activeTab: PropTypes.oneOf(['orders', 'invoices']),
};

export const withRouter = (Component) => {
  const Wrapper = (props) => {
    const navigate = useNavigate();

    return <Component navigate={navigate} {...props} />;
  };

  return Wrapper;
};

export default withRouter(MyOrderList);
