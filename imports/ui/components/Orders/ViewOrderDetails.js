import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import { formatMoney } from 'accounting-js';
import moment from 'moment';
import 'moment-timezone';
import PropTypes from 'prop-types';
import { accountSettings, dateSettings } from '../../../modules/settings';
import constants from '../../../modules/constants';
import { ViewOrderProducts } from './ViewOrderProducts/ViewOrderProducts';

class ViewOrderDetails extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = { order: this.props.order };
  }

  render() {
    const { order } = this.props;
    return (
      <div className="ViewOrderDetails mb-4">
        <div className="py-4 ps-2">
          <Row>
            <Col xs={12}>
              <h3 className="pull-left">
                {' '}
                {moment(order.createdAt)
                  .tz(dateSettings.timeZone)
                  .format(dateSettings.format)}
                {' '}
              </h3>
            </Col>
          </Row>
        </div>
        <Card>
          <Row>
            <Col xs={12} className="p-2">
              <Badge bg={constants.OrderStatus[order.order_status].label}>
                {constants.OrderStatus[order.order_status].display_value}
              </Badge>
            </Col>
          </Row>
          <div className="orderDetails">
            <ViewOrderProducts products={order.products} />
            <Row className="p-2">
              <Col xs={12}>
                <strong> Notes for packaging team </strong>
              </Col>
              <Col xs={12}>
                {order.comments}
              </Col>
            </Row>
          </div>
          <div className="card-footer">
            <Row>
              <Col xs={12} className="text-right">
                Amount:
                <strong>
                  {'  '}
                  {formatMoney(order.total_bill_amount, accountSettings)}
                  {' '}
                </strong>
                {' '}
              </Col>
            </Row>
          </div>
        </Card>
      </div>
    );
  }
}

ViewOrderDetails.propTypes = {
  order: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default ViewOrderDetails;
