import React from 'react';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
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

    <div className="offset-1 col-10 offset-sm-3 col-sm-6 px-2 text-center">
      <Button
        variant="secondary"
        className=" col-10 col-sm-6 btn-block"
        disabled={totalBillAmount <= 0}
        onClick={onButtonClick}
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

export const SideBarDisplayHeader = ({
  clName, title, onclick,
}) => (
  <div onClick={onclick} className="productCatHead row pb-2">
    <Col sm={3} className={`productCatHeadIcon productCat_${clName}`} />
    <Col xs={12} sm={9} className="pe-1">
      <p style={{ marginBottom: '0px', fontSize: '90%' }}>
        <span style={{ verticalAlign: 'middle' }}>
          {title}
        </span>
      </p>
    </Col>
  </div>
);

export const DisplayCategoryHeader = ({
  clName, title, onclick, isOpen, tabHash,
}) => (

  <Row onClick={onclick} className="productCatHead" style={{ width: '100%' }}>
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

      {!!isOpen && (<b style={{ fontSize: '1.5rem' }}> - </b>)}
      {!isOpen && (<b style={{ fontSize: '1.5rem' }}> + </b>)}
      {
          (tabHash.orderedItemCount > 0)
            && (<span className="badge bg-success py-2 px-3 mx-auto">{tabHash.orderedItemCount}</span>)
        }

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
  <Card className="p-3">
    <Row>
      <Col sm={3}>
        <h4 className="p-0 m-0">
          <strong> Comments </strong>
        </h4>
      </Col>
      <Col sm={9}>
        <textarea
          className="form-control"
          name="comments"
          rows={4}
          placeholder="Is there anything that you would like to tell us about this order?"
          defaultValue={comments}
        />
      </Col>
    </Row>
  </Card>
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
  products, isMobile, isAdmin, isShopOwner, updateProductQuantity,
  wasProductOrderedPreviously, cartScreen, isBasket,
  isDeliveryInChennai,
}) {
  let productGroupMetaHash = {};
  // Grouping product categories by tabs
  // 'Vegetables', 'Fruits', 'Dhals', 'Greens', 'Spices', 'Oils', 'Rice', 'Wheat',
  //  'Sweetners',   'Eggs', 'Flours', 'DryFruits', 'Nuts', 'Cereals',
  // 'Millets', 'Beauty', 'Disposables'
  const productVegetables = [];
  const productFruits = [];
  const productGreens = [];
  const productRice = [];
  const productWheat = [];
  const productCereals = [];
  const productMillets = [];
  const productDhals = [];
  const productSweetners = [];
  const productSalts = [];
  const productSpices = [];
  const productNuts = [];
  const productDryFruits = [];
  const productOils = [];
  const productMilk = [];
  const productEggs = [];
  const productPrepared = [];
  const productDisposables = [];
  const productBeauty = [];
  const productRecommended = [];
  const productsNoCategory = [];
  const productSpecials = [];

  const checkout = !!(cartScreen);

  _.map(products, (product, index) => {
    if (!!wasProductOrderedPreviously && wasProductOrderedPreviously(product._id)) {
      productRecommended.push(
        <Product isMobile={isMobile} key={`recommended-${index}`} updateProductQuantity={updateProductQuantity} product={product} isAdmin={isAdmin || isShopOwner} checkout={checkout} isBasket={isBasket} />,
      );
      productGroupMetaHash = incrementMetaWithOrderCount(productGroupMetaHash, 'productRecommended', product);
    }

    if (product.displayAsSpecial) {
      if (!isDeliveryInChennai
        && (constants.ProductType[1] === product.type /* Vegetable */
        || constants.ProductType[2] === product.type) /* Fruits */
      ) {
        return;
      }

      productSpecials.push(
        <Product isMobile={isMobile} key={`special-${index}`} updateProductQuantity={updateProductQuantity} product={product} isAdmin={isAdmin || isShopOwner} checkout={checkout} isBasket={isBasket} />,
      );

      /* if (!(isAdmin || isShopOwner)) {
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
      } */

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
      case (constants.ProductType[3] === product.type): // Greens
        tempProductList = productGreens;
        tempKey = `green-${index}`;
        tempType = 'productGreens';
        break;
      case (constants.ProductType[4] === product.type): // Rice
        tempProductList = productRice;
        tempKey = `rice-${index}`;
        tempType = 'productRice';
        break;
      case (constants.ProductType[5] === product.type): // Wheat
        tempProductList = productWheat;
        tempKey = `wheat-${index}`;
        tempType = 'productWheat';
        break;
      case (constants.ProductType[6] === product.type): // Cereals
        tempProductList = productCereals;
        tempKey = `cereals-${index}`;
        tempType = 'productCereals';
        break;
      case (constants.ProductType[7] === product.type): // Millets
        tempProductList = productMillets;
        tempKey = `millets-${index}`;
        tempType = 'productMillets';
        break;
      case (constants.ProductType[8] === product.type): // Dhals
        tempProductList = productDhals;
        tempKey = `dhals-${index}`;
        tempType = 'productDhals';
        break;
      case (constants.ProductType[9] === product.type): // Sweetners
        tempProductList = productSweetners;
        tempKey = `sweetners-${index}`;
        tempType = 'productSweetners';
        break;
      case (constants.ProductType[10] === product.type): // Salts
        tempProductList = productSalts;
        tempKey = `salts-${index}`;
        tempType = 'productSalts';
        break;
      case (constants.ProductType[11] === product.type): // Spices
        tempProductList = productSpices;
        tempKey = `spices-${index}`;
        tempType = 'productSpices';
        break;
      case (constants.ProductType[12] === product.type): // Nuts
        tempProductList = productNuts;
        tempKey = `nuts-${index}`;
        tempType = 'productNuts';
        break;
      case (constants.ProductType[13] === product.type): // Dry Fruit
        tempProductList = productDryFruits;
        tempKey = `dryFruit-${index}`;
        tempType = 'productDryFruits';
        break;
      case (constants.ProductType[14] === product.type): // Oils
        tempProductList = productOils;
        tempKey = `oils-${index}`;
        tempType = 'productOils';
        break;
      case (constants.ProductType[15] === product.type): // Milk
        tempProductList = productMilk;
        tempKey = `milk-${index}`;
        tempType = 'productMilk';
        break;
      case (constants.ProductType[16] === product.type): // Eggs
        tempProductList = productEggs;
        tempKey = `eggs-${index}`;
        tempType = 'productEggs';
        break;
      case (constants.ProductType[17] === product.type): // Prepared
        tempProductList = productPrepared;
        tempKey = `prepared-${index}`;
        tempType = 'productPrepared';
        break;
      case (constants.ProductType[18] === product.type): // Disposables
        tempProductList = productDisposables;
        tempKey = `disposables-${index}`;
        tempType = 'productDisposables';
        break;
      case (constants.ProductType[19] === product.type): // Beauty
        tempProductList = productBeauty;
        tempKey = `beauty-${index}`;
        tempType = 'productBeauty';
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
    /* if (!(isAdmin || isShopOwner)) {
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
    } */
    productGroupMetaHash = incrementMetaWithOrderCount(productGroupMetaHash, tempType, product);
  });

  return {
    productVegetables,
    productFruits,
    productGreens,
    productRice,
    productWheat,
    productCereals,
    productMillets,
    productDhals,
    productSweetners,
    productSalts,
    productSpices,
    productNuts,
    productDryFruits,
    productOils,
    productEggs,
    productMilk,
    productDisposables,
    productBeauty,
    productSpecials,
    productRecommended,
    productsNoCategory,
    isMobile,
    productGroupMetaHash,
  };
}
