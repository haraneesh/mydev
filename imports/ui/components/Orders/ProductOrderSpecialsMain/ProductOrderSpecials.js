import React, { useState, useEffect } from 'react';
import { OrderFooter } from '../../Cart/CartCommon';
import { cartActions, useCartState, useCartDispatch } from '../../../stores/ShoppingCart';

import Product from '../Product';

function ProductOrderSpecials({ products, placeOrder }) {
  const [productss, updateProducts] = useState();
  const cartDispatch = useCartDispatch();
  const cartState = useCartState();

  useEffect(() => {
    updateProducts(products);
  }, []);

  const updateProductQuantity = (productId, quantity) => {
    const shallowClone = { ...productss };
    const product = shallowClone.specialProductsMap[productId];
    product.quantity = quantity;
    cartDispatch({ type: cartActions.updateCart, payload: { product } });
    updateProducts(shallowClone);
  };

  const changeProductQuantity = (e) => {
    const productId = e.target.name;
    const quantity = e.target.value;
    updateProductQuantity(productId, quantity);
  };

  const ProductsToOrder = () => {
    const ProductRows = Object.keys(productss.specialProductsMap).map((productId, index) => (
      <Product
        isMobile
        key={`splOrder-${index}`}
        updateProductQuantity={changeProductQuantity}
        product={products.specialProductsMap[productId]}
        isAdmin={false}
      />
    ));
    return (
      <>
        <div className="py-2 text-center">
          <div className="bg-body">
            <div className="row">
              {ProductRows}
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-body py-4 px-2">
            <h4>
              Please note, delivery charges may apply if a delivery partner
              like Dunzo is hired to deliver.
            </h4>
            <OrderFooter
              totalBillAmount={cartState.cart.totalBillAmount}
              onButtonClick={placeOrder}
              submitButtonName="Next &#x2192;"
              isMobile
            />
          </div>
        </div>
      </>
    );
  };
  if (productss) {
    return (<ProductsToOrder />);
  }
  return (<div />);
}
export default ProductOrderSpecials;

export const NoProductsToOrder = ({ history }) => (
  <p>
    <br />
    <h4>
      Hello, We do not seem to have any special products for you to order today!
    </h4>
    <br />
    <h4>
      Suvai member, you can access
      products available to community members after you Sign in to the application.
    </h4>
    <button
      type="button"
      className="btn btn-primary"
      onClick={() => { history.push('/login'); }}
    >
      Take me to sign in
    </button>
  </p>
);
