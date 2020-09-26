import React from 'react';
import {
  Panel, Label, Row, Col,
} from 'react-bootstrap';
import { dateSettings } from '../../../modules/settings';
import constants from '../../../modules/constants';
import { getDisplayShortDate, displayUnitOfSale } from '../../../modules/helpers';

function SupplierOrderDetailsView(args) {
  const { supplierOrder } = args;

  return (
    <Panel style={{ textAlign: 'left' }}>
      <Col xs={6} style={{ marginBottom: '3rem' }}>
        <Label bsStyle={constants.OrderStatus[supplierOrder.order_status].label}>
          {constants.OrderStatus[supplierOrder.order_status].display_value}
        </Label>
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
    </Panel>
  );
}

export default SupplierOrderDetailsView;
