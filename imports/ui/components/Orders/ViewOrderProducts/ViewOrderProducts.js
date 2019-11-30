import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Panel, PanelGroup } from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../../modules/settings';
import { displayUnitOfSale } from '../../../../modules/helpers';
import Product from '../Product';

import './ViewOrderProducts.scss';

export const ViewOrderProducts = ({ products }) => (
  <PanelGroup className="order-details-products row">
    <Panel>
      <Row>
        <Col xs={4}> <strong> Name </strong></Col>
        <Col xs={3} className="text-right-xs"> <strong> Rate </strong></Col>
        <Col xs={2} className="text-right-xs"> <strong> Qty </strong></Col>
        <Col xs={3} className="text-right"> <strong> Value </strong></Col>
      </Row>
    </Panel>
    {products.map((product) => {
      if (product.quantity > 0) {
        return (
          <Panel key={product._id}>
            <Row>
              <Col xs={4}>
                {`${product.name} ${product.unitOfSale}`} <br />
                <small> {product.description} </small>
              </Col>
              <Col xs={3} className="text-right-xs">
                {formatMoney(product.unitprice, accountSettings)}
              </Col>
              <Col xs={2} className="text-right-xs">
                {`${displayUnitOfSale(product.quantity, product.unitOfSale)}`}
              </Col>
              <Col xs={3} className="text-right">
                {formatMoney(
                    product.unitprice * product.quantity,
                    accountSettings,
                  )}
              </Col>
            </Row>
          </Panel>
        );
      }
    })}
  </PanelGroup>
  );

ViewOrderProducts.propTypes = {
  products: PropTypes.object.isRequired,
};

export const ReviewOrder = ({ products, updateProductQuantity, isMobile, isAdmin }) => (
  <PanelGroup className="order-details-products row">
    <Panel>
      <Row>
        <Col xs={7}> <strong> Name </strong></Col>
        {/* <Col xs={3} className="text-right-xs"> <strong> Rate </strong></Col> */}
        <Col xs={5} className="text-right"> <strong> Value </strong></Col>
      </Row>
    </Panel>
    {products.map((product, index) => {
      if (product.quantity > 0 || product.removedDuringCheckout) {
        return (
          <Product
            isMobile={isMobile}
            key={`review-${index}`}
            updateProductQuantity={updateProductQuantity}
            product={product}
            isAdmin={isAdmin}
            checkout
          />
        );
      }
    })}
  </PanelGroup>
  );

ReviewOrder.propTypes = {
  products: PropTypes.object.isRequired,
  updateProductQuantity: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};
