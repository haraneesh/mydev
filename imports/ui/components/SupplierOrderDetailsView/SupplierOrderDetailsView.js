import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';

import { dateSettings } from '../../../modules/settings';
import constants from '../../../modules/constants';
import { getDisplayShortDate, displayUnitOfSale } from '../../../modules/helpers';

function SupplierOrderDetailsView(args) {
  const { supplierOrder } = args;

  return (
    <Row className="text-left">
      <Col xs={6} style={{ marginBottom: '3rem' }}>
        <Badge bg={constants.OrderStatus[supplierOrder.order_status].label}>
          {constants.OrderStatus[supplierOrder.order_status].display_value}
        </Badge>
      </Col>
      <Col xs={6} style={{ textAlign: 'right' }}>
        {getDisplayShortDate(supplierOrder.createdAt, dateSettings.timeZone)}
      </Col>
      { supplierOrder.products.map((product) => (
        <Row key={product._id}>
          <Col xs={8}>{product.name}</Col>
          <Col xs={4} className="text-right">
            {displayUnitOfSale(product.quantity, product.unitOfSale)}
          </Col>
        </Row>
      ))}
    </Row>
  );
}

export default SupplierOrderDetailsView;
