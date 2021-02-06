import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ListGroup, Alert, Row, Col, Panel, Button, ButtonToolbar,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Roles } from 'meteor/alanning:roles';
import Product from '../Product';
import ProductListView from '../ProductsSlideView/ProductsSlideView';
import { isLoggedInUserAdmin } from '../../../../modules/helpers';
import constants from '../../../../modules/constants';
import ProductSearch from '../ProductSearch/ProductSearch';
import ProductsOrderMobile from '../ProductsOrderMobile/ProductsOrderMobile';
import GenerateOrderList from '../../../../reports/client/GenerateOrderList';
import { upsertOrder, updateMyOrderStatus } from '../../../../api/Orders/methods';
import { OrderFooter, displayProductsByType } from '../ProductsOrderCommon/ProductsOrderCommon';
import { cartActions, useCartState, useCartDispatch } from '../../../stores/ShoppingCart';

import './ProductsOrderMain.scss';

const ProductsOrderMain = (props) => {
  const cartState = useCartState();
  const cartDispatch = useCartDispatch();
  const [productsArray, setProductsArray] = useState({});
  const {
    orderId, comments, products, history, dateValue, orderStatus, orderCustomerId,
  } = props;
  const isAdmin = isLoggedInUserAdmin();
  const isShopOwner = (isAdmin && orderCustomerId)
    ? Roles.userIsInRole(orderCustomerId, constants.Roles.shopOwner.name)
    : Roles.userIsInRole(props.loggedInUser, constants.Roles.shopOwner.name);
  const isRetailCustomer = !isAdmin && !isShopOwner;

  useEffect(() => {
    if (cartState.cart && cartState.cart.productsInCart) {
      const prdArray = {};

      products.forEach((product) => {
        prdArray[product._id] = (cartState.cart.productsInCart[product._id])
          ? cartState.cart.productsInCart[product._id]
          : { ...product, quantity: 0 };
      });

      setProductsArray(prdArray);
    }
  }, [cartState.cart, products]);

  const handleCancel = (e) => {
    e.preventDefault();
    if (confirm('Are you sure about cancelling this Order? This is permanent!')) {
      const order = {
        orderId,
        updateToStatus: constants.OrderStatus.Cancelled.name,
      };

      updateMyOrderStatus.call(order, (error) => {
        const confirmation = 'This Order has been cancelled.';
        if (error) {
          toast.error(error.reason);
        } else {
          toast.success(confirmation);
          history.push('/');
        }
      });
    }
  };

  const displayToolBar = (orderStatus) => (
    <ButtonToolbar className="pull-right">
      {(orderStatus === constants.OrderStatus.Pending.name || orderStatus === constants.OrderStatus.Saved.name) && (<Button bsSize="small" onClick={handleCancel}>Cancel Order</Button>)}
      {(isAdmin) && (<Button bsSize="small" onClick={handlePrintProductList}>Print Order List</Button>)}
    </ButtonToolbar>
  );

  const handlePrintProductList = () => {
    GenerateOrderList(products, dateValue);
  };

  const handleOrderSubmit = (saveStatus) => {
    const commentBox = document.querySelector('[name="comments"]');

    const selectedProducts = [];

    Object.keys(cartState.cart.productsInCart).map((key) => {
      selectedProducts.push(cartState.cart.productsInCart[key]);
    });

    const order = {
      products: selectedProducts,
      _id: orderId,
      loggedInUserId: loggedInUser._id,
      order_status: saveStatus,
      // totalBillAmount: this.state.totalBillAmount,
      comments: (commentBox) ? commentBox.value : '',
    };

    upsertOrder.call(order, (error) => {
      const confirmation = 'Your Order has been placed';
      if (error) {
        toast.error(error.reason);
      } else {
        toast.success(confirmation);
        cartDispatch({ type: cartActions.emptyCart });
        history.push('/');
      }
    });
  };

  const updateProductQuantity = (productId, quantity) => {
    const product = productsArray[productId];
    product.quantity = quantity;

    cartDispatch({ type: cartActions.updateCart, payload: { product } });
  };

  const changeProductQuantity = (e) => {
    const productId = e.target.name;
    const quantity = e.target.value;
    updateProductQuantity(productId, quantity);
  };

  const getProductsMatchingSearch = (searchString, numOfElements) => {
    const searchResults = [];
    const lowerSearchString = searchString.toLowerCase();

    _.map(products, (product, index) => {
      if (product.name.toLowerCase().indexOf(lowerSearchString) > -1) {
        const prd = cartState.cart.productsInCart[product._id]
          ? cartState.cart.productsInCart[product._id] : { ...product, quantity: 0 };

        searchResults.push(
          <Product
            key={`srch-${index}`}
            updateProductQuantity={changeProductQuantity}
            product={prd}
            isAdmin={isAdmin}
            isShopOwner={isShopOwner}
          />,
        );
      }
    });

    return searchResults.slice(0, numOfElements);
  };

  const displayProductsByTypeStandardView = (
    productGroups,
    isMobile,
  ) => (
    <div className="productOrderList">
      {(isRetailCustomer) && (
      <ProductListView
        menuList={productGroups.productSpecials}
        changeProductQuantity={changeProductQuantity}
        isAdmin={isAdmin}
        isShopOwner={isShopOwner}
      />
      )}
      {isMobile && (
      <ProductsOrderMobile
        productGroups={productGroups}
        productsArray={productsArray}
        orderId={orderId}
        orderStatus={orderStatus}
        comments={comments}
        totalBillAmount={cartState.cart.totalBillAmount}
        dateValue={dateValue}
        history={history}
      />
      )}
    </div>
  );

  const displayOrderFooter = (isMobile) => (
    <OrderFooter
      totalBillAmount={cartState.cart.totalBillAmount}
      onButtonClick={
      () => {
        history.push(`/cart/${orderId || ''}`);
      }
    }
      submitButtonName="Checkout →"
      onSecondButtonClick={() => { handleOrderSubmit(constants.OrderStatus.Saved.name); }}
      isMobile={isMobile}
    />
  );

  const displayProductsAndSubmit = (isMobile, productGroups) => (
    products.length > 0 ? (
      <Panel>
        <Row>
          <Col xs={12}>
            <ProductSearch
              getProductsMatchingSearch={getProductsMatchingSearch}
              ref={(productSearchCtrl) => (productSearchCtrl = productSearchCtrl)}
            />
          </Col>
          <Col xs={12}>
            <ListGroup className="products-list">
              {
                displayProductsByTypeStandardView(
                  productGroups,
                  isMobile,
                )
              }
            </ListGroup>
          </Col>

          <Col xs={12}>
            {displayOrderFooter(isMobile)}
          </Col>
        </Row>
      </Panel>
    )
      : (
        <Alert bsStyle="info">
          Every day, List of available fresh items and their prices will be updated by 11 AM.
          Please wait for the message in the group.
        </Alert>
      )
  );

  // Grouping product categories by tabs
  const isMobile = true;
  const formHeading = (orderStatus) ? 'Update Your Order' : ' Place Your Order';

  const productGroups = displayProductsByType(
    {
      products: productsArray,
      isMobile,
      isAdmin,
      isShopOwner,
      updateProductQuantity: changeProductQuantity,
    },
  );

  return (
    <div className="EditOrderDetails ">
      <Row>
        <Col xs={12}>
          <h3 className="page-header">
            {' '}
            {formHeading}
            {displayToolBar(orderStatus)}
          </h3>
          {displayProductsAndSubmit(isMobile, productGroups)}
        </Col>
      </Row>
    </div>
  );
};

ProductsOrderMain.defaultProps = {
  orderId: '',
  orderStatus: '',
  comments: '',
  dateValue: new Date(),
  orderedProducts: [],
  addItemsFromCart: false,
};

ProductsOrderMain.propTypes = {
  products: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
  loggedInUser: PropTypes.object.isRequired,
  addItemsFromCart: PropTypes.bool,
  orderedProducts: PropTypes.array,
  orderId: PropTypes.string,
  orderStatus: PropTypes.string,
  comments: PropTypes.string,
  dateValue: PropTypes.object,
  orderCustomerId: PropTypes.string,
};

export default ProductsOrderMain;
