import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import constants from '../../../../modules/constants';
import { isDeviceMobile } from '../../../../modules/helpers';

export const OrderFooter = ({
  isMobile,
  totalBillAmount,
  onButtonClick,
  submitButtonName,
  onSecondButtonClick = {},
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

OrderFooter.propTypes = {
  isMobile: PropTypes.bool.isRequired,
  onButtonClick: PropTypes.func.isRequired,
  onSecondButtonClick: PropTypes.func,
  totalBillAmount: PropTypes.number.isRequired,
  submitButtonName: PropTypes.string.isRequired,
};

export const SideBarDisplayHeader = ({ clName, title, onclick, imgName }) => (
  <div onClick={onclick} className="productCatHead row pb-2">
    {/* <Col sm={3} className={`productCatHeadIcon productCat_${clName}`} /> */}
    <img
      className="col-sm-3 col-xs-12 mx-auto productCatImg"
      src={`/app/${imgName}.png`}
      alt={`${title}`}
    />

    <Col xs={12} sm={9} className="pe-1 mx-auto text-center-xs">
      <p style={{ marginBottom: '0px', fontSize: '90%' }}>
        <span style={{ verticalAlign: 'middle' }}>{title}</span>
      </p>
    </Col>
  </div>
);

export const DisplayCategoryHeader = ({
  clName,
  title,
  onclick,
  isOpen,
  tabHash,
}) => (
  <Row onClick={onclick} className="productCatHead" style={{ width: '100%' }}>
    <Col xs={3} sm={2} className={`productCat_${clName}`} />
    <Col xs={7} sm={9} className="prodCatTitle">
      <p style={{ marginBottom: '0px' }}>
        {' '}
        <span style={{ verticalAlign: 'middle' }}> {title} </span>{' '}
      </p>
    </Col>
    <Col xs={2} sm={1} className="prodCatPlus text-center">
      {!!isOpen && <b style={{ fontSize: '1.5rem' }}> - </b>}
      {!isOpen && <b style={{ fontSize: '1.5rem' }}> + </b>}
      {tabHash.orderedItemCount > 0 && (
        <span className="badge bg-success py-2 px-3 mx-auto">
          {tabHash.orderedItemCount}
        </span>
      )}
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

const incrementMetaWithOrderCount = (
  productGroupMetaHash,
  productType,
  product,
) => {
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

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
  );
}

export function displayProductsByType({
  products,
  isMobile,
  isAdmin,
  isShopOwner,
  updateProductQuantity,
  wasProductOrderedPreviously,
  cartScreen,
  isBasket,
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

  const checkout = !!cartScreen;

  _.map(products, (product, index) => {
    if (
      !!wasProductOrderedPreviously &&
      wasProductOrderedPreviously(product._id)
    ) {
      productRecommended.push({
        isMobile,
        key: `recommended-${index}`,
        updateProductQuantity,
        product,
        isAdmin,
        isShopOwner,
        checkout,
        isBasket,
      });
      productGroupMetaHash = incrementMetaWithOrderCount(
        productGroupMetaHash,
        'productRecommended',
        product,
      );
    }

    if (product.displayAsSpecial) {
      if (
        !isDeliveryInChennai &&
        (product.type === constants.ProductTypeName.Vegetables.name || 
         product.type === constants.ProductTypeName.Fruits.name)
      ) {
        return;
      }

      productSpecials.push({
        isMobile,
        key: `special-${index}`,
        updateProductQuantity,
        product,
        isAdmin,
        isShopOwner,
        checkout,
        isBasket,
      });

      productGroupMetaHash = incrementMetaWithOrderCount(
        productGroupMetaHash,
        'productSpecials',
        product,
      );
    }

    let tempProductList = [];
    let tempKey = '';
    let tempType = '';

    switch (true) {
      case constants.ProductTypeName.Vegetables.name === product.type: // Vegetables
        tempProductList = productVegetables;
        tempKey = `vegetable-${index}`;
        tempType = 'productVegetables';
        break;
      case constants.ProductTypeName.Fruits.name === product.type: // Fruits
        tempProductList = productFruits;
        tempKey = `fruit-${index}`;
        tempType = 'productFruits';
        break;
      case constants.ProductTypeName.Greens.name === product.type: // Greens
        tempProductList = productGreens;
        tempKey = `green-${index}`;
        tempType = 'productGreens';
        break;
      case constants.ProductTypeName.Rice.name === product.type: // Rice
        tempProductList = productRice;
        tempKey = `rice-${index}`;
        tempType = 'productRice';
        break;
      case constants.ProductTypeName.Wheat.name === product.type: // Wheat
        tempProductList = productWheat;
        tempKey = `wheat-${index}`;
        tempType = 'productWheat';
        break;
      /* case (constants.ProductTypeName.Cereals.name === product.type): // Cereals
        tempProductList = productCereals;
        tempKey = `cereals-${index}`;
        tempType = 'productCereals';
        break; */
      case constants.ProductTypeName.Millets.name === product.type: // Millets
        tempProductList = productMillets;
        tempKey = `millets-${index}`;
        tempType = 'productMillets';
        break;
      case constants.ProductTypeName.Dhals.name === product.type: // Dhals
        tempProductList = productDhals;
        tempKey = `dhals-${index}`;
        tempType = 'productDhals';
        break;
      case constants.ProductTypeName.Sweetners.name === product.type: // Sweetners
        tempProductList = productSweetners;
        tempKey = `sweetners-${index}`;
        tempType = 'productSweetners';
        break;
      case constants.ProductTypeName.Salts.name === product.type: // Salts
        tempProductList = productSalts;
        tempKey = `salts-${index}`;
        tempType = 'productSalts';
        break;
      case constants.ProductTypeName.Spices.name === product.type: // Spices
        tempProductList = productSpices;
        tempKey = `spices-${index}`;
        tempType = 'productSpices';
        break;
      case constants.ProductTypeName.Nuts.name === product.type: // Nuts
        tempProductList = productNuts;
        tempKey = `nuts-${index}`;
        tempType = 'productNuts';
        break;
      case constants.ProductTypeName.DryFruits.name === product.type: // Dry Fruit
        tempProductList = productDryFruits;
        tempKey = `dryFruit-${index}`;
        tempType = 'productDryFruits';
        break;
      case constants.ProductTypeName.Oils.name === product.type: // Oils
        tempProductList = productOils;
        tempKey = `oils-${index}`;
        tempType = 'productOils';
        break;
      case constants.ProductTypeName.Milk.name === product.type:
        tempProductList = productMilk;
        tempKey = `milk-${index}`;
        tempType = 'productMilk';
        break;
      case constants.ProductTypeName.Eggs.name === product.type: // Eggs
        tempProductList = productEggs;
        tempKey = `eggs-${index}`;
        tempType = 'productEggs';
        break;
      case constants.ProductTypeName.Prepared.name === product.type: // Prepared
        tempProductList = productPrepared;
        tempKey = `prepared-${index}`;
        tempType = 'productPrepared';
        break;
      case constants.ProductTypeName.Disposables.name === product.type: // Disposables
        tempProductList = productDisposables;
        tempKey = `disposables-${index}`;
        tempType = 'productDisposables';
        break;
      case constants.ProductTypeName.Beauty.name === product.type: // Beauty
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

    tempProductList.push({
      isMobile,
      key: tempKey,
      updateProductQuantity,
      product,
      isAdmin,
      isShopOwner,
      checkout,
      isBasket,
    });
    productGroupMetaHash = incrementMetaWithOrderCount(
      productGroupMetaHash,
      tempType,
      product,
    );
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
    productPrepared,
    productRecommended,
    productsNoCategory,
    isMobile,
    productGroupMetaHash,
  };
}
