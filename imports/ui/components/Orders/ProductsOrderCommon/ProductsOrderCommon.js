import React from 'react';
import PropTypes from 'prop-types';
import {
  Row, Col, Button, FormControl, PanelGroup, Panel,
} from 'react-bootstrap';
import { isDeviceMobile } from '../../../../modules/helpers';
import Product from '../Product';
import constants from '../../../../modules/constants';

export const OrderFooter = ({
  isMobile, totalBillAmount, onButtonClick, submitButtonName, onSecondButtonClick,
}) => (
  <div style={{ marginBottom: '1em' }}>
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

    <div className="offset-1 col-xs-10 offset-sm-3 col-sm-6">
      <Button
        bsStyle="primary"
        disabled={totalBillAmount <= 0}
        onClick={onButtonClick}
        className="btn-block"
      >
        {' '}
        {submitButtonName}
      </Button>
    </div>
  </div>
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

export const DisplayCategoryHeader = ({
  clName, title, onclick, isOpen, tabHash,
}) => (

  <Row onClick={onclick} className="productCatHead">
    <Col xs={3} sm={2} className={`productCat_${clName}`} />
    <Col xs={7} sm={9} className="prodCatTitle">
      <p style={{ marginBottom: '0px' }}>
        {' '}
        <span style={{ verticalAlign: 'middle' }}>
          {' '}
          {title}
          {' '}
        </span>
        {' '}
      </p>
    </Col>
    <Col xs={2} sm={1} className="prodCatPlus text-center">
      <span className="text-default">
        {!!isOpen && (<b style={{ fontSize: '1.5em' }}> - </b>)}
        {!isOpen && (<b style={{ fontSize: '1.5em' }}> + </b>)}
        {
          (tabHash.orderedItemCount > 0)
            && (<span className="notifyCount text-center">{tabHash.orderedItemCount}</span>)
        }
      </span>
    </Col>
  </Row>

);

DisplayCategoryHeader.propTypes = {
  clName: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onclick: PropTypes.func.isRequired,
  isOpen: PropTypes.func.isRequired,
  tabHash: PropTypes.object.isRequired,
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

const incrementMetaWithOrderCount = (productGroupMetaHash, productType, product) => {
  const metaHash = productGroupMetaHash;
  if (!metaHash[productType]) {
    metaHash[productType] = {};
    metaHash[productType].orderedItemCount = 0;
  }

  if (product.quantity && product.quantity > 0) {
    metaHash[productType].orderedItemCount += 1;
  }

  return metaHash;
};

export function displayProductsByType({
  products, isMobile, isAdmin, isShopOwner, updateProductQuantity, wasProductOrderedPreviously, cartScreen, isBasket,
}) {
  let productGroupMetaHash = {};
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
  const productFlours = [];
  const productBatter = [];
  const productSnacks = [];
  const productRecommended = [];
  const productsNoCategory = [];

  const checkout = !!(cartScreen);
  // const ProductType = 'Vegetables', 'Fruits', 'Dhals', 'Grains', 'Spices', 'Oils', 'Prepared', 'Hygiene', 'Sweetners';
  _.map(products, (product, index) => {
    if (!!wasProductOrderedPreviously && wasProductOrderedPreviously(product._id)) {
      productRecommended.push(
        <Product isMobile={isMobile} key={`recommended-${index}`} updateProductQuantity={updateProductQuantity} product={product} isAdmin={isAdmin || isShopOwner} checkout={checkout} isBasket={isBasket} />,
      );
      productGroupMetaHash = incrementMetaWithOrderCount(productGroupMetaHash, 'productRecommended', product);
    }

    if (product.displayAsSpecial) {
      productSpecials.push(
        <Product isMobile={isMobile} key={`special-${index}`} updateProductQuantity={updateProductQuantity} product={product} isAdmin={isAdmin || isShopOwner} checkout={checkout} isBasket={isBasket} />,
      );

      if (!(isAdmin || isShopOwner)) {
        if (isDeviceMobile() && productSpecials.length % 3 === 2) {
          productSpecials.push(
            <div className="clearfix nextRow" />,
          );
        }

        if (!isDeviceMobile() && productSpecials.length % 5 === 4) {
          productSpecials.push(
            <div className="clearfix nextRow" />,
          );
        }
      }

      productGroupMetaHash = incrementMetaWithOrderCount(productGroupMetaHash, 'productSpecials', product);
    }

    let tempProductList = [];
    let tempKey = '';
    let tempType = '';

    switch (true) {
      case (constants.ProductType[1] === product.type): // Vegetables
        tempProductList = productVegetables;
        tempKey = `vegetable-${index}`;
        tempType = 'productVegetables';
        break;
      case (constants.ProductType[2] === product.type): // Fruits
        tempProductList = productFruits;
        tempKey = `fruit-${index}`;
        tempType = 'productFruits';
        break;
      case (constants.ProductType[3] === product.type): // Dhals
        tempProductList = productDhals;
        tempKey = `dhal-${index}`;
        tempType = 'productDhals';
        break;
      case (constants.ProductType[4] === product.type): // Grains
        tempProductList = productGrains;
        tempKey = `grain-${index}`;
        tempType = 'productGrains';
        break;
      case (constants.ProductType[5] === product.type): // Spice
        tempProductList = productSpices;
        tempKey = `spice-${index}`;
        tempType = 'productSpices';
        break;
      case (constants.ProductType[6] === product.type): // Oils
        tempProductList = productOils;
        tempKey = `oil-${index}`;
        tempType = 'productOils';
        break;
      case (constants.ProductType[7] === product.type): // Prepared
        tempProductList = productPrepared;
        tempKey = `processed-${index}`;
        tempType = 'productPrepared';
        break;
      case (constants.ProductType[8] === product.type): // Hygiene
        tempProductList = productHygiene;
        tempKey = `hygiene-${index}`;
        tempType = 'productHygiene';
        break;
      case (constants.ProductType[9] === product.type): // Sweetners
        tempProductList = productSweetners;
        tempKey = `sweetners-${index}`;
        tempType = 'productSweetners';
        break;
      case (constants.ProductType[10] === product.type): // Flours
        tempProductList = productFlours;
        tempKey = `flours-${index}`;
        tempType = 'productFlours';
        break;
      case (constants.ProductType[11] === product.type): // Batter
        tempProductList = productBatter;
        tempKey = `batter-${index}`;
        tempType = 'productBatter';
        break;
      case (constants.ProductType[12] === product.type): // Snacks
        tempProductList = productSnacks;
        tempKey = `snacks-${index}`;
        tempType = 'productSnacks';
        break;
      default:
        tempProductList = productsNoCategory;
        tempKey = `noCat-${index}`;
        tempType = 'productsNoCategory';
        break;
    }

    tempProductList.push(
      <Product
        isMobile={isMobile}
        key={tempKey}
        updateProductQuantity={updateProductQuantity}
        product={product}
        isAdmin={isAdmin || isShopOwner}
        checkout={checkout}
        isBasket={isBasket}
      />,
    );
    if (!(isAdmin || isShopOwner)) {
      if (isDeviceMobile() && tempProductList.length % 3 === 2) {
        tempProductList.push(
          <div className="clearfix nextRow" />,
        );
      }

      if (!isDeviceMobile() && tempProductList.length % 5 === 4) {
        tempProductList.push(
          <div className="clearfix nextRow" />,
        );
      }
    }
    productGroupMetaHash = incrementMetaWithOrderCount(productGroupMetaHash, tempType, product);
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
    productFlours,
    productBatter,
    productSnacks,
    productRecommended,
    productsNoCategory,
    isMobile,
    productGroupMetaHash,
  };
}
