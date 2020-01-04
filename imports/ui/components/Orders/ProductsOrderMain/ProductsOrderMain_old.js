import $ from 'jquery';
import React from 'react';
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
import { cartActions } from '../../../stores/ShoppingCart';


import './ProductsOrderMain.scss';

const OrderView = {
  RecommendedView: {
    name: 'RecommendedView',
  },
  FullView: {
    name: 'FullView',
  },
};

export default class ProductsOrderMain extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.initProductSelectionState = this.initProductSelectionState.bind(this);
    this.changeView = this.changeView.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.getProductsArray = this.getProductsArray.bind(this);
    this.handleOrderSubmit = this.handleOrderSubmit.bind(this);
    this.displayOrderFooter = this.displayOrderFooter.bind(this);
    this.updateProductQuantity = this.updateProductQuantity.bind(this);
    this.changeProductQuantity = this.changeProductQuantity.bind(this);
    this.showRecommendationsView = this.showRecommendationsView.bind(this);
    this.handlePrintProductList = this.handlePrintProductList.bind(this);
    this.displayProductsAndSubmit = this.displayProductsAndSubmit.bind(this);
    this.getProductsMatchingSearch = this.getProductsMatchingSearch.bind(this);
    this.wasProductOrderedPreviously = this.wasProductOrderedPreviously.bind(this);
    this.displayProductsByTypeStandardView = this.displayProductsByTypeStandardView.bind(this);

    this.noControlIsSelected = '0';
    this.isAdmin = isLoggedInUserAdmin();

    this.initProductSelectionState();

    this.state = {
      recommendations: this.props.recommendations,
      // recommendations: [], // do not show recommendations,
      orderView: OrderView.FullView.name,
      productsArray: this.getProductsArray([]),
    };
  }

  componentDidMount() {
    /* Meteor.call('users.visitedPlaceNewOrder', (error) => {
      if (error && Meteor.isDevelopment) {
        Bert.alert(error.reason, 'danger');
      }
    }); */
  }

  getProductsMatchingSearch(searchString, numOfElements) {
    const { products } = this.props;
    const searchResults = [];
    const lowerSearchString = searchString.toLowerCase();

    _.map(products, (product, index) => {
      if (product.name.toLowerCase().indexOf(lowerSearchString) > -1) {
        const prd = this.props.cartState.cart.productsInCart[product._id] ?
           this.props.cartState.cart.productsInCart[product._id] : { ...product, quantity: 0 };

        searchResults.push(
          <Product
            key={`srch-${index}`}
            updateProductQuantity={this.changeProductQuantity}
            product={prd}
            isAdmin={this.isAdmin}
          />,
          );
      }
    });

    return searchResults.slice(0, numOfElements);
  }

  getProductsArray(productsInCart) {
    const productsArray = {};

    this.props.products.forEach((product) => {
      productsArray[product._id] = (productsInCart[product._id]) ?
      productsInCart[product._id] :
      { ...product, quantity: 0 };
    });

    return productsArray;
  }

  initProductSelectionState() {
    switch (true) {
      case (this.props.orderId !== '' && !!this.props.addItemsFromCart): {
        this.props.cartDispatch({ type: cartActions.activateCart, payload: { cartIdToActivate: this.props.orderId } });
        break;
      }
      case (this.props.orderId !== '' && !this.props.addItemsFromCart): {
        const comments = this.props.comments;
        const selectedProducts = {};
        this.props.orderedProducts.forEach((product) => {
          selectedProducts[product._id] = product;
        });
        this.props.cartDispatch({ type: cartActions.setActiveCart, payload: { activeCartId: this.props.orderId, selectedProducts, comments } });
        break;
      }
      default: {
        this.props.cartDispatch({ type: cartActions.activateCart, payload: { cartIdToActivate: 'NEW' } });
      }
    }
  }

  handleCancel(e) {
    e.preventDefault();
    if (confirm('Are you sure about cancelling this Order? This is permanent!')) {
      const order = {
        orderId: this.props.orderId,
        updateToStatus: constants.OrderStatus.Cancelled.name,
      };

      updateMyOrderStatus.call(order, (error) => {
        const confirmation = 'This Order has been cancelled.';
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(confirmation, 'success');
          this.props.history.push('/');
        }
      });
    }
  }

  displayToolBar(orderStatus) {
    return (
      <ButtonToolbar className="pull-right">
        { (orderStatus === constants.OrderStatus.Pending.name || orderStatus === constants.OrderStatus.Saved.name) && (<Button bsSize="small" onClick={this.handleCancel}>Cancel Order</Button>)}
        { (this.isAdmin) && (<Button bsSize="small" onClick={this.handlePrintProductList}>Print Order List</Button>)}
      </ButtonToolbar>
    );
  }

  handlePrintProductList() {
    GenerateOrderList(this.props.products, this.props.dateValue);
  }

  handleOrderSubmit(saveStatus) {
    const commentBox = document.querySelector('[name="comments"]');

    const products = [];

    Object.keys(this.props.cartState.cart.productsInCart).map((key) => {
      products.push(this.props.cartState.cart.productsInCart[key]);
    });

    const order = {
      products,
      _id: this.props.orderId,
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
        this.props.cartDispatch({ type: cartActions.emptyCart });
        this.props.history.push('/');
      }
    });
  }

  changeView(view) {
    this.setState({
      orderView: view,
    });
  }

  changeProductQuantity(event) {
    const productId = event.target.name;
    const quantity = event.target.value;
    this.updateProductQuantity(productId, quantity);
  }

  updateProductQuantity(productId, quantity) {
    const product = this.state.productsArray[productId];
    product.quantity = quantity;

    this.props.cartDispatch({ type: cartActions.updateCart, payload: { product } });
  }

  wasProductOrderedPreviously(productId) {
    const { recommendations } = this.state;
    if (!recommendations.length > 0) {
      return false;
    }

    const prevOrderedProducts = recommendations[0].recPrevOrderedProducts.prevOrderedProducts;

    return (!!prevOrderedProducts[productId]);
  }


  addProductsToTabs(productArray) {
    const prodArr = [];

    productArray.forEach((element, index) => {
      prodArr.push(element);
      if (index % 2 && index !== 0) {
        prodArr.push(<Row />);
      }
    });

    return prodArr;
  }

  displayProductsByTypeStandardView(
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
    isMobile) {
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
            productArray={this.state.products}
            productGroupSelected={this.props.productGroupSelected}
            orderId={this.props.orderId}
            orderStatus={this.props.orderStatus}
            comments={this.props.comments}
            totalBillAmount={this.props.cartState.cart.totalBillAmount}
            dateValue={this.props.dateValue}
            history={this.props.history}
          />)
        }

        {/* }
        { !isMobile && (<Tabs defaultActiveKey={2} id="productTabs" bsStyle="pills">
          { productSpecials.length > 0 && (<Tab eventKey={1} title="Specials" tabClassName="specials_bk text-center">
            { this.addProductsToTabs(productSpecials) }
            </Tab>)
          }
          <Tab eventKey={2} title="Groceries" tabClassName="groceries_bk text-center">
            <Row>
              { this.addProductsToTabs(productGroceries) }
            </Row>
          </Tab>
          <Tab eventKey={3} title="Vegetables & Fruit" tabClassName="vegetables_bk text-center">
            { this.addProductsToTabs(productVegetables) }
          </Tab>
          <Tab eventKey={4} title="Podi, Oil, & Pickles" tabClassName="prepared_bk text-center">
            { this.addProductsToTabs(productBatters) }
          </Tab>
          { productPersonalHygiene.length > 0 && (<Tab eventKey={5} title="Hygiene" tabClassName="pg_bk text-center">
            { this.addProductsToTabs(productPersonalHygiene) }
          </Tab>)}
        </Tabs>)}
        */ }
      </div>
    );
  }

  displayProductsAndSubmit(isMobile, productGroups) {
    return (
     this.props.products.length > 0 ? <Panel>
       <Row>
         <Col xs={12}>
           <ProductSearch
             getProductsMatchingSearch={this.getProductsMatchingSearch}
             ref={productSearchCtrl => (this.productSearchCtrl = productSearchCtrl)}
           />
         </Col>
         <Col xs={12}>
           <ListGroup className="products-list">

             {
               this.displayProductsByTypeStandardView(
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

             {
                // displayProductsByType(this.state.products, isMobile)
             }

           </ListGroup>
         </Col>

         <Col xs={12}>
           {this.displayOrderFooter(isMobile)}
         </Col>
       </Row>
     </Panel>
      :
     <Alert bsStyle="info">
        Every day, List of fresh items available to order is posted after 11 AM. Please wait for the message in the group.
     </Alert>
    );
  }

  displayOrderFooter(isMobile) {
    return (<OrderFooter
      totalBillAmount={this.props.cartState.cart.totalBillAmount}
      onButtonClick={
        () => {
          this.props.history.push(`/cart/${this.props.orderId || ''}`);
        }
      }
      submitButtonName={'Checkout →'}
      onSecondButtonClick={() => { this.handleOrderSubmit(constants.OrderStatus.Saved.name); }}
      isMobile={isMobile}
    />
    );
  }

  showRecommendationsView(recommendedProducts, isMobile) {
    return (<div className="EditOrderDetails ">
      <Row>
        <Col xs={12}>
          <h3 className="page-header">
          Curated for You
          </h3>
          <Panel>
            { this.addProductsToTabs(recommendedProducts) }
            {!!isMobile && (
            <Row>
              <Col xs={12}>
                <Button className="btn-block" onClick={() => { this.changeView(); }}>See Full List</Button>
              </Col>
            </Row>)}
            {!isMobile && (
            <Row>
              <Col sm={4} />
              <Col sm={4}>
                <Button className="btn-block" onClick={() => { this.changeView(); }}>See Full List</Button>
              </Col>
            </Row>
        )}
          </Panel>
        </Col>
      </Row>
      {this.displayOrderFooter()}
    </div>
    );
  }

  render() {
    if (!this.props.cartState.cart) {
      return (<div />);
    }
    // Grouping product categories by tabs
    const ipadWidth = 8000; // 768
    const isMobile = window.innerWidth <= ipadWidth;
    const formHeading = (this.props.orderStatus) ? 'Update Your Order' : ' Place Your Order';

    const productGroups = displayProductsByType(
      {
        products: this.getProductsArray(this.props.cartState.cart.productsInCart),
        isMobile,
        isAdmin: this.isAdmin,
        updateProductQuantity: this.changeProductQuantity,
        wasProductOrderedPreviously: this.wasProductOrderedPreviously,
      },
    );

    switch (this.state.orderView) {
      case OrderView.RecommendedView.name && this.state.recommendations.length > 10: // only if more than 10 products were recommended
        return this.showRecommendationsView(productGroups.productRecommended, isMobile);
      default:
        return (<div className="EditOrderDetails ">
          <Row>
            <Col xs={12}>
              <h3 className="page-header"> { formHeading }
                { this.displayToolBar(this.props.orderStatus) }
              </h3>
              { this.displayProductsAndSubmit(isMobile, productGroups) }
            </Col>
          </Row>
        </div>
        );
    }
  }
}

ProductsOrderMain.defaultProps = {
  recommendations: [],
  orderId: '',
  orderStatus: '',
  comments: '',
  totalBillAmount: 0,
  dateValue: new Date(),
  orderedProducts: [],
  addItemsFromCart: false,
};

ProductsOrderMain.propTypes = {
  products: PropTypes.array.isRequired,
  orderedProducts: PropTypes.array,
  recommendations: PropTypes.array,
  orderId: PropTypes.string,
  orderStatus: PropTypes.string,
  comments: PropTypes.string,
  totalBillAmount: PropTypes.number,
  dateValue: PropTypes.object,
  history: PropTypes.object.isRequired,
  cartDispatch: PropTypes.func.isRequired,
  cartState: PropTypes.object.isRequired,
  addItemsFromCart: PropTypes.bool,
};
