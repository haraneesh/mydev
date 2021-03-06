import React from 'react';
import PropTypes from 'prop-types';
import { PanelGroup } from 'react-bootstrap';
import { displayProductsByType } from '../Orders/ProductsOrderCommon/ProductsOrderCommon';

export const createProductHash = (productArray) => {
  const productsHash = {};
  productArray.forEach((product) => {
    productsHash[product._id] = product;
  });
  return productsHash;
};

const displayWithDivider = (displayArray, displayText) => (
  displayArray.length > 0 && (
    <div className="panel panel-default" style={{ borderBottomWidth: '0px' }}>
      {displayText
        && (
        <div className="panel-heading" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
          <small className="text-uppercase">{displayText}</small>
        </div>
        )}
      <div className="panel-body">
        {displayArray}
      </div>
    </div>
  ));

export const ListProducts = ({
  products, productsNotInBasket, updateProductQuantity, isMobile, isAdmin, isShopOwner,
}) => (
  <div>
    <div className="panel-heading" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
      <h4 className="text-uppercase">Products Added to Basket</h4>
    </div>
    <DisplayProdRows
      products={products}
      updateProductQuantity={updateProductQuantity}
      isMobile={isMobile}
      isAdmin={isAdmin}
      isShopOwner={isShopOwner}
    />

    <hr />

    <div className="panel-heading" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
      <h4 className="text-uppercase">Products Not Yet Added</h4>
    </div>

    <DisplayProdRows
      products={productsNotInBasket}
      updateProductQuantity={updateProductQuantity}
      isMobile={isMobile}
      isAdmin={isAdmin}
      isShopOwner={isShopOwner}
    />
  </div>
);

const DisplayProdRows = ({
  products, updateProductQuantity, isMobile, isAdmin, isShopOwner,
}) => {
  const {
    productVegetables,
    productFruits,
    productDhals,
    productGrains,
    productSpices,
    productOils,
    productPrepared,
    productHygiene,
    productSweetners,
  } = displayProductsByType({
    products, isMobile, isAdmin, isShopOwner, cartScreen: true, updateProductQuantity, isBasket: true,
  });

  return (
    <PanelGroup className="order-details-products">
      {/* <Panel>
      <Row>
        <Col xs={7} sm={9}> <strong> Name </strong></Col>
        <Col xs={3} className="text-right-xs"> <strong> Rate </strong></Col>
        <Col xs={5} sm={3} className="text-left"> <strong> Value </strong></Col>
      </Row>
    </Panel> */}

      {displayWithDivider(productVegetables, 'Vegetables')}
      {displayWithDivider(productFruits, 'Fruits')}
      {displayWithDivider(productGrains, 'Grains & Flour')}
      {displayWithDivider(productDhals, 'Pulses, Lentils & Dried Beans')}
      {displayWithDivider(productSpices, 'Spices & Nuts')}
      {displayWithDivider(productOils, 'Oils, Butter & Ghee')}
      {displayWithDivider(productPrepared, 'Pickles & Podis')}
      {displayWithDivider(productSweetners, 'Sweetners')}
      {displayWithDivider(productHygiene, 'Personal & General Hygiene')}
    </PanelGroup>
  );
};
