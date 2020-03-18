import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Panel, PanelGroup, Button } from 'react-bootstrap';
import Product from '../Orders/Product';
import { displayProductsByType } from '../../components/Orders/ProductsOrderCommon/ProductsOrderCommon';

const displayWithDivider = (displayArray, displayText) => (
  displayArray.length > 0 && (
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
  } = displayProductsByType({ products, isMobile, isAdmin, isShopOwner, cartScreen: true, updateProductQuantity, isBasket: true });

  const chosenButDeleted = [];
  Object.keys(deletedProducts).map((key, index) => {
    const product = deletedProducts[key];
    chosenButDeleted.push(
      <Product
        isMobile={isMobile}
        key={`review-${index}`}
        updateProductQuantity={updateProductQuantity}
        product={product}
        isAdmin={isAdmin || isShopOwner}
        checkout
        isBasket
      />,
    );
  });

  return (
    <PanelGroup className="order-details-products">
      {/*<Panel>
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
      {displayWithDivider(productHygiene, 'Personal & General Hygiene')}
      {displayWithDivider(chosenButDeleted, 'Removed From Cart')}
    </PanelGroup>
  );
};
