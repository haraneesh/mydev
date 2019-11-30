import React from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { ListGroup, Alert, Row, Col, Panel, Button, ButtonToolbar } from 'react-bootstrap';
import { Tabs, Tab } from 'react-bootstrap';
import $ from 'jquery';
import { Bert } from 'meteor/themeteorchef:bert';
import Product from '../Product';
import { isLoggedInUserAdmin } from '../../../../modules/helpers';
import constants from '../../../../modules/constants';
import ProductSearch from '../ProductSearch/ProductSearch';
import ProductsOrderMobile from '../ProductsOrderMobile/ProductsOrderMobile';
import GenerateOrderList from '../../../../reports/client/GenerateOrderList';
import { upsertOrder, updateMyOrderStatus } from '../../../../api/Orders/methods';
import { OrderFooter, OrderComment } from '../ProductsOrderCommon/ProductsOrderCommon';
import { ReviewOrder } from '../ViewOrderProducts/ViewOrderProducts';

import './ProductsOrderMain.scss';

const OrderView = {
  RecommendedView: {
    name: 'RecommendedView',
  },
  FullView: {
    name: 'FullView',
  },
  CheckOut: {
    name: 'CheckOut',
  },
};

export default class ProductsOrderMain extends React.Component {
  constructor(props, context) {
    super(props, context);
    const productArray = props.products.reduce((map, obj) => {
      map[obj._id] = obj;
      return map;
    }, {});

    const totalBillAmount = (props.totalBillAmount) ? props.totalBillAmount : 0;

    this.noControlIsSelected = '0';

    this.state = {
      products: productArray,
      totalBillAmount,
      recommendations: props.recommendations,
      // recommendations: [], // do not show recommendations,
      orderView: OrderView.RecommendedView.name,
    };

    this.isAdmin = isLoggedInUserAdmin();

    this.changeView = this.changeView.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
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
  }

  componentDidMount() {
    Meteor.call('users.visitedPlaceNewOrder', (error) => {
      if (error && Meteor.isDevelopment) {
        Bert.alert(error.reason, 'danger');
      }
    });
  }

  getSelectedProducts(products, includeRemovedAtCheckout = false) {
    const allProductKeys = Object.keys(products);
    const selectedProducts = [];
    allProductKeys.forEach((key) => {
      const selCondition = (products[key].quantity && products[key].quantity > 0) ||
        (products[key].removedDuringCheckout && includeRemovedAtCheckout);
      if (selCondition) {
        selectedProducts.push(products[key]);
      }
    },
    );
    return selectedProducts;
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

  getProductsMatchingSearch(searchString, numOfElements) {
    const { products } = this.state;
    const searchResults = [];
    const lowerSearchString = searchString.toLowerCase();

    _.map(products, (product, index) => {
      if (product.name.toLowerCase().indexOf(lowerSearchString) > -1) {
        searchResults.push(
          <Product
            key={`srch-${index}`}
            updateProductQuantity={this.changeProductQuantity}
            product={product}
            isAdmin={this.isAdmin}
          />,
          );
      }
    });

    return searchResults.slice(0, numOfElements);
  }


  handleOrderSubmit(saveStatus) {
    const commentBox = document.querySelector('[name="comments"]');
    const order = {
      products: this.getSelectedProducts(this.state.products),
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
    const productsCopy = this.state.products;

    productsCopy[productId].quantity = parseFloat((quantity) || 0);
    productsCopy[productId].removedDuringCheckout = false;

    if (this.state.orderView === OrderView.CheckOut.name && productsCopy[productId].quantity === 0) {
      productsCopy[productId].removedDuringCheckout = true;
    }

    let totalBillAmount = 0;
    // for (const key in productsCopy) {
    Object.keys(productsCopy).forEach((key) => {
      const qty = productsCopy[key].quantity ? productsCopy[key].quantity : 0;
      totalBillAmount += qty * productsCopy[key].unitprice;
    });

    this.setState({
      products: Object.assign({}, productsCopy),
      totalBillAmount,
    });
  }

  wasProductOrderedPreviously(productId) {
    const { recommendations } = this.state;
    if (!recommendations.length > 0) {
      return false;
    }

    const prevOrderedProducts = recommendations[0].recPrevOrderedProducts.prevOrderedProducts;

    return (!!prevOrderedProducts[productId]);
  }

  displayProductsByType(products, isMobile) {
   // Grouping product categories by tabs
    const productGroceries = [];
    const productVegetables = [];
    const productBatters = [];
    const productPersonalHygiene = [];
    const productSpecials = [];
    const productRecommended = [];

    // let previousCategory = "Others";

    _.map(products, (product, index) => {
      if (this.wasProductOrderedPreviously(product._id)) {
        productRecommended.push(
          <Product isMobile={isMobile} key={`recommended-${index}`} updateProductQuantity={this.changeProductQuantity} product={product} isAdmin={this.isAdmin} />,
        );
      }

      if (product.displayAsSpecial) {
        productSpecials.push(
          <Product isMobile={isMobile} key={`special-${index}`} updateProductQuantity={this.changeProductQuantity} product={product} isAdmin={this.isAdmin} />,
        );
      }

      let tempProductList = [];
      let tempKey = '';

      switch (true) {
        /* case (!!product.displayAsSpecial): // Special
          tempProductList = productSpecials;
          tempKey = `special-${index}`;
          break; */
        case (constants.ProductType[0] === product.type): // Vegetables
          tempProductList = productVegetables;
          tempKey = `vegetable-${index}`;
          break;
        case (constants.ProductType[1] === product.type): // Groceries
          tempProductList = productGroceries;
          tempKey = `grocery-${index}`;
          break;
        case (constants.ProductType[2] === product.type): // Batters
          tempProductList = productBatters;
          tempKey = `batter-${index}`;
          break;
        case (constants.ProductType[3] === product.type): // Personal Hygiene
          tempProductList = productPersonalHygiene;
          tempKey = `pg-${index}`;
          break;
        default:
          break;
      }
      /*
      if (!!product.category && (previousCategory != product.category)){
        tempProductList.push(<h2 className="productCategoryHeading">{product.category}</h2>);
        previousCategory = product.category;
      } */
      tempProductList.push(
        <Product isMobile={isMobile} key={tempKey} updateProductQuantity={this.changeProductQuantity} product={product} isAdmin={this.isAdmin} />,
      );
    });

    return {
      productGroceries,
      productVegetables,
      productBatters,
      productPersonalHygiene,
      productSpecials,
      productRecommended,
      isMobile };
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
    productGroceries,
    productVegetables,
    productBatters,
    productPersonalHygiene,
    productSpecials,
    productRecommended,
    isMobile) {
    const productGroups = [
      productGroceries,
      productVegetables,
      productBatters,
      productPersonalHygiene,
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
            totalBillAmount={this.props.totalBillAmount}
            dateValue={this.props.dateValue}
            history={this.props.history}
          />)
        }

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

      </div>
    );
  }

