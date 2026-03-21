import { Roles } from 'meteor/alanning:roles';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import constants from '../../../../modules/constants';
import {
  calculateBulkDiscount,
  displayUnitOfSale,
} from '../../../../modules/helpers';

import { formatMoney } from 'accounting-js';

import { accountSettings } from '/imports/modules/settings';

import {
  cartActions,
  useCartDispatch,
  useCartState,
} from '../../../stores/ShoppingCart';
import Loading from '../../Loading/Loading';
import Product from '../Product';
import { QuantitySelector } from '../ProductForNonAdmin';

function ProductsOrderFromDetails(props) {
  const cartState = useCartState();
  const cartDispatch = useCartDispatch();
  const [product, setProduct] = useState({});
  const [productDetails, setProductDetails] = useState({});
  const navigate = useNavigate();
  const {
    orderId,
    comments,
    products,
    dateValue,
    orderStatus,
    orderCustomerId,
  } = props;

  function formatString(input) {
    return input.replace(/\s+/g, '').toLowerCase();
  }

  async function getProductDetails(productId) {
    try {
      const productDetails = await Meteor.callAsync(
        'productDetails.getProductDetails',
        productId,
      );
      setProductDetails(productDetails);
    } catch (error) {
      toast.error(error.reason);
    }
  }

  useEffect(() => {
    if (cartState.cart && cartState.cart.productsInCart) {
      products.forEach((product) => {
        const sale = product.unitsForSelection.indexOf('%') !== -1;
        const prd = cartState.cart.productsInCart[product._id]
          ? { ...cartState.cart.productsInCart[product._id], sale }
          : { ...product, quantity: 0, sale };

        if (formatString(product.name) === formatString(props.productName)) {
          getProductDetails(prd._id);
          setProduct(prd);
        }
      });
    }
  }, [cartState.cart, products]);

  function imagePath(imageurl) {
    return `${Meteor.settings.public.Product_Images}${imageurl}?${Meteor.settings.public.Product_Images_Version}`;
  }

  function createMarkup(htmlString) {
    return { __html: htmlString };
  }

  function onChange(props) {
    const prod = product;
    prod.quantity = props.target.value;
    setProduct(prod);
  }

  function addToCart() {
    const prod = { ...product };
    if (prod.quantity !== 0 && prod.quantity !== '0') {
      cartDispatch({
        type: cartActions.updateCart,
        payload: { product: prod },
      });
      navigate('/cart');
    } else {
      toast.warn('Please select quantity you would like to order.');
    }
  }

  function startWhatsApp() {
    const prod = { ...product };
    window.location.href = 'https://wa.link/chew75';
  }

  if (!product.name) {
    return <Loading />;
  }

  const firstNonZeroOrderQty = 1;
  const unitsForSelectionArray = product.unitsForSelection.split(',');
  const lowestOrdQty =
    unitsForSelectionArray.length > 0
      ? unitsForSelectionArray[firstNonZeroOrderQty]
      : 0;
  const lowestOrdQtyPrice = product.unitprice * lowestOrdQty;
  const unit = product.unitOfSale;

  return (
    <>
      <h3 className="py-4 col-12 text-center"> {product.name} </h3>
      <div className="px-2 pb-6">
        <div className="card py-4">
          <div className="row">
            <div className="col-sm-5">
              <div className="d-flex flex-column text-center">
                <div className="main_image">
                  <img
                    src={imagePath(product.image_path)}
                    alt=""
                    className="item-image no-aliasing-image img-responsive"
                  />
                </div>
              </div>
            </div>

            <div className="col-sm-7">
              <div className="p-3 right-side">
                <div className="mt-2 pr-3 content">
                  <p>{product.description}</p>
                </div>
                <div>
                  <h3 className="col-10 mb-2">
                    {`${displayUnitOfSale(lowestOrdQty, unit)}, ${formatMoney(lowestOrdQtyPrice, accountSettings)}`}
                  </h3>
                </div>
                <QuantitySelector
                  values={product.unitsForSelection.split(',')}
                  onChange={onChange}
                  unit={product.unitOfSale}
                  unitprice={product.unitprice}
                  controlName={`prdDetails`}
                  quantitySelected={product.quantitySelected}
                  sliderView={false}
                  displayDelete={false}
                />
                <div className="d-flex flex-row col-10 mt-4">
                  <button
                    id="addToCart"
                    className="btn btn-success"
                    onClick={startWhatsApp}
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
          {productDetails && productDetails.description && (
            <div className="row px-4">
              <div className="col-12 col-sm-7 col-md-9 py-2 mx-auto">
                <h3 className="py-3">Product Description</h3>
                <p
                  dangerouslySetInnerHTML={createMarkup(
                    productDetails.description,
                  )}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

ProductsOrderFromDetails.defaultProps = {
  basketId: '',
  category: '',
  subCategory: '',
  productId: '',
};

ProductsOrderFromDetails.propTypes = {
  loggedInUser: PropTypes.object.isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  name: PropTypes.string.isRequired,
  dateValue: PropTypes.object.isRequired,
  productId: PropTypes.string,
};

export default ProductsOrderFromDetails;
