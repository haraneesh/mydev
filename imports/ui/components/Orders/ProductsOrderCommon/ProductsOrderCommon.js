import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Button, FormControl, PanelGroup } from 'react-bootstrap';
import Product from '../Product';
import constants from '../../../../modules/constants';

export const OrderFooter = ({ isMobile, totalBillAmount, onButtonClick, submitButtonName, onSecondButtonClick }) => (
  <Row style={{ marginTop: isMobile ? '0em' : '2.5em' }}>
    {/* <Col className="text-left-not-xs" sm={4} xs={12}>
       } <Button
            bsStyle="default"
            style={{ marginBottom: '0.5em' }}
            disabled={totalBillAmount <= 0}
            onClick={onSecondButtonClick}
            className="btn-block"
          > Save Draft
          </Button>
    </Col> */}

    <Col sm={6} smOffset={3} xs={10} xsOffset={1}>
      <Button
        bsStyle="primary"
        disabled={totalBillAmount <= 0}
        onClick={onButtonClick}
        className="btn-block"
      > {submitButtonName}
      </Button>
    </Col>
  </Row>
);

OrderFooter.defaultProps = {
  onSecondButtonClick: {},
};

OrderFooter.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  onSecondButtonClick: PropTypes.func,
  totalBillAmount: PropTypes.number.isRequired,
  submitButtonName: PropTypes.string.isRequired,
};


export const DisplayCategoryHeader = ({ clName, title, onclick, isOpen }) => (
  <Row onClick={onclick} className="productCatHead">
    <Col xs={3} sm={2} className={`productCat_${clName}`} />
    <Col xs={8} sm={9} className="prodCatTitle">
      <p style={{ marginBottom: '0px' }}> <span style={{ verticalAlign: 'middle' }}> {title} </span> </p>
    </Col>
    <Col xs={1} className="prodCatPlus">
      <span className="text-default">
        {!!isOpen && (<b style={{ fontSize: '1.5em' }} > - </b>)}
        {!isOpen && (<b style={{ fontSize: '1.5em' }} > + </b>)}
      </span>
    </Col>
  </Row>
);

DisplayCategoryHeader.propTypes = {
  clName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onclick: PropTypes.func.isRequired,
  isOpen: PropTypes.func.isRequired,
};

export const OrderComment = ({ comments }) => (
  <PanelGroup>
    <Row>
      <Col sm={3}>
        <h4 className="noMarginNoPadding">
          <strong> Comments </strong>
        </h4>
      </Col>
      <Col sm={9}>
        <FormControl
          name="comments"
          componentClass="textarea"
          placeholder="Is there anything that you would like to tell us about this order?"
          defaultValue={comments}
          rows="4"
        />
      </Col>
    </Row>
  </PanelGroup>
);

OrderComment.propTypes = {
  comments: PropTypes.string.isRequired,
};

export function displayProductsByType({ products, isMobile, isAdmin, isShopOwner, updateProductQuantity, wasProductOrderedPreviously, cartScreen, isBasket }) {
  // Grouping product categories by tabs
  const productVegetables = [];
  const productFruits = [];
  const productDhals = [];
  const productGrains = [];
  const productSpices = [];
  const productOils = [];
  const productPrepared = [];
  const productHygiene = [];
  const productSpecials = [];
  const productSweetners = [];
  const productRecommended = [];
  const productsNoCategory = [];

  const checkout = !!(cartScreen);
  // const ProductType = 'Vegetables', 'Fruits', 'Dhals', 'Grains', 'Spices', 'Oils', 'Prepared', 'Hygiene', 'Sweetners';
  _.map(products, (product, index) => {
    if (!!wasProductOrderedPreviously && wasProductOrderedPreviously(product._id)) {
      productRecommended.push(
        <Product isMobile={isMobile} key={`recommended-${index}`} updateProductQuantity={updateProductQuantity} product={product} isAdmin={isAdmin || isShopOwner} checkout={checkout} isBasket={isBasket} />,
      );
    }

    if (product.displayAsSpecial) {
      productSpecials.push(
        <Product isMobile={isMobile} key={`special-${index}`} updateProductQuantity={updateProductQuantity} product={product} isAdmin={isAdmin || isShopOwner} checkout={checkout} isBasket={isBasket} />,
      );
    }

    let tempProductList = [];
    let tempKey = '';

    switch (true) {
      case (constants.ProductType[1] === product.type): // Vegetables
        tempProductList = productVegetables;
        tempKey = `vegetable-${index}`;
        break;
      case (constants.ProductType[2] === product.type): // Fruits
        tempProductList = productFruits;
        tempKey = `fruit-${index}`;
        break;
      case (constants.ProductType[3] === product.type): // Dhals
        tempProductList = productDhals;
        tempKey = `dhal-${index}`;
        break;
      case (constants.ProductType[4] === product.type): // Grains
        tempProductList = productGrains;
        tempKey = `grain-${index}`;
        break;
      case (constants.ProductType[5] === product.type): // Spice
        tempProductList = productSpices;
        tempKey = `spice-${index}`;
        break;
      case (constants.ProductType[6] === product.type): // Oils
        tempProductList = productOils;
        tempKey = `oil-${index}`;
        break;
      case (constants.ProductType[7] === product.type): // Prepared
        tempProductList = productPrepared;
        tempKey = `processed-${index}`;
        break;
      case (constants.ProductType[8] === product.type): // Hygiene
        tempProductList = productHygiene;
        tempKey = `hygiene-${index}`;
        break;
      case (constants.ProductType[9] === product.type): // Sweetners
        tempProductList = productSweetners;
        tempKey = `sweetners-${index}`;
        break;
      default:
        tempProductList = productsNoCategory;
        tempKey = `noCat-${index}`;
        break;
    }

    tempProductList.push(
      <Product isMobile={isMobile} key={tempKey} updateProductQuantity={updateProductQuantity} product={product} isAdmin={isAdmin || isShopOwner} checkout={checkout} isBasket={isBasket} />,
    );
  });

  return {
    productVegetables,
    productFruits,
    productDhals,
    productGrains,
    productSpices,
    productOils,
    productPrepared,
    productHygiene,
    productSpecials,
    productSweetners,
    productRecommended,
    productsNoCategory,
    isMobile
  };
}
