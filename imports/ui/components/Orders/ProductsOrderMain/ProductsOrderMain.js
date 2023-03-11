import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ListGroup from 'react-bootstrap/ListGroup';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { toast } from 'react-toastify';
import { Roles } from 'meteor/alanning:roles';
import { isChennaiPinCode, isLoggedInUserAdmin } from '../../../../modules/helpers';
import Product from '../Product';
import ProductListView from '../ProductsSlideView/ProductsSlideView';

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
    <div className="row text-center pt-2">
      <Col xs={12}>
        <DropdownButton
          id="btnSetDeliveryCode"
          title={`Delivery: ${(isChennaiPinCode(cartState.cart.deliveryPincode)) ? 'In Chennai' : 'Out of Chennai'} (${cartState.cart.deliveryPincode ? cartState.cart.deliveryPincode : '---'})`}
          className="d-inline-flex pe-2 mb-2"
        >
          <Dropdown.Item
            className="mx-5"
            onClick={() => {
              cartDispatch({
                type: cartActions.setDeliveryPinCode,
                payload: { deliveryPincode: '' },
              });
            }}
          >
            Change Delivery Location
          </Dropdown.Item>
        </DropdownButton>

        {
        (orderStatus === constants.OrderStatus.Pending.name
          || orderStatus === constants.OrderStatus.Saved.name)
        && (<Button onClick={handleCancel} variant="info">Cancel Order</Button>)
        }
      </Col>
      <div>
        {(isAdmin) && (<Button onClick={handlePrintProductList} variant="info">Print Order List</Button>)}
      </div>
    </div>
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
      deliveryPincode: cartState.cart.deliveryPincode,
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

  const getProductsMatchingSearch = (searchString /* numOfElements */) => {
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

    return searchResults;

    // limit search results
    // return searchResults.slice(0, numOfElements);
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
        deliveryPincode={cartState.cart.deliveryPincode}
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
      <Card className="m-1 mb-5">
        <Row>
          <Col xs={12} className="pt-0">
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
      </Card>
    )
      : (
        <Alert variant="info">
          Every day, List of available fresh items and their prices will be updated by 11 AM.
          Please wait for the message in the group.
        </Alert>
      )
  );

  // Grouping product categories by tabs
  const isMobile = true;
  const formHeading = (orderStatus) ? 'Update Your Order' : ' Choose Your Products';

  const productGroups = displayProductsByType(
    {
      products: productsArray,
      isMobile,
      isAdmin,
      isShopOwner,
      updateProductQuantity: changeProductQuantity,
      isDeliveryInChennai: isChennaiPinCode(cartState.cart.deliveryPincode),
    },
  );

  return (
    <div className="EditOrderDetails ">
      <Row>
        <Col xs={12}>
          <div className="py-4 my-2 text-center">
            <h2>
              {formHeading}
            </h2>
            {displayToolBar(orderStatus)}
          </div>
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
