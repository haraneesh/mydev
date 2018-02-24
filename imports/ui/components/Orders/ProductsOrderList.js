import React from 'react';
import { formatMoney } from 'accounting-js';
import PropTypes from 'prop-types';
import { ListGroup, Alert, Row, Col, Panel, Button, ButtonToolbar } from 'react-bootstrap';
import { ListGroupItem, FormControl, Tabs, Tab, PanelGroup, Glyphicon } from 'react-bootstrap';
import $ from 'jquery';
import Product from './Product';
import { accountSettings } from '../../../modules/settings';
import { isLoggedInUserAdmin } from '../../../modules/helpers';
import constants from '../../../modules/constants';
import ProductSearch from './ProductSearch/ProductSearch';
import GenerateOrderList from '../../../reports/client/GenerateOrderList';
import { upsertOrder, updateMyOrderStatus } from '../../../api/Orders/methods';

import './ProductOrderList.scss';

const DisplayCategoryHeader = ({ clName, title, onclick, isOpen }) => (
  <Row onClick={onclick} className="productCatHead">
    <Col xs={3} className={`productCat_${clName}`} />
    <Col xs={8} className="prodCatTitle"> <p style={{ marginBottom: '0px' }}> <span style={{ verticalAlign: 'middle' }}> {title} </span> </p> </Col>
    <Col xs={1} className="prodCatPlus"> <small> <Glyphicon glyph={isOpen ? 'minus' : 'plus'} /> </small> </Col>
  </Row>
);


const OrderFooter = ({ total_bill_amount, onButtonClick, submitButtonName }) => (
  <ListGroupItem>
    <Row>
      <Col sm={9}>
        <h4 className="text-right-not-xs">Total <strong>{
                formatMoney(total_bill_amount, accountSettings)
              }</strong></h4>
      </Col>
      <Col sm={3}>
        <div className="text-right-not-xs">
          <Button bsStyle="primary" disabled={total_bill_amount <= 0} onClick={onButtonClick}>
            { submitButtonName }
          </Button>
        </div>
      </Col>
    </Row>
  </ListGroupItem>
);

const OrderComment = ({ comments }) => (
  <ListGroupItem>
    <Row>
      <Col sm={3}>
        <h4 className="noMarginNoPadding">
          <strong> Comments </strong>
        </h4>
      </Col>
      <Col sm={9}>
        <FormControl
          name="comments"
          componentClass="textarea"
          placeholder="Is there anything that you would like to tell us about this order?"
          defaultValue={comments}
        />
      </Col>
    </Row>
  </ListGroupItem>
);

