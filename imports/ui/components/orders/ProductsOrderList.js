import React from 'react';
import { formatMoney } from 'accounting-js';
import PropTypes from 'prop-types';
import { ListGroup, Alert, Row, Col, Panel, Button, ButtonToolbar } from 'react-bootstrap';
import { ListGroupItem, FormControl, Tabs, Tab } from 'react-bootstrap';
import Product from './Product';
import { upsertOrder, updateMyOrderStatus } from '../../../api/Orders/methods';
import { accountSettings } from '../../../modules/settings';
import { isLoggedInUserAdmin } from '../../../modules/helpers';
import constants from '../../../modules/constants';

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
        <h4 className="product-name">
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

    this.state = {
      products: productArray,
      total_bill_amount,
    };

    this.updateProductQuantity = this.updateProductQuantity.bind(this);
    this.handleOrderSubmit = this.handleOrderSubmit.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.displayProductsAndSubmit = this.displayProductsAndSubmit.bind(this);
  }

  updateProductQuantity(event) {
    const productId = event.target.name;
    const quantity = event.target.value;
    const products_copy = this.state.products;

    products_copy[productId].quantity = parseFloat((quantity) || 0);

    let total_bill_amount = 0;
    for (const key in products_copy) {
      const quantity = products_copy[key].quantity ? products_copy[key].quantity : 0;
      total_bill_amount += quantity * products_copy[key].unitprice;
    }

    this.setState({
      products: Object.assign({}, products_copy),
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

      updateMyOrderStatus.call(order, (error, response) => {
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

  displayCancelOrderButton(orderStatus) {
    if (orderStatus == constants.OrderStatus.Pending.name) {
      return (<ButtonToolbar className="pull-right">
        <Button bsSize="small" onClick={this.handleCancel}>Cancel Order</Button>
      </ButtonToolbar>
      );
    }
  }

  displayProductsByType(products) {
   // Grouping product categories by tabs
    const productGroceries = [];
    const productVegetables = [];
    const productBatters = [];

    const isAdmin = isLoggedInUserAdmin();

    products.map((product, index) => {
      switch (product.type) {
        case constants.ProductType[0]: // Vegetables
          productVegetables.push(
            <Product key={`vegetable-${index}`} updateProductQuantity={this.updateProductQuantity} product={product} isAdmin={isAdmin} />,
          );
          break;
        case constants.ProductType[1]: // Groceries
          productGroceries.push(
            <Product key={`grocery-${index}`} updateProductQuantity={this.updateProductQuantity} product={product} isAdmin={isAdmin} />,
          );
          break;
        case constants.ProductType[2]: // Batters
          productBatters.push(
            <Product key={`batter-${index}`} updateProductQuantity={this.updateProductQuantity} product={product} isAdmin={isAdmin} />,
          );
          break;
        default:
          break;
      }
    });

    return (
      <Tabs defaultActiveKey={1} id="productTabs" bsStyle="pills">
        <Tab eventKey={1} title="Vegetables" tabClassName="vegetables_bk">
          { productVegetables }
        </Tab>
        <Tab eventKey={2} title="Groceries" tabClassName="groceries_bk">
          { productGroceries }
        </Tab>
        <Tab eventKey={3} title="Batters" tabClassName="batters_bk">
          { productBatters }

        </Tab>
      </Tabs>
    );
  }

  displayProductsAndSubmit(submitButtonName) {
   // Grouping product categories by tabs
    return (
     this.props.products.length > 0 ? <Panel>
       <Row>
         <Col xs={12}>
           <ListGroup className="products-list">
             { this.displayProductsByType(this.props.products) }
             <OrderComment comments={this.props.comments} />
             <OrderFooter
               total_bill_amount={this.state.total_bill_amount}
               onButtonClick={this.handleOrderSubmit}
               submitButtonName={submitButtonName}
             />
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
              { this.displayCancelOrderButton(this.props.order_status) }
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
  history: PropTypes.object.isRequired,
};
