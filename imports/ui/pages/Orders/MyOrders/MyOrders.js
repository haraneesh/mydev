import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { Orders } from '../../../../api/Orders/Orders';
import MyOrderList from '../../../components/Orders/MyOrdersList/MyOrdersList';
import Loading from '../../../components/Loading/Loading';
import constants from '../../../../modules/constants';
import WelcomeMessage from '../../../components/WelcomeMessage/WelcomeMessage';

const MyOrders = ({
  history, loading, loggedInUser, orders, emailVerified, loggedInUserId, emailAddress,
}) => (!loading ? (
  <Row>
    <Col xs={12}>
      <WelcomeMessage loggedInUser={loggedInUser} />

      <h3 className="page-header">My Orders</h3>
      <MyOrderList
        loggedInUser={loggedInUser}
        orders={orders}
        history={history}
        loggedInUserId={loggedInUserId}
        emailVerified={emailVerified}
        emailAddress={emailAddress}
      />

    </Col>
  </Row>
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
  const orderSub = Meteor.subscribe('orders.mylist');

  return {
    loading: !userWallet.ready() || !orderSub.ready(),
    orders: Orders.find({}, { sort: { createdAt: constants.Sort.DESCENDING } }).fetch(),
    loggedInUser: args.loggedInUser,
    userWallet: args.loggedInUser.wallet,
    emailVerified: args.emailVerified,
    loggedInUserId: args.loggedInUserId,
    emailAddress: args.emailAddress,

  };
})(MyOrders);