export default class ProductsOrderList extends React.Component {
  constructor(props, context) {
    super(props, context);
    const productArray = props.products.reduce((map, obj) => {
      map[obj._id] = obj;
      return map;
    }, {});

    const total_bill_amount = (props.total_bill_amount) ? props.total_bill_amount : 0;

    this.noControlIsSelected = '0';

    this.state = {
      products: productArray,
      total_bill_amount,
      activePanel: this.noControlIsSelected,
    };

    this.isAdmin = isLoggedInUserAdmin();

    this.updateProductQuantity = this.updateProductQuantity.bind(this);
    this.handleOrderSubmit = this.handleOrderSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handlePrintProductList = this.handlePrintProductList.bind(this);
    this.handlePanelSelect = this.handlePanelSelect.bind(this);
    this.displayProductsAndSubmit = this.displayProductsAndSubmit.bind(this);
    this.getProductsMatchingSearch = this.getProductsMatchingSearch.bind(this);
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

  updateProductQuantity(event) {
    const productId = event.target.name;
    const quantity = event.target.value;
    const productsCopy = this.state.products;

    productsCopy[productId].quantity = parseFloat((quantity) || 0);

    let total_bill_amount = 0;
    for (const key in productsCopy) {
      const quantity = productsCopy[key].quantity ? productsCopy[key].quantity : 0;
      total_bill_amount += quantity * productsCopy[key].unitprice;
    }

    this.setState({
      products: Object.assign({}, productsCopy),
      total_bill_amount,
    });
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
          // total_bill_amount: this.state.total_bill_amount,
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

  displayProductsByType(products, isMobile) {
   // Grouping product categories by tabs
    const productGroceries = [];
    const productVegetables = [];
    const productBatters = [];
    const productPersonalHygiene = [];

    _.map(products, (product, index) => {
      switch (product.type) {
        case constants.ProductType[0]: // Vegetables
          productVegetables.push(
            <Product key={`vegetable-${index}`} updateProductQuantity={this.updateProductQuantity} product={product} isAdmin={this.isAdmin} />,
          );
          break;
        case constants.ProductType[1]: // Groceries
          productGroceries.push(
            <Product key={`grocery-${index}`} updateProductQuantity={this.updateProductQuantity} product={product} isAdmin={this.isAdmin} />,
          );
          break;
        case constants.ProductType[2]: // Batters
          productBatters.push(
            <Product key={`batter-${index}`} updateProductQuantity={this.updateProductQuantity} product={product} isAdmin={this.isAdmin} />,
          );
          break;
        case constants.ProductType[3]: // Personal Hygiene
          productPersonalHygiene.push(
            <Product key={`pg-${index}`} updateProductQuantity={this.updateProductQuantity} product={product} isAdmin={this.isAdmin} />,
          );
          break;
        default:
          break;
      }
    });

    return (
      <div className="productOrderList">
        <h4>
          <strong> Pick from Lists </strong>
        </h4>

        { isMobile && (<PanelGroup activeKey={this.state.activePanel} id="accordion" accordion>
          <Panel header={(<DisplayCategoryHeader clName="vegetables_bk_ph" title="Vegetables & Fruit" onclick={() => this.handlePanelSelect('1')} isOpen={this.state.activePanel === '1'} />)} eventKey="1">{ productVegetables }</Panel>
          <Panel header={(<DisplayCategoryHeader clName="groceries_bk_ph" title="Groceries" onclick={() => this.handlePanelSelect('2')} isOpen={this.state.activePanel === '2'} />)} eventKey="2">{ productGroceries }</Panel>
          <Panel header={(<DisplayCategoryHeader clName="prepared_bk_ph" title="Oil, Batter & Pickles" onclick={() => this.handlePanelSelect('3')} isOpen={this.state.activePanel === '3'} />)} eventKey="3">{ productBatters }</Panel>
          <Panel header={(<DisplayCategoryHeader clName="pg_bk_ph" title="Personal & General Hygiene" onclick={() => this.handlePanelSelect('4')} isOpen={this.state.activePanel === '4'} />)} eventKey="4">{ productPersonalHygiene }</Panel>
        </PanelGroup>) }


        { !isMobile && (<Tabs defaultActiveKey={1} id="productTabs" bsStyle="pills">
          <Tab eventKey={1} title="Vegetables & Fruit" tabClassName="vegetables_bk text-center">
            { productVegetables }
          </Tab>
          <Tab eventKey={2} title="Groceries" tabClassName="groceries_bk text-center">
            { productGroceries }
          </Tab>
          <Tab eventKey={3} title="Oil, Batter & Pickles" tabClassName="prepared_bk text-center">
            { productBatters }
          </Tab>
          <Tab eventKey={4} title="Hygiene" tabClassName="pg_bk text-center">
            { productPersonalHygiene }
          </Tab>
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
                 total_bill_amount={this.state.total_bill_amount}
                 onButtonClick={this.handleOrderSubmit}
                 submitButtonName={submitButtonName}
               />
             </Row>
           </ListGroup>
         </Col>
       </Row>
     </Panel>
      :
     <Alert bsStyle="info">We do not have any products for you to order today. Please check back tomorrow.</Alert>
    );
  }

  render() {
    const formHeading = (this.props.order_status) ? 'Update Your Order' : ' Place Your Order';
    const submitButtonName = (this.props.order_status) ? 'Update Order' : ' Place Order';
    return (
      <div className="EditOrderDetails ">
        <Row>
          <Col xs={12}>
            <h3 className="page-header"> { formHeading }
              { this.displayToolBar(this.props.order_status) }
            </h3>
            { this.displayProductsAndSubmit(submitButtonName) }
          </Col>
        </Row>
      </div>
    );
  }
}

ProductsOrderList.propTypes = {
  products: PropTypes.array.isRequired,
  orderId: PropTypes.string,
  order_status: PropTypes.string,
  comments: PropTypes.string,
  total_bill_amount: PropTypes.number,
  dateValue: PropTypes.object,
  history: PropTypes.object.isRequired,
};
