import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import ManageAllOrders from '../../containers/Admin/ManageAllOrders';

const AllOrders = ({ history }) => (
  <Row>
    <Col xs={12}>
      <h3 className="page-header">All Orders</h3>
      <ManageAllOrders history={history} />
    </Col>
  </Row>
);

AllOrders.propTypes = {
  history: PropTypes.object.isRequired,
};

export default AllOrders;
