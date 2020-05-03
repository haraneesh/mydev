import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Panel, PanelGroup, Button } from 'react-bootstrap';
import Product from '../Orders/Product';
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../modules/settings';
import { displayProductsByType } from '../../components/Orders/ProductsOrderCommon/ProductsOrderCommon';

const displayWithDivider = (displayArray, displayText) => (
  displayArray && displayArray.length > 0 && (
    <div className="panel panel-default" style={{ borderBottomWidth: '0px' }}>
      <div className="panel-heading" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
        <small className="text-uppercase">{displayText}</small>
      </div>
      <div className="panel-body">
        {displayArray}
      </div>
    </div>
  ));

export const ListProducts = ({ products, deletedProducts, updateProductQuantity, isMobile, isAdmin, isShopOwner }) => {
  const { productVegetables,
    productFruits,
    productDhals,
    productGrains,
    productSpices,
    productOils,
    productPrepared,
    productHygiene,
    productSweetners,
    productsNoCategory
  } = displayProductsByType({ products, isMobile, isAdmin, isShopOwner, cartScreen: true, updateProductQuantity });

  const chosenButDeleted = [];
  Object.keys(deletedProducts).map((key, index) => {
    const product = deletedProducts[key];
    if (product.quantity > 0 || product.removedDuringCheckout) {
      chosenButDeleted.push(
        <Product
          isMobile={isMobile}
          key={`review-${index}`}
          updateProductQuantity={updateProductQuantity}
          product={product}
          isAdmin={isAdmin || isShopOwner}
          checkout
        />,
      );
    }
  });

  return (
    <PanelGroup className="order-details-products">
      <Panel>
        <Row>
          <Col xs={7} sm={9}> <strong> Name </strong></Col>
          {/* <Col xs={3} className="text-right-xs"> <strong> Rate </strong></Col> */}
          <Col xs={5} sm={3} className="text-left"> <strong> Value </strong></Col>
        </Row>
      </Panel>
      {displayWithDivider(productVegetables, 'Vegetables')}
      {displayWithDivider(productFruits, 'Fruits')}
      {displayWithDivider(productGrains, 'Grains & Flour')}
      {displayWithDivider(productDhals, 'Pulses, Lentils & Dried Beans')}
      {displayWithDivider(productSpices, 'Spices & Nuts')}
      {displayWithDivider(productOils, 'Oils, Butter & Ghee')}
      {displayWithDivider(productPrepared, 'Pickles & Podis')}
      {displayWithDivider(productSweetners, 'Sweetners')}
      {displayWithDivider(productHygiene, 'Personal & General Hygiene')}
      {displayWithDivider(productsNoCategory, 'Others')}
      {displayWithDivider(chosenButDeleted, 'Removed From Cart')}

    </PanelGroup>
  );
};

export const ListProducts1 = ({ products, deletedProducts, updateProductQuantity, isMobile, isAdmin }) => (
  <PanelGroup className="order-details-products">
    <Panel>
      <Row>
        <Col xs={7} sm={9}> <strong> Name </strong></Col>
        {/* <Col xs={3} className="text-right-xs"> <strong> Rate </strong></Col> */}
        <Col xs={5} sm={3} className="text-left"> <strong> Value </strong></Col>
      </Row>
    </Panel>
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
    {Object.keys(deletedProducts).map((key, index) => {
      const product = deletedProducts[key];
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

ListProducts.propTypes = {
  products: PropTypes.object.isRequired,
  deletedProducts: PropTypes.object.isRequired,
  updateProductQuantity: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export const OrderFooter = ({ history, orderId, totalBillAmount, onButtonClick, submitButtonName }) => (
  <div className="orderFooter">
    <Col sm={8} xs={12}>
      <h4 className="text-center-xs text-right-not-xs" style={{ paddingTop: '0.25em' }}>{'Total '}
        <strong>
          {
            formatMoney(totalBillAmount, accountSettings)
          }
        </strong>
      </h4>
    </Col>
    <Col className="text-right-not-xs" sm={4} xs={12}>
      <Button
        bsStyle="primary"
        style={{ marginBottom: '0.5em', marginTop: '0.5em' }}
        disabled={totalBillAmount <= 0}
        onClick={() => { onButtonClick({ history, orderId }); }}
        className="btn-block"
      >
        {submitButtonName}
      </Button>
    </Col>
  </div>
);

OrderFooter.defaultProps = {
  onSecondButtonClick: {},
  orderId: '',
};

OrderFooter.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  onSecondButtonClick: PropTypes.func,
  totalBillAmount: PropTypes.number.isRequired,
  submitButtonName: PropTypes.string.isRequired,
  isMainProductListPage: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  orderId: PropTypes.string,
};

export const OrderComment = ({ refComment, onCommentChange, comments }) => (
  <PanelGroup>
    <Row>
      <Col sm={3}>
        <h4 className="text-right-not-xs">
          <strong> Comments </strong>
        </h4>
      </Col>
      <Col sm={9}>
        <textarea
          name="comments"
          componentClass="textarea"
          placeholder="Is there anything that you would like to tell us about this order?"
          defaultValue={comments}
          onBlur={onCommentChange}
          rows="4"
          className="form-control"
          ref={refComment}
        />
      </Col>
    </Row>
  </PanelGroup>
);

OrderComment.propTypes = {
  onCommentChange: PropTypes.func.isRequired,
  comments: PropTypes.string.isRequired,
};

