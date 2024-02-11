import React from 'react';
import PropTypes from 'prop-types';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../../modules/settings';
import { displayUnitOfSale } from '../../../../modules/helpers';
import Product from '../Product';
import OrderCommon from '../../../../modules/both/orderCommon';

const { costOfReturnable } = OrderCommon;

export const ViewOrderProducts = ({ products }) => (
  <>
    <Row className="bg-light p-3">
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
      if (product.quantity > 0) {
        return (
          <div>
            <Row key={product._id} className="p-2">
              <Col xs={4}>
                {`${product.name} ${product.unitOfSale}`}
                {' '}
                <br />
                {/* <small>
                {' '}
                {product.description}
                {' '}
               </small> */}
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
            {(product.associatedReturnables && product.associatedReturnables.quantity && product.associatedReturnables.quantity > 0) && (
            <Row className="ps-3 pe-2">
              <Col>
                {product.associatedReturnables.name}
              </Col>
              <Col xs={3} className="text-right">
                {formatMoney(costOfReturnable(product.associatedReturnables.returnableUnitsForSelection, product.quantity).retQtySelectedPrice, accountSettings)}
              </Col>
            </Row>
            )}
          </div>

        );
      }
    })}
  </>
);

ViewOrderProducts.propTypes = {
  products: PropTypes.object.isRequired,
};

export const ReviewOrder = ({
  products, updateProductQuantity, isMobile, isAdmin,
}) => (
  <Row className="order-details-products p-2">
    <Row>
      <Col xs={7} sm={9}>
        {' '}
        <strong> Name </strong>
      </Col>
      {/* <Col xs={3} className="text-right-xs"> <strong> Rate </strong></Col> */}
      <Col xs={5} sm={3} className="text-left">
        {' '}
        <strong> Value </strong>
      </Col>
    </Row>

    {Object.keys(products).map((key, index) => {
      const product = products[key];
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
  </Row>
);

ReviewOrder.propTypes = {
  products: PropTypes.object.isRequired,
  updateProductQuantity: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};