  displayProductsAndSubmit(isMobile, productGroups) {
    return (
     this.props.products.length > 0 ? <Panel>
       <Row>
         <ProductSearch
           getProductsMatchingSearch={this.getProductsMatchingSearch}
           ref={productSearchCtrl => (this.productSearchCtrl = productSearchCtrl)}
         />
         <Col xs={12}>
           <ListGroup className="products-list">

             {
               this.displayProductsByTypeStandardView(
                productGroups.productGroceries,
                productGroups.productVegetables,
                productGroups.productBatters,
                productGroups.productPersonalHygiene,
                productGroups.productSpecials,
                // productGroups.productRecommended,
                [],
                isMobile)}

             {
                // this.displayProductsByType(this.state.products, isMobile)
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
    const reviewOrderButton = 'Checkout →';
    return (<OrderFooter
      totalBillAmount={this.state.totalBillAmount}
      onButtonClick={() => { this.changeView(OrderView.CheckOut.name); }}
      submitButtonName={reviewOrderButton}
      onSecondButtonClick={() => { this.handleOrderSubmit(constants.OrderStatus.Saved.name); }}
      isMainProductListPage
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
    // Grouping product categories by tabs
    const ipadWidth = 768;
    const isMobile = window.innerWidth <= ipadWidth;
    const formHeading = (this.props.orderStatus) ? 'Update Your Order' : ' Place Your Order';
    const submitButtonName = (this.props.orderStatus) ? 'Place Order' : ' Place Order';
    const productGroups = this.displayProductsByType(this.state.products, isMobile);

    switch (this.state.orderView) {
      case OrderView.CheckOut.name:
        return (<Row>
          <Col xs={12}>
            <h3 className="page-header">Review Order</h3>
          </Col>
          <Col xs={12}>
            <Panel>
              <ReviewOrder products={this.getSelectedProducts(this.state.products, true)} updateProductQuantity={this.changeProductQuantity} isMobile={isMobile} isAdmin={this.isAdmin} />
              <Row>
                <Col xs={12} className="text-right">
                  <Button style={{ marginBottom: '2.5em' }} onClick={() => { this.changeView(OrderView.FullView.name); }}>Add Items</Button>
                </Col>
              </Row>
              <OrderComment comments={this.props.comments} />
              <OrderFooter
                totalBillAmount={this.state.totalBillAmount}
                onButtonClick={this.handleOrderSubmit}
                submitButtonName={submitButtonName}
              />
            </Panel>
          </Col>
        </Row>);
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
};

ProductsOrderMain.propTypes = {
  products: PropTypes.array.isRequired,
  recommendations: PropTypes.array,
  orderId: PropTypes.string,
  orderStatus: PropTypes.string,
  comments: PropTypes.string,
  totalBillAmount: PropTypes.number,
  dateValue: PropTypes.object,
  history: PropTypes.object.isRequired,
};
