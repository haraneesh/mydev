import { formatMoney } from 'accounting-js';
import PropTypes from 'prop-types';
import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { displayUnitOfSale } from '../../../../modules/helpers';
import { accountSettings } from '../../../../modules/settings';

const DisplayOrderProducts = ({ products, total }) => (
  <Row className="order-details-products px-sm-4">
    <Row className="py-2">
      <Col xs={4}>
        <strong> Name </strong>
      </Col>
      <Col xs={3} className="text-right-xs">
        <strong> Rate </strong>
      </Col>
      <Col xs={2} className="text-right-xs">
        <strong> Qty </strong>
      </Col>
      <Col xs={3} className="text-right">
        <strong> Value </strong>
      </Col>
    </Row>
    {products.map((product) => {
      if (product.item_total > 0) {
        return (
          <Row key={product.item_id} className="py-2">
            <Col xs={4}>
              {`${product.name}, ${product.unit}`}
              <br />
            </Col>
            <Col xs={3} className="text-right-xs">
              {`${formatMoney(product.rate, accountSettings)}`}
            </Col>
            <Col xs={2} className="text-right-xs">
              {`${displayUnitOfSale(product.quantity, product.unit)}`}
            </Col>
            <Col xs={3} className="text-right">
              {formatMoney(product.rate * product.quantity, accountSettings)}
            </Col>
          </Row>
        );
      }
    })}

    <Row className="py-3 pe-2">
      <Col xs={12} className="text-right">
        Amount: <strong>{formatMoney(total, accountSettings)}</strong>
      </Col>
    </Row>
  </Row>
);

const ViewInvoice = ({ invoice }) => (
  <div className="orderDetails">
    <Row>
      <Col xs={12}>
        <h4>
          {invoice.invoice_number} -{' '}
          <span className="text-muted"> {invoice.status} </span>
        </h4>
        {invoice.line_items && (
          <DisplayOrderProducts
            products={invoice.line_items}
            total={invoice.total}
          />
        )}
      </Col>
    </Row>
    <div>
      {/* invoice.balance > 0 && (
      <div className="p-3">
        <Row className="text-right">
          <Col xs={12}>
            <strong>
              {`Pending : ${formatMoney(invoice.balance, accountSettings)}`}
            </strong>
          </Col>
        </Row>
      </div>
      ) */}
    </div>
  </div>
);

ViewInvoice.propTypes = {
  invoice: PropTypes.object.isRequired,
};

export default ViewInvoice;
