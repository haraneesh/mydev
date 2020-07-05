import React from 'react';
import { Row, Col, Panel, PanelGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../../../modules/settings';
import { displayUnitOfSale } from '../../../../../modules/helpers';

const NotInvoiced = ({ orderedNotInvoicedProductsHash, itemIds }) => (itemIds.length > 0 ?
  <PanelGroup className="order-details-products">
    <Panel>
      <Row>
        <Col xs={4}> <strong> Name </strong></Col>
        <Col xs={3} className="text-right-xs"> <strong> Rate </strong></Col>
        <Col xs={2} className="text-right-xs"> <strong> Qty </strong></Col>
        <Col xs={3} className="text-right"> <strong> Value </strong></Col>
      </Row>
    </Panel>
    {itemIds.map((zhItemId) => {
      const product = orderedNotInvoicedProductsHash[zhItemId];
      return (
        <Panel key={product.zh_item_id}>
          <Row>
            <Col xs={4}>
              {`${product.name}, ${product.unitOfSale}`}<br />
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
        </Panel>
      );
    })}
  </PanelGroup> : <div />
);

NotInvoiced.propTypes = {
  orderedNotInvoicedProductsHash: PropTypes.object.isRequired,
  itemIds: PropTypes.array.isRequired,
};

export default NotInvoiced;
