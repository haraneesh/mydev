import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { withTracker } from 'meteor/react-meteor-data';
import Orders from '../../../../api/Orders/Orders';
import MyOrderList from '../../../components/Orders/MyOrdersList/MyOrdersList';
import Loading from '../../../components/Loading/Loading';
import constants from '../../../../modules/constants';

const MyOrders = ({ loading, loggedInUser, orders }) => (!loading ? (
  <Row>
    <Col xs={12}>
      <h3 className="page-header">My Orders</h3>
      <MyOrderList loggedInUser={loggedInUser} orders={orders} />
    </Col>
  </Row>
) : <Loading />);

MyOrders.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  orders: PropTypes.array.isRequired,
};

export default withTracker((args) => {
  const userWallet = Meteor.subscribe('users.userWallet');
  const orderSub = Meteor.subscribe('orders.mylist');

  return {
    loading: !userWallet.ready() || !orderSub.ready(),
    orders: Orders.find({}, { sort: { createdAt: constants.Sort.DESCENDING } }).fetch(),
    loggedInUser: args.loggedInUser,
    userWallet: args.loggedInUser.wallet,
  };
})(MyOrders);
