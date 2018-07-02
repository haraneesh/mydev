import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import MyOrderList from '../../../containers/Orders/MyOrdersList';

const MyOrders = ({ history, loggedInUser }) => (
  <Row>
    <Col xs={12}>
      <h3 className="page-header">My Orders</h3>
      <MyOrderList history={history} loggedInUser={loggedInUser} />
    </Col>
  </Row>
);

export default MyOrders;

MyOrders.propTypes = {
  history: PropTypes.object.isRequired,
  loggedInUser: PropTypes.object.isRequired,
};
