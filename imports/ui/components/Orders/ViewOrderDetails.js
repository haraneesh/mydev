import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from 'react-bootstrap/Badge';
import { formatMoney } from 'accounting-js';
import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import { accountSettings, dateSettings } from '../../../modules/settings';
import constants from '../../../modules/constants';
import { ViewOrderProducts } from './ViewOrderProducts/ViewOrderProducts';

const ViewOrderDetails = ({ order, heading }) => {
  const navigate = useNavigate();
  const isEditable = order.order_status === constants.OrderStatus.Pending.name || 
                    order.order_status === constants.OrderStatus.Saved.name;
  const title = heading || moment(order.createdAt).format(dateSettings.format);
  
  return (
    <div className="ViewOrderDetails mb-4">
      <div className="py-4 ps-2">
        <Row>
          <Col xs={isEditable ? 8 : 12}>
            <h3 className="float-start">
              {title}
            </h3>
          </Col>
          {isEditable && (
            <Col xs={4} className="text-end">
              <Button 
                variant="primary" 
                size="sm"
                className="me-2"
                onClick={() => navigate(`/order/${order._id}`)}
              >
                Edit Order
              </Button>
            </Col>
          )}
        </Row>
      </div>
      <Card>
        <Row>
          <Col xs={12} className="p-2">
            {(() => {
              const statusObj = order.order_status ? constants.OrderStatus[order.order_status] : undefined;
              const label = statusObj ? statusObj.label : 'secondary';
              const text = statusObj ? statusObj.display_value : (order.order_status || '--');
              return (
                <Badge bg={label}>
                  {text}
                </Badge>
              );
            })()}
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
            <Col xs={12} className="text-end">
              Amount:
              <strong>
                {'  '}
                {formatMoney(order.total_bill_amount, accountSettings)}
                {' '}
              </strong>
            </Col>
          </Row>
        </div>
      </Card>
    </div>
  );
};

ViewOrderDetails.propTypes = {
  order: PropTypes.object.isRequired,
  heading: PropTypes.string,
};

export default ViewOrderDetails;
