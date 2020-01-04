import $ from 'jquery';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ListGroup, Alert, Row, Col, Panel, Button, ButtonToolbar } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import Product from '../Product';
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
  const { orderId, comments, products, history, dateValue, orderStatus } = props;
  const isAdmin = isLoggedInUserAdmin();
  const [productsArray, setProductsArray] = useState({});


  useEffect(() => {
    if (cartState.cart && cartState.cart.productsInCart) {
      const prdArray = {};

      products.forEach((product) => {
        prdArray[product._id] = (cartState.cart.productsInCart[product._id]) ?
          cartState.cart.productsInCart[product._id] :
          { ...product, quantity: 0 };
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
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(confirmation, 'success');
          history.push('/');
        }
      });
    }
  };

  const displayToolBar = orderStatus => (
    <ButtonToolbar className="pull-right">
      { (orderStatus === constants.OrderStatus.Pending.name || orderStatus === constants.OrderStatus.Saved.name) && (<Button bsSize="small" onClick={handleCancel}>Cancel Order</Button>)}
      { (isAdmin) && (<Button bsSize="small" onClick={handlePrintProductList}>Print Order List</Button>)}
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
      order_status: saveStatus,
          // totalBillAmount: this.state.totalBillAmount,
      comments: (commentBox) ? commentBox.value : '',
    };

    upsertOrder.call(order, (error) => {
      const confirmation = 'Your Order has been placed';
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert(confirmation, 'success');
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
        const prd = cartState.cart.productsInCart[product._id] ?
           cartState.cart.productsInCart[product._id] : { ...product, quantity: 0 };

        searchResults.push(
          <Product
            key={`srch-${index}`}
            updateProductQuantity={changeProductQuantity}
            product={prd}
            isAdmin={this.isAdmin}
          />,
          );
      }
    });

    return searchResults.slice(0, numOfElements);
  };

  const displayProductsByTypeStandardView = (
    productVegetables,
    productFruits,
    productDhals,
    productGrains,
    productSpices,
    productOils,
    productPrepared,
    productHygiene,
    productSpecials,
    productRecommended,
    isMobile) => {
    const productGroups = [
      productVegetables,
      productFruits,
      productDhals,
      productGrains,
      productSpices,
      productOils,
      productPrepared,
      productHygiene,
      productSpecials,
      productRecommended];

    return (
      <div className="productOrderList">
        { isMobile && (
          <ProductsOrderMobile
            productGroups={productGroups}
            productsArray={productsArray}
            orderId={orderId}
            orderStatus={orderStatus}
            comments={comments}
            totalBillAmount={cartState.cart.totalBillAmount}
            dateValue={dateValue}
            history={history}
          />)
        }
      </div>
    );
  };

  const displayOrderFooter = isMobile => (<OrderFooter
    totalBillAmount={cartState.cart.totalBillAmount}
    onButtonClick={
        () => {
          history.push(`/cart/${orderId || ''}`);
        }
      }
    submitButtonName={'Checkout →'}
    onSecondButtonClick={() => { handleOrderSubmit(constants.OrderStatus.Saved.name); }}
    isMobile={isMobile}
  />
);

  const displayProductsAndSubmit = (isMobile, productGroups) => (
     products.length > 0 ? <Panel>
       <Row>
         <Col xs={12}>
           <ProductSearch
             getProductsMatchingSearch={getProductsMatchingSearch}
             ref={productSearchCtrl => (productSearchCtrl = productSearchCtrl)}
           />
         </Col>
         <Col xs={12}>
           <ListGroup className="products-list">

             {
               displayProductsByTypeStandardView(
                productGroups.productVegetables,
                productGroups.productFruits,
                productGroups.productDhals,
                productGroups.productGrains,
                productGroups.productSpices,
                productGroups.productOils,
                productGroups.productPrepared,
                productGroups.productHygiene,
                productGroups.productSpecials,
                // productGroups.productRecommended,
                [],
                isMobile)}

           </ListGroup>
         </Col>

         <Col xs={12}>
           {displayOrderFooter(isMobile)}
         </Col>
       </Row>
     </Panel>
      :
     <Alert bsStyle="info">
        Every day, List of fresh items available to order is posted after 11 AM. Please wait for the message in the group.
     </Alert>
    );

    // Grouping product categories by tabs
  const ipadWidth = 8000; // 768
  const isMobile = window.innerWidth <= ipadWidth;
  const formHeading = (orderStatus) ? 'Update Your Order' : ' Place Your Order';

  const productGroups = displayProductsByType(
    {
      products: productsArray,
      isMobile,
      isAdmin,
      updateProductQuantity: changeProductQuantity,
    },
    );

  return (<div className="EditOrderDetails ">
    <Row>
      <Col xs={12}>
        <h3 className="page-header"> { formHeading }
          { displayToolBar(orderStatus) }
        </h3>
        { displayProductsAndSubmit(isMobile, productGroups) }
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
  orderedProducts: PropTypes.array,
  orderId: PropTypes.string,
  orderStatus: PropTypes.string,
  comments: PropTypes.string,
  dateValue: PropTypes.object,
  history: PropTypes.object.isRequired,
  addItemsFromCart: PropTypes.bool,
};

export default ProductsOrderMain;
