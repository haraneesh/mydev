import React from 'react';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { formatMoney } from 'accounting-js';
import Product from '../Orders/Product';
import constants from '../../../modules/constants';
import { accountSettings } from '../../../modules/settings';
import { displayProductsByType } from '../Orders/ProductsOrderCommon/ProductsOrderCommon';

const displayWithDivider = (displayArray, displayText) => (
  displayArray && displayArray.length > 0 && (
    <div style={{ borderBottomWidth: '0px' }}>
      <div className="card-header p-3 text-start" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
        <small className="text-uppercase">{displayText}</small>
      </div>
      <div className="card-body">
        {displayArray}
      </div>
    </div>
  ));

export const ListProducts = ({
  products, deletedProducts, updateProductQuantity, isMobile, isAdmin, isShopOwner, isDeliveryInChennai,
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
    products,
    isMobile,
    isAdmin,
    isShopOwner,
    cartScreen: true,
    updateProductQuantity,
    isDeliveryInChennai,
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
    <Row className="order-details-products p-1 p-sm-2 mb-3">
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

    </Row>
  );
};

export const ListProducts1 = ({
  products, deletedProducts, updateProductQuantity, isMobile, isAdmin,
}) => (
  <Card className="order-details-products p-1 p-sm-2">
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
  </Card>
);

ListProducts.propTypes = {
  products: PropTypes.object.isRequired,
  deletedProducts: PropTypes.object.isRequired,
  updateProductQuantity: PropTypes.func.isRequired,
  isMobile: PropTypes.bool.isRequired,
  isAdmin: PropTypes.bool.isRequired,
};

export const OrderFooter = ({
  history, orderId, totalBillAmount, onButtonClick,
  submitButtonName, showWaiting, payCash, collectRecyclables, onPayCash, onCollectRecyclables,
}) => (

  <div className="bg-body py-0 px-2 m-0">
    {/* <div className="row">
      <Col sm={8} xs={12} className="text-left offset-sm-2 pt-3 form-check">
        <label htmlFor="payCashId" className="form-check-label">
          <input
            type="checkbox"
            className="form-check-input"
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
      <Col sm={8} xs={12} className="text-left offset-sm-2 pt-3 form-check">
        <label htmlFor="collectRecyclablesId" className="form-check-label">
          <input
            type="checkbox"
            className="form-check-input"
            id="collectRecyclablesId"
            name="collectRecyclables"
            checked={collectRecyclables}
            onClick={(e) => { onCollectRecyclables(e.target.checked); e.stopPropagation(); }}
          />
          Please collect recyclables (Glass bottles, Net bags, White bags and others )
        </label>
      </Col>
    </div> */}

    <div className="orderFooter alert alert-light row">
      <Col sm={6} xs={12}>
        <h4 className="text-center-xs text-right-not-xs py-2">
          {'Total '}
          <strong>
            {
            formatMoney(totalBillAmount, accountSettings)
          }
          </strong>
        </h4>
      </Col>

      <Col className="offset-1 text-right-not-xs text-center-xs" sm={4} xs={12}>
        {(!showWaiting) && (
        <Button
          variant="primary"
          style={{ marginLeft: '0.5em' }}
          disabled={totalBillAmount <= 0}
          onClick={() => { onButtonClick({ history, orderId }); }}
          className="col-10 d-grid"
        >
          {submitButtonName}
        </Button>
        )}

        {(showWaiting) && (
        <Button
          variant="primary"
          style={{ marginBottom: '0.5em', marginTop: '0.5em' }}
          disabled
          className="col-10 d-grid"
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
  // isMainProductListPage: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  orderId: PropTypes.string,
  showWaiting: PropTypes.bool,
};

export const OrderComment = ({ refComment, onCommentChange, comments }) => (

  <Row>
    <Col className="offset-sm-2 mb-3" sm={8} xs={12}>
      <h4 className="text-left my-3">
        Add Notes for the Packing Team
      </h4>
      <textarea
        name="comments"
        placeholder="Is there anything that you would like to tell us about this order?"
        defaultValue={comments}
        onBlur={onCommentChange}
        rows={2}
        ref={refComment}
        className="form-control"
      />
    </Col>
  </Row>

);

OrderComment.propTypes = {
  onCommentChange: PropTypes.func.isRequired,
  comments: PropTypes.string.isRequired,
};

export const PrevOrderComplaint = ({ refPrevOrderComplaint, onPrevOrderComplaintChange, prevOrderComplaint }) => (

  <Row className="py-2">
    <Col className="offset-sm-2 mb-3" sm={8} xs={12}>
      <h4 className="text-left my-3">
        Were there any issues with Previous Order?
      </h4>

      <textarea
        name="previousOrderComplaints"
        placeholder="Were there any Issues with the Previous Order?"
        defaultValue={prevOrderComplaint}
        onBlur={onPrevOrderComplaintChange}
        rows={2}
        className="form-control"
        ref={refPrevOrderComplaint}
      />
    </Col>
  </Row>

);

PrevOrderComplaint.propTypes = {
  onPrevOrderComplaintChange: PropTypes.func.isRequired,
  prevOrderComplaint: PropTypes.string.isRequired,
};
