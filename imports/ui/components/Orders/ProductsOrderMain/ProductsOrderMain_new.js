import React from 'react';
import {Meteor} from 'meteor/meteor';
import PropTypes from 'prop-types';
import ScrollTrigger from 'react-scroll-trigger';
import { ListGroup, Alert, Row, Col, Panel, Button, ButtonToolbar } from 'react-bootstrap';
import { Tabs, Tab, PanelGroup } from 'react-bootstrap';
import $ from 'jquery';
import { Bert } from 'meteor/themeteorchef:bert';
import Product from '../Product';
import { isLoggedInUserAdmin } from '../../../../modules/helpers';
import constants from '../../../../modules/constants';
import ProductSearch from '../ProductSearch/ProductSearch';
import GenerateOrderList from '../../../../reports/client/GenerateOrderList';
import { upsertOrder, updateMyOrderStatus } from '../../../../api/Orders/methods';
import { OrderFooter, DisplayCategoryHeader, OrderComment } from '../ProductsOrderCommon/ProductsOrderCommon';

import './ProductsOrderMain.scss';

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
      //activePanel: (props.recommendations.length > 0) ? '1' : '3',
      activePanel: '3', // make groceries open by default
      //recommendations: props.recommendations,
      recommendations: [], // do not show recommendations
    };

    this.isAdmin = isLoggedInUserAdmin();

    this.updateProductQuantity = this.updateProductQuantity.bind(this);
    this.handleOrderSubmit = this.handleOrderSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handlePrintProductList = this.handlePrintProductList.bind(this);
    this.handlePanelSelect = this.handlePanelSelect.bind(this);
    this.displayProductsAndSubmit = this.displayProductsAndSubmit.bind(this);
    this.getProductsMatchingSearch = this.getProductsMatchingSearch.bind(this);
    this.wasProductOrderedPreviously = this.wasProductOrderedPreviously.bind(this);
    this.displayProductsByTypeStandardView = this.displayProductsByTypeStandardView.bind(this);
  }

  componentDidMount() {
    Meteor.call('users.visitedPlaceNewOrder',(error) => {
      if (error && Meteor.isDevelopment) {
        Bert.alert(error.reason, 'danger');
      } 
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.activePanel !== this.noControlIsSelected && prevState.activePanel !== this.state.activePanel) {
      const elem = $('#accordion .in')[0];
      if (elem && elem.offsetTop) {
        window.scrollTo(elem.offsetTop, 0);
       // $('html, body').animate({ scrollTop: elem.offsetTop }, 250);
      }
      // window.scrollTo(elem.offsetTop, 0);
    }
  }

  handleOrderSubmit() {
    const products = [];
    for (const key in this.state.products) {
      if (this.state.products[key].quantity && this.state.products[key].quantity > 0) {
        products.push(this.state.products[key]);
      }
    }

    const order = {
      products,
      _id: this.props.orderId,
      order_status: constants.OrderStatus.Pending.name,
          // totalBillAmount: this.state.totalBillAmount,
      comments: document.querySelector('[name="comments"]').value,
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
        { (orderStatus === constants.OrderStatus.Pending.name) && (<Button bsSize="small" onClick={this.handleCancel}>Cancel Order</Button>)}
        { (this.isAdmin) && (<Button bsSize="small" onClick={this.handlePrintProductList}>Print Order List</Button>)}
      </ButtonToolbar>
    );
  }

  handlePrintProductList() {
    GenerateOrderList(this.props.products, this.props.dateValue);
  }

  handlePanelSelect(activePanel) {
    this.setState({
      activePanel: (activePanel === this.state.activePanel) ? this.noControlIsSelected : activePanel,
    });

    if (activePanel !== this.noControlIsSelected) {
      this.productSearchCtrl.clear();
    }
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
            updateProductQuantity={this.updateProductQuantity}
            product={product}
            isAdmin={this.isAdmin}
          />,
          );
      }
    });

    return searchResults.slice(0, numOfElements);
  }


  updateProductQuantity(event) {
    const productId = event.target.name;
    const quantity = event.target.value;
    const productsCopy = this.state.products;

    productsCopy[productId].quantity = parseFloat((quantity) || 0);

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

    //let previousCategory = "Others";

    _.map(products, (product, index) => {
      if (this.wasProductOrderedPreviously(product._id)) {
        productRecommended.push(
          <Product key={`recommended-${index}`} updateProductQuantity={this.updateProductQuantity} product={product} isAdmin={this.isAdmin} />,
        );
      }

      if (!!product.displayAsSpecial) {
        productSpecials.push(
          <Product key={`special-${index}`} updateProductQuantity={this.updateProductQuantity} product={product} isAdmin={this.isAdmin} />,
        );
      }

      let tempProductList = [];
      let tempKey = "";

      switch (true) {
        /*case (!!product.displayAsSpecial): // Special
          tempProductList = productSpecials;
          tempKey = `special-${index}`;
          break;*/
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
        <Product key={tempKey} updateProductQuantity={this.updateProductQuantity} product={product} isAdmin={this.isAdmin} />,
      );
       
    });

    if (this.props.dateValue.getDay() === 2 /*Tuesday*/ || this.props.dateValue.getDay() === 4 /*Thursday*/) {
      return this.displayProductsByTypeExperimentalView( 
        productGroceries, 
        productVegetables, 
        productBatters, 
        productPersonalHygiene, 
        productSpecials, 
        productRecommended,
        isMobile);
    }
    return this.displayProductsByTypeStandardView(
      productGroceries, 
      productVegetables, 
      productBatters, 
      productPersonalHygiene, 
      productSpecials, 
      productRecommended,
      isMobile);
    
  }

  displayProductsByTypeExperimentalView(productGroceries, 
    productVegetables, 
    productBatters, 
    productPersonalHygiene, 
    productSpecials, 
    productRecommended,
    isMobile){
      return(
      <div className="productOrderList">
        <Row className="stickyHeader">
          <Col xs={3}><a href="#s">Special</a></Col>
          <Col xs={3}><a href="#g">Groceries</a></Col>
          <Col xs={3}><a href="#v">Vegetables</a></Col>
          <Col xs={3}><a href="#h">Hygiene</a></Col>
        </Row>
        <Row>
        <Col xs={12}>
        <Row>
          <h2 id="s" className="productCategoryHeading">Special</h2>
          {productSpecials}
        </Row>
        <Row>
          <h2 id="g" className="productCategoryHeading">Groceries</h2>
          {productGroceries}
        </Row>
        <Row>
          <h2 id="v" className="productCategoryHeading">Vegetables</h2>
          {productVegetables}
        </Row>
        <Row>
          <h2 id="h" className="productCategoryHeading">Hygiene</h2>
          {productPersonalHygiene}
        </Row>
        </Col>
        </Row>
      </div>
      );
    }

  displayProductsByTypeStandardView(
    productGroceries, 
    productVegetables, 
    productBatters, 
    productPersonalHygiene, 
    productSpecials, 
    productRecommended,
    isMobile){
    return (
      <div className="productOrderList">
        { isMobile && (<PanelGroup activeKey={this.state.activePanel} id="accordion" accordion>
          {this.state.recommendations.length > 0 && (<Panel
            header={(<DisplayCategoryHeader
              clName="recommended_bk_ph"
              title="My Favourites"
              onclick={() => this.handlePanelSelect('1')}
              isOpen={this.state.activePanel === '1'}
            />)}
            eventKey="1"
          >
            { productRecommended }
          </Panel>)
          }

          {productSpecials.length > 0 && (<Panel
            header={(<DisplayCategoryHeader
              clName="specials_bk_ph"
              title="Specials"
              onclick={() => this.handlePanelSelect('2')}
              isOpen={this.state.activePanel === '2'}
            />)}
            eventKey="2"
          >
              { productSpecials }</Panel>)
          }
          <Panel header={(<DisplayCategoryHeader clName="groceries_bk_ph" title="Groceries" onclick={() => this.handlePanelSelect('3')} isOpen={this.state.activePanel === '3'} />)} eventKey="3">{ productGroceries }</Panel>
          <Panel header={(<DisplayCategoryHeader clName="vegetables_bk_ph" title="Vegetables & Fruit" onclick={() => this.handlePanelSelect('4')} isOpen={this.state.activePanel === '4'} />)} eventKey="4">{ productVegetables }</Panel>
          <Panel header={(<DisplayCategoryHeader clName="prepared_bk_ph" title="Ready Mixes, Oil, Batter & Pickles" onclick={() => this.handlePanelSelect('5')} isOpen={this.state.activePanel === '5'} />)} eventKey="5">{ productBatters }</Panel>
          {productPersonalHygiene.length > 0 && (<Panel 
            header={(<DisplayCategoryHeader clName="pg_bk_ph" 
            title="Personal & General Hygiene" onclick={() => this.handlePanelSelect('6')} 
          isOpen={this.state.activePanel === '6'} />)} eventKey="6">{ productPersonalHygiene }</Panel>)}
        </PanelGroup>)}


        { !isMobile && (<Tabs defaultActiveKey={3} id="productTabs" bsStyle="pills">
          {this.state.recommendations.length > 0 && (<Tab eventKey={1} title="My Favourites" tabClassName="recommended_bk text-center">
            { productRecommended }
          </Tab>)
          }
          { productSpecials.length > 0 && (<Tab eventKey={2} title="Specials" tabClassName="specials_bk text-center">
            { productSpecials }
          </Tab>)
          }
          <Tab eventKey={3} title="Groceries" tabClassName="groceries_bk text-center">
            { productGroceries }
          </Tab>
          <Tab eventKey={4} title="Vegetables & Fruit" tabClassName="vegetables_bk text-center">
            { productVegetables }
          </Tab>
          <Tab eventKey={5} title="Mixes, Oil, & Pickles" tabClassName="prepared_bk text-center">
            { productBatters }
          </Tab>
          { productPersonalHygiene.length > 0 && (<Tab eventKey={6} title="Hygiene" tabClassName="pg_bk text-center">
            { productPersonalHygiene }
          </Tab>)}
        </Tabs>)}

      </div>
    );
  }

  displayProductsAndSubmit(submitButtonName) {
   // Grouping product categories by tabs
    const ipadWidth = 768;
    const isMobile = window.innerWidth <= ipadWidth;
    return (
     this.props.products.length > 0 ? <Panel>
       <Row>
         <ProductSearch
           getProductsMatchingSearch={this.getProductsMatchingSearch}
           onFocus={() => this.handlePanelSelect(this.noControlIsSelected)}
           ref={productSearchCtrl => (this.productSearchCtrl = productSearchCtrl)}
         />
         <Col xs={12}>
           <ListGroup className="products-list">

             { this.displayProductsByType(this.state.products, isMobile) }
             <Row>
               <OrderComment comments={this.props.comments} />
               <OrderFooter
                 totalBillAmount={this.state.totalBillAmount}
                 onButtonClick={this.handleOrderSubmit}
                 submitButtonName={submitButtonName}
               />
             </Row>
           </ListGroup>
         </Col>
       </Row>
     </Panel>
      :
     <Alert bsStyle="info">
        Every day, List of fresh items available to order is posted after 11 AM. Please wait for the message in the group.
     </Alert>
    );
  }

  render() {
    const formHeading = (this.props.orderStatus) ? 'Update Your Order' : ' Place Your Order';
    const submitButtonName = (this.props.orderStatus) ? 'Update Order' : ' Place Order';
    return (
      <div className="EditOrderDetails ">
        <Row>
          <Col xs={12}>
            <h3 className="page-header"> { formHeading }
              { this.displayToolBar(this.props.orderStatus) }
            </h3>
            { this.displayProductsAndSubmit(submitButtonName) }
          </Col>
        </Row>
      </div>
    );
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
