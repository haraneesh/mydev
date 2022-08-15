import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Panel, PanelGroup, Button, Checkbox,
} from 'react-bootstrap';
import { formatMoney } from 'accounting-js';
import Product from '../Orders/Product';
import constants from '../../../modules/constants';
import { accountSettings } from '../../../modules/settings';
import { displayProductsByType } from '../Orders/ProductsOrderCommon/ProductsOrderCommon';

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

export const ListProducts = ({
  products, deletedProducts, updateProductQuantity, isMobile, isAdmin, isShopOwner,
}) => {
  const {
    productVegetables,
    productFruits,
    productDhals,
    productGrains,
    productSpices,
    productOils,
    productFlours,
    productBatter,
    productSnacks,
    productPrepared,
    productHygiene,
    productSweetners,
    productsNoCategory,
  } = displayProductsByType({
    products, isMobile, isAdmin, isShopOwner, cartScreen: true, updateProductQuantity,
  });

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
      </Panel>
      {displayWithDivider(productVegetables, constants.ProductTypeName.Vegetables.display_name)}
      {displayWithDivider(productFruits, constants.ProductTypeName.Fruits.display_name)}
      {displayWithDivider(productGrains, constants.ProductTypeName.Grains.display_name)}
      {displayWithDivider(productDhals, constants.ProductTypeName.Dhals.display_name)}
      {displayWithDivider(productSpices, constants.ProductTypeName.Spices.display_name)}
      {displayWithDivider(productOils, constants.ProductTypeName.Oils.display_name)}
      {displayWithDivider(productFlours, constants.ProductTypeName.Flours.display_name)}
      {displayWithDivider(productBatter, constants.ProductTypeName.Batter.display_name)}
      {displayWithDivider(productSnacks, constants.ProductTypeName.Snacks.display_name)}
      {displayWithDivider(productPrepared, constants.ProductTypeName.Prepared.display_name)}
      {displayWithDivider(productSweetners, constants.ProductTypeName.Sweetners.display_name)}
      {displayWithDivider(productHygiene, constants.ProductTypeName.Hygiene.display_name)}
      {displayWithDivider(productsNoCategory, 'Others')}
      {displayWithDivider(chosenButDeleted, 'Removed From Cart')}

    </PanelGroup>
  );
};

export const ListProducts1 = ({
  products, deletedProducts, updateProductQuantity, isMobile, isAdmin,
}) => (
  <PanelGroup className="order-details-products">
    <Panel>
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

export const OrderFooter = ({
  history, orderId, totalBillAmount, onButtonClick, submitButtonName, showWaiting, payCash, collectRecyclables, onPayCash, onCollectRecyclables,
}) => (

  <div>
    <div className="row">
      <Col sm={8} xs={12} className="align-items-center offset-sm-2">
        <label htmlFor="payCashId" style={{ marginBottom: '0', marginTop: '10px' }}>
          <input
            type="checkbox"
            id="payCashId"
            name="payCash"
            checked={payCash}
            onClick={(e) => { onPayCash(e.target.checked); e.stopPropagation(); }}
          />
          Please collect cash with this delivery
        </label>
      </Col>
    </div>

    <div className="row">
      <Col sm={8} xs={12} className="align-items-center offset-sm-2">
        <label htmlFor="collectRecyclablesId" style={{ marginBottom: '0', marginTop: '10px' }}>
          <input
            type="checkbox"
            id="collectRecyclablesId"
            name="collectRecyclables"
            checked={collectRecyclables}
            onClick={(e) => { onCollectRecyclables(e.target.checked); e.stopPropagation(); }}
          />
          Please collect recyclables (Glass bottles, Net bags, White bags and others )
        </label>
      </Col>
    </div>

    <div className="orderFooter row" style={{ marginTop: '2.5em' }}>
      <Col sm={6} xs={12}>
        <h4 className="text-center-xs text-right-not-xs" style={{ paddingTop: '0.25em' }}>
          {'Total '}
          <strong>
            {
            formatMoney(totalBillAmount, accountSettings)
          }
            {' '}
          &nbsp;
          </strong>
        </h4>
      </Col>

      <Col className="text-right-not-xs text-center-xs d-flex align-items-center" sm={4} xs={12}>
        {(!showWaiting) && (
        <Button
          bsStyle="primary"
          style={{ marginLeft: '0.5em' }}
          disabled={totalBillAmount <= 0}
          onClick={() => { onButtonClick({ history, orderId }); }}
          className="btn-block"
        >
          {submitButtonName}
        </Button>
        )}

        {(showWaiting) && (
        <Button
          bsStyle="primary"
          style={{ marginBottom: '0.5em', marginTop: '0.5em' }}
          disabled
          className="btn-block"
        >
          {submitButtonName}
        </Button>
        )}

      </Col>
    </div>
  </div>
);

OrderFooter.defaultProps = {
  onSecondButtonClick: {},
  orderId: '',
  showWaiting: false,
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
  showWaiting: PropTypes.bool,
};

export const OrderComment = ({ refComment, onCommentChange, comments }) => (
  <PanelGroup>
    <Row>
      <Col className="offset-sm-2" sm={8} xs={12}>
        <h4 className="text-left">
          <strong>Add Notes for the Packing Team</strong>
        </h4>
        <textarea
          name="comments"
          componentClass="textarea"
          placeholder="Is there anything that you would like to tell us about this order?"
          defaultValue={comments}
          onBlur={onCommentChange}
          rows="2"
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

export const PrevOrderComplaint = ({ refPrevOrderComplaint, onPrevOrderComplaintChange, prevOrderComplaint }) => (
  <PanelGroup>
    <Row>
      <Col className="offset-sm-2" sm={8} xs={12}>
        <h4 className="text-left">
          <strong>Were there any issues with Previous Order?</strong>
        </h4>

        <textarea
          name="previousOrderComplaints"
          componentClass="textarea"
          placeholder="Were there any Issues with the Previous Order?"
          defaultValue={prevOrderComplaint}
          onBlur={onPrevOrderComplaintChange}
          rows="2"
          className="form-control"
          ref={refPrevOrderComplaint}
        />
      </Col>
    </Row>
  </PanelGroup>
);

PrevOrderComplaint.propTypes = {
  onPrevOrderComplaintChange: PropTypes.func.isRequired,
  prevOrderComplaint: PropTypes.string.isRequired,
};
