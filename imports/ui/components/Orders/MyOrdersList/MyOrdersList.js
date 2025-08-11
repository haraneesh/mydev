import { format } from 'date-fns';
import { Meteor } from 'meteor/meteor';
import orderCommon from '../../../../modules/both/orderCommon';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
/* eslint-disable max-len, no-return-assign */
import React from 'react';
import { toast } from 'react-toastify';
import { ZhInvoices } from '../../../../api/ZhInvoices/ZhInvoices';

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
import InvoiceListItem from './InvoiceListItem';
import { FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import OrderSummaryRow from './OrderSummaryRow';
import ShowReturnables from './ShowReturnables';

import './MyOrdersList.scss';

const feedBackPeriodInDays = 3000; // was 30 before

class MyOrderList extends React.Component {
  constructor(props) {
    super(props);
    const { loggedInUser } = this.props;
    this.state = {
      showFeedBackForm: false, // disable for now
      wallet: loggedInUser.wallet,
      invoicesTabLoaded: false, // Track if invoices tab has been loaded
      activeTabKey: '1', // Track active tab
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
    // Update active tab state
    this.setState({ activeTabKey: key });

    // Only load invoices data when the invoices tab is first accessed
    if (key === '4' && !this.state.invoicesTabLoaded) {
      this.setState({ invoicesTabLoaded: true });

      // Call parent's onTabSelect for data loading
      if (this.props.onTabSelect) {
        this.props.onTabSelect('invoices');
      }
    } else if (key === '1' && this.props.onTabSelect) {
      this.props.onTabSelect('orders');
    }
  };

  // Create skeleton loader for invoices
  renderInvoicesSkeleton() {
    const skeletonRows = Array.from({ length: 5 }, (_, index) => (
      <ListGroupItem key={`skeleton-${index}`} className="py-3">
        <Row>
          <Col xs={4} md={3}>
            <div className="placeholder-glow">
              <span className="placeholder col-8"></span>
            </div>
          </Col>
          <Col xs={4} md={4}>
            <div className="placeholder-glow">
              <span className="placeholder col-10"></span>
            </div>
          </Col>
          <Col xs={3} md={4} className="text-end pe-0">
            <div className="placeholder-glow">
              <span className="placeholder col-6"></span>
            </div>
          </Col>
          <Col xs={1} />
        </Row>
      </ListGroupItem>
    ));

    return skeletonRows;
  }

  render() {
    const { showFeedBackForm, invoicesTabLoaded, activeTabKey } = this.state;
    const {
      orders = [],
      productReturnables = [],
      loggedInUser = {},
      invoices = [],
      invoicesLoading = false,
    } = this.props;

    this.feedBackPostId = this.showFeedBack(orders);
    // const showFeedBackForm = this.state.showFeedBackForm && this.feedBackPostId;

    // Sort invoices by date in descending order
    const sortedInvoices = [...invoices].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    return (
      <div>
        <AddToWallet userWallet={this.state.wallet} />

        <Row className="my-2 pb-3 MyOrderList">
          <Tabs
            id="orders-tabs"
            activeKey={activeTabKey}
            onSelect={this.handleTabSelect}
            mountOnEnter={false}
            unmountOnExit={false}
          >
            <Tab eventKey="1" title="Orders" tabClassName="text-center px-2">
              {orders.length > 0 ? (
                <div>
                  {showFeedBackForm && (
                    <ProductFit onClose={this.receiveProductFit} />
                  )}

                  <ListGroup variant="flush" className="border-bottom">
                    <ListGroupItem className="py-2">
                      <Row className="fw-bold">
                        <Col xs={4} md={3}>Status</Col>
                        <Col xs={4} md={4}>Date</Col>
                        <Col xs={4} md={5} className="text-end pe-4">Amount</Col>
                      </Row>
                    </ListGroupItem>
                    {orders.map((order) => {
                      const invoiceTotals = order.invoices && orderCommon.getInvoiceTotals(order.invoices);
                      const displayAmount = invoiceTotals
                        ? invoiceTotals.totalInvoicedAmount
                        : order.total_bill_amount || 0;
                      
                      const orderStatus = constants.OrderStatus[order.order_status] || {};
                      
                      const formatDate = (dateString) => {
                        try {
                          return new Date(dateString).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          });
                        } catch (error) {
                          return 'Invalid date';
                        }
                      };
                      
                      const formatCurrency = (amount) => {
                        return new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          minimumFractionDigits: 2,
                        }).format(amount || 0);
                      };
                      
                      return (
                        <ListGroupItem key={order._id} className="py-3 px-3" action>
                          <Link 
                            to={`/order/${order._id}`} 
                            className="text-decoration-none text-dark d-block"
                          >
                            <Row className="align-items-center g-0">
                              <Col xs={4} md={3} className="pe-2">
                                <span 
                                  className={`badge bg-${orderStatus.label || 'secondary'} text-capitalize`}
                                  style={{ 
                                    whiteSpace: 'nowrap', 
                                    overflow: 'hidden', 
                                    textOverflow: 'ellipsis', 
                                    display: 'inline-block', 
                                    maxWidth: '100%' 
                                  }}
                                >
                                  {orderStatus.display_value || order.order_status}
                                </span>
                              </Col>
                              <Col xs={4} md={4} className="text-truncate pe-2">
                                {formatDate(order.createdAt)}
                              </Col>
                              <Col xs={3} md={4} className="text-end pe-2">
                                {formatCurrency(displayAmount)}
                              </Col>
                              <Col xs={1} className="text-end">
                                <FaChevronRight className="text-muted" />
                              </Col>
                            </Row>
                          </Link>
                        </ListGroupItem>
                      );
                    })}
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
              eventKey="2"
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
            <Tab eventKey="4" title="Invoices" tabClassName="text-center px-2">
              <div className="invoices-list card">
                <ListGroup>
                  <ListGroupItem className="fw-bold">
                    <Row>
                      <Col xs={4} md={3}>
                        Status
                      </Col>
                      <Col xs={4} md={4}>
                        Date
                      </Col>
                      <Col xs={3} md={4} className="text-end pe-0">
                        Amount
                      </Col>
                      <Col xs={1} />
                    </Row>
                  </ListGroupItem>
                  {/* Only load invoices data if tab has been accessed */}
                  {!invoicesTabLoaded ? (
                    <ListGroupItem className="text-center py-4">
                      <div className="text-muted">
                        Click to load invoices...
                      </div>
                    </ListGroupItem>
                  ) : invoicesLoading ? (
                    // Use skeleton loading instead of spinner
                    this.renderInvoicesSkeleton()
                  ) : sortedInvoices.length > 0 ? (
                    sortedInvoices.map((invoice) => (
                      <InvoiceListItem
                        key={invoice._id || invoice.invoice_id}
                        invoice={invoice}
                      />
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
              eventKey="3"
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
