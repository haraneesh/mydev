import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'meteor/react-meteor-data';
import { Orders } from '../../../../api/Orders/Orders';
import MyOrderList from '../../../components/Orders/MyOrdersList/MyOrdersList';
import Loading from '../../../components/Loading/Loading';
import constants from '../../../../modules/constants';
import FivePlusOne from '/imports/ui/components/Payments/Coupons/FivePlusOne';
import WelcomeMessage from '../../../components/WelcomeMessage/WelcomeMessage';

const reactVarFilter = new ReactiveVar('Active');

const myOrderViewFilter = (filter) => {
  reactVarFilter.set(filter);
};

const MyOrders = ({
  history,
  loading,
  loggedInUser,
  orders,
  emailVerified,
  loggedInUserId,
  emailAddress,
  productReturnables,
}) => (!loading ? (
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
        myOrderViewFilter={myOrderViewFilter}
        orderFilter={reactVarFilter.get()}
        productReturnables={productReturnables}
      />

    </Row>
  </div>
) : <Loading />);

MyOrders.propTypes = {
  emailVerified: PropTypes.bool.isRequired,
  loggedInUser: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  orders: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  loggedInUserId: PropTypes.string.isRequired,
  emailAddress: PropTypes.string.isRequired,
};

export default withTracker((args) => {
  const userWallet = Meteor.subscribe('users.userWallet');
  const orderFilter = reactVarFilter.get();

  const orderStatusArray = (orderFilter === 'Active')
    ? [
      constants.OrderStatus.Pending.name,
      constants.OrderStatus.Processing.name,
      constants.OrderStatus.Awaiting_Fulfillment.name,
      constants.OrderStatus.Awaiting_Payment.name,
      constants.OrderStatus.Shipped.name,
      constants.OrderStatus.Partially_Completed.name,
    ]
    : Object.keys(constants.OrderStatus).map((cat) => constants.OrderStatus[cat].name);

  const orderSub = Meteor.subscribe('orders.list.status', orderStatusArray);

  return {
    loading: !userWallet.ready() || !orderSub.ready(),
    orders: Orders.find({}, { sort: { createdAt: constants.Sort.DESCENDING } }).fetch(),
    loggedInUser: args.loggedInUser,
    userWallet: args.loggedInUser.wallet,
    emailVerified: args.emailVerified,
    loggedInUserId: args.loggedInUserId,
    emailAddress: args.emailAddress,
    productReturnables: args.productReturnables,
  };
})(MyOrders);
