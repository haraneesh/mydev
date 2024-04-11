import React from 'react';
import PropTypes from 'prop-types';
import ProductForAdmin from './ProductForAdmin';
import ProductForNonAdmin from './ProductForNonAdmin';

import './Product.scss';

const Product = ({
  updateProductQuantity, product, isAdmin, checkout, isShopOwner, isBasket, productClass, sliderView, associatedReturnables, includeReturnables,
}) => {
  let classes = (productClass) || '';
  if (product.displayAsSpecial && !(isAdmin || isShopOwner || checkout)) {
    classes += '  special-product-item fix-product-height col-6 col-sm-3';
  } else {
    classes += (!checkout && !isAdmin && !isShopOwner) ? ' col-6 col-sm-3 fix-product-height' : ' col-12';
  }

  return (
    <div key={product._id} className={classes}>
      {!(isAdmin || isShopOwner) ? (
        <ProductForNonAdmin
          productId={product._id}
          sku={product.sku}
          name={product.name}
          image={product.image_path}
          description={product.description}
          unit={product.unitOfSale}
          unitprice={product.unitprice}
          vendor={product.vendor_details}
          onChange={updateProductQuantity}
          quantitySelected={(product.quantity) ? product.quantity : 0}
          unitsForSelection={product.unitsForSelection}
          maxUnitsAvailableToOrder={(product.maxUnitsAvailableToOrder) ? product.maxUnitsAvailableToOrder : 0}
          totQuantityOrdered={product.totQuantityOrdered}
          previousOrdQty={(product.previousOrdQty) ? product.previousOrdQty : 0}
          isAdmin={isAdmin}
          checkout={checkout}
          removedDuringCheckout={product.removedDuringCheckout}
          isBasket={isBasket}
          sliderView={sliderView}
          associatedReturnables={product.associatedReturnables}
          includeReturnables={product.includeReturnables}
        />
      )
        : (
          <ProductForAdmin
            productId={product._id}
            sku={product.sku}
            name={product.name}
            image={product.image_path}
            description={product.description}
            unit={product.unitOfSale}
            unitprice={product.unitprice}
            vendor={product.vendor_details}
            onChange={updateProductQuantity}
            quantitySelected={(product.quantity) ? product.quantity : 0}
            unitsForSelection={product.unitsForSelection}
            maxUnitsAvailableToOrder={(product.maxUnitsAvailableToOrder) ? product.maxUnitsAvailableToOrder : 0}
            totQuantityOrdered={product.totQuantityOrdered}
            previousOrdQty={(product.previousOrdQty) ? product.previousOrdQty : 0}
            isBasket={isBasket}
            isAdmin={isAdmin}
            checkout={checkout}
            associatedReturnables={product.associatedReturnables}
            includeReturnables={product.includeReturnables}
          />
        )}
    </div>
  );
};

Product.defaultProps = {
  checkout: false,
};

Product.propTypes = {
  updateProductQuantity: PropTypes.func.isRequired,
  product: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  checkout: PropTypes.bool,
};

export default Product;
