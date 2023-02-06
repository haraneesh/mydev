import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import PropTypes from 'prop-types';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../../../modules/settings';
import { displayUnitOfSale } from '../../../../../modules/helpers';

const NotInvoiced = ({ orderedNotInvoicedProductsHash, itemIds }) => (itemIds.length > 0
  ? (
    <Row className="order-details-products px-sm-4">
      <Row className="bg-light py-2">
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

      {itemIds.map((zhItemId) => {
        const product = orderedNotInvoicedProductsHash[zhItemId];
        return (
          <Row key={product.zh_item_id} className="py-2">
            <Col xs={4}>
              {`${product.name}, ${product.unitOfSale}`}
              <br />
            </Col>
            <Col xs={3} className="text-right-xs">
              {`${formatMoney(product.unitprice, accountSettings)}`}
            </Col>
            <Col xs={2} className="text-right-xs">
              {`${displayUnitOfSale(product.quantity, product.unitOfSale)}`}
            </Col>
            <Col xs={3} className="text-right" style={{ textDecoration: 'line-through' }}>
              {formatMoney(
                product.unitprice * product.quantity,
                accountSettings,
              )}
            </Col>
          </Row>
        );
      })}
    </Row>
  ) : <div />
);

NotInvoiced.propTypes = {
  orderedNotInvoicedProductsHash: PropTypes.object.isRequired,
  itemIds: PropTypes.array.isRequired,
};

export default NotInvoiced;
