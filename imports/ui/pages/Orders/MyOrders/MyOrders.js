import React, { useState, useCallback } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'meteor/react-meteor-data';
import { Orders } from '/imports/api/Orders/Orders';
import { getUserInvoices } from '/imports/api/ZhInvoices/methods';
import MyOrderList from '../../../components/Orders/MyOrdersList/MyOrdersList';
import Loading from '../../../components/Loading/Loading';
import constants from '../../../../modules/constants';
import FivePlusOne from '/imports/ui/components/Payments/Coupons/FivePlusOne';
import WelcomeMessage from '../../../components/WelcomeMessage/WelcomeMessage';

/*const reactVarFilter = new ReactiveVar('Active');

const myOrderViewFilter = (filter) => {
  reactVarFilter.set(filter);
};*/

const MyOrders = ({
  history,
  loading,
  loggedInUser,
  orders,
  emailVerified,
  loggedInUserId,
  emailAddress,
  productReturnables,
}) => {
  const [invoices, setInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  //const handleTabClick = useCallback(async (tab) => {
  async function handleTabClick (tab) {
    setActiveTab(tab);
    
    if (tab === 'invoices') {
      try {
        setInvoicesLoading(true);
        // Call the method to get invoices using async/await
        const result = await Meteor.callAsync('zhInvoices.getUserInvoices');
        setInvoices(result);
      } catch (error) {
        console.error('Error loading invoices:', error);
        // Handle error (e.g., show error toast)
      } finally {
        setInvoicesLoading(false);
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <Row>
        <Col xs={12}>
          <WelcomeMessage loggedInUser={loggedInUser} />
        </Col>
      </Row>
      <Row>
        <h2 className="py-4 text-center">My Orders</h2>
      </Row>
      <Row>
        <MyOrderList
          loggedInUser={loggedInUser}
          orders={orders}
          history={history}
          loggedInUserId={loggedInUserId}
          emailVerified={emailVerified}
          emailAddress={emailAddress}
          //myOrderViewFilter={myOrderViewFilter}
          //orderFilter={reactVarFilter.get()}
          productReturnables={productReturnables}
          invoices={invoices}
          invoicesLoading={invoicesLoading}
          onTabSelect={handleTabClick}
          activeTab={activeTab}
        />
      </Row>
    </div>
  );
};

MyOrders.propTypes = {
  emailVerified: PropTypes.bool.isRequired,
  loggedInUser: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  orders: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  productReturnables: PropTypes.array.isRequired,
  emailAddress: PropTypes.string.isRequired,
};

MyOrders.defaultProps = {
  productReturnables: [],
};

export default withTracker((args) => {
  const userWallet = Meteor.subscribe('users.userWallet');
 /* const orderFilter = reactVarFilter.get();

  const orderStatusArray = (orderFilter === 'Active')
    ? [
      constants.OrderStatus.Pending.name,
      constants.OrderStatus.Processing.name,
      constants.OrderStatus.Awaiting_Fulfillment.name,
      //constants.OrderStatus.Awaiting_Payment.name,
      constants.OrderStatus.Shipped.name,
      constants.OrderStatus.Partially_Completed.name,
    ]
    : Object.keys(constants.OrderStatus).map((cat) => constants.OrderStatus[cat].name); */

  const orderStatusArray =[
    constants.OrderStatus.Pending.name,
    constants.OrderStatus.Processing.name,
    constants.OrderStatus.Awaiting_Fulfillment.name,
    //constants.OrderStatus.Awaiting_Payment.name,
    constants.OrderStatus.Shipped.name,
    constants.OrderStatus.Partially_Completed.name,
  ];

  const orderSub = Meteor.subscribe('orders.list.status', orderStatusArray);

  return {
    loading: !userWallet.ready() || !orderSub.ready(),
    orders: Orders.find({}, { sort: { createdAt: constants.Sort.DESCENDING } }).fetch(),
    loggedInUser: args.loggedInUser,
    userWallet: args.loggedInUser.wallet,
    emailVerified: args.emailVerified,
    loggedInUserId: args.loggedInUserId,
    emailAddress: args.emailAddress,
    productReturnables: args.productReturnables || [],
  };
})(MyOrders);
