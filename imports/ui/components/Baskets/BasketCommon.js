import React from 'react';
import constants from '../../../../modules/constants';
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
    <div className="card" style={{ borderBottomWidth: '0px' }}>
      <div className="card-body">
        {displayText
        && (
        <div className="card-title" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
          <small className="text-uppercase">{displayText}</small>
        </div>

        )}
        <div className="card-text">
          {displayArray}
        </div>
      </div>
    </div>
  ));

export const ListProducts = ({
  products, productsNotInBasket, updateProductQuantity, isMobile, isAdmin, isShopOwner,
}) => (
  <div>
    <div className="card-header" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
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

    <div className="card-header" style={{ borderRadius: '4px', fontWeight: 'bold' }}>
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
    productFlours,
    productBatter,
    productSnacks,
    productPrepared,
    productHygiene,
    productSweetners,
  } = displayProductsByType({
    products, isMobile, isAdmin, isShopOwner, cartScreen: true, updateProductQuantity, isBasket: true,
  });

  return (
    <div className="card-group order-details-products">
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
    </div>
  );
};
