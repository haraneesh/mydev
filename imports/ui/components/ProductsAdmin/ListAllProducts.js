import PropTypes from 'prop-types';
import React from 'react';
import Datetime from 'react-datetime';
import { toast } from 'react-toastify';
import 'react-datetime/css/react-datetime.css';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import constants from '/imports/modules/constants';
import { upsertProductList } from '../../../api/ProductLists/methods';
import Product, { ProductTableHeader } from './Product';

const NewTab = 'New';

const createProductRows = ({ products, returnableProducts }) => {
  const productRows = [];
  productRows[NewTab] = [];

  let sectionHeaderName = '';
  products.map((product, index) => {
    if (product.type !== sectionHeaderName) {
      sectionHeaderName = product.type;
      if (!(sectionHeaderName in productRows)) {
        productRows[sectionHeaderName] = [];
      }
      productRows[sectionHeaderName].push(<ProductTableHeader />);
    }
    productRows[sectionHeaderName].push(
      <Product
        prodId={product._id}
        product={product}
        returnableProducts={returnableProducts}
        productIndex={index}
        key={`product-${index}`}
      />,
    );
  });
  return productRows;
};

const createReturnableProductsArray = (products) => {
  const returnableProducts = [];
  // return all products in category returnables
  products.map((product, index) => {
    if (product.type == constants.ReturnProductType.name) {
      returnableProducts.push({ _id: product._id, name: product.name });
    }
  });

  return returnableProducts;
};

class ListAllProducts extends React.Component {
  constructor(props, context) {
    super(props, context);

    const returnableProducts = createReturnableProductsArray(props.products);
    this.state = {
      activeStartDate: null,
      activeEndDate: null,
      showEndDateError: false,
      productRows: createProductRows({
        products: props.products,
        returnableProducts,
      }),
      selectedHeaderKey: 1,
      isPublishingProductList: false,
    };

    this.publishProductList = this.publishProductList.bind(this);
    this.checkValidStartDate = this.checkValidStartDate.bind(this);
    this.checkValidEndDate = this.checkValidEndDate.bind(this);
    this.tabOnClick = this.tabOnClick.bind(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const returnableProducts = createReturnableProductsArray(
      nextProps.products,
    );
    const productRows = createProductRows({
      products: nextProps.products,
      returnableProducts,
    });
    if (productRows !== prevState.productRows) {
      return { productRows };
    }
    return null;
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  checkValidStartDate(current) {
    this.setState({
      activeStartDate: current,
      showEndDateError: current.isAfter(this.state.activeEndDate),
    });
  }

  checkValidEndDate(current) {
    const isEndDateAfterCurrent =
      this.state.activeStartDate && current.isAfter(this.state.activeStartDate);
    this.setState({
      activeEndDate: isEndDateAfterCurrent ? current : null,
      showEndDateError: !isEndDateAfterCurrent,
    });
  }

  publishProductList() {
    if (this.state.showEndDateError) {
      toast.error(
        'Your dates are not quiet right, do correct them and publish',
      );
      return;
    }

    const params = {
      activeStartDateTime: new Date(this.state.activeStartDate),
      activeEndDateTime: new Date(this.state.activeEndDate),
      _id: this.props.productListId,
    };

    this.setState({
      isPublishingProductList: true,
    });

    upsertProductList.call(params, (error) => {
      if (error) {
        if (error.error === 'invocation-failed') {
          toast.success(
            'Update is running in the background. Product List will be updated.',
          );
        } else {
          toast.error(error.reason || error.message);
        }
      } else {
        const successMsg = params._id
          ? 'ProductList has been updated!'
          : 'ProductList has been created!';
        toast.success(successMsg);
      }
      this.setState({ isPublishingProductList: false });
    });
  }

  publishSection() {
    const { showEndDateError, isPublishingProductList } = this.state;
    return (
      <Card className="p-2 m-2">
        <h3> Publish Product List for Users to order </h3>
        <p className="text-info">
          Select dates during which this product list will be available for the
          users to order
        </p>
        <Row>
          <Col xs={6}>
            <label> Active start date </label>
          </Col>
          <Col xs={6}>
            <Datetime
              closeOnSelect
              isValidDate={this.checkIsValidDate}
              onChange={this.checkValidStartDate}
            />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <label> Active end date </label>
          </Col>
          <Col xs={6}>
            <Datetime
              closeOnSelect
              isValidDate={this.checkIsValidDate}
              onChange={this.checkValidEndDate}
            />
            {showEndDateError && (
              <Alert variant="danger">
                End date and time should be greater than start date.
              </Alert>
            )}
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="text-end mt-2">
            {!isPublishingProductList && (
              <Button
                variant="secondary"
                onClick={() => {
                  this.publishProductList();
                }}
              >
                Publish Product List
              </Button>
            )}
            {!!isPublishingProductList && (
              <Button variant="secondary" disabled>
                Product List is being Published ...
              </Button>
            )}
          </Col>
        </Row>
      </Card>
    );
  }

  tabOnClick(selectedHeaderKey) {
    this.setState({ selectedHeaderKey });
  }

  render() {
    let sectionCount = 0;
    const productsDisplay = [];
    const { productRows } = this.state;
    const productKeys = Object.keys(productRows);
    const { selectedHeaderKey } = this.state;

    return productKeys.length > 0 ? (
      <ListGroup className="product-list">
        {productKeys.forEach((key) => {
          sectionCount += 1;
          productsDisplay.push(
            <Tab eventKey={sectionCount} title={key} className="text-start">
              {/* (sectionCount === selectedHeaderKey) && productRows[key] */}
              {productRows[key]}
            </Tab>,
          );
        })}

        <Tabs
          id="adminProductList"
          // activeKey={selectedHeaderKey}
          // onSelect={this.tabOnClick}
        >
          {productsDisplay}
        </Tabs>

        <hr />
        {this.publishSection()}
      </ListGroup>
    ) : (
      <Alert variant="info">
        The product list is empty. You can add products by typing in the name of
        the product in the above box.
      </Alert>
    );
  }
}

ListAllProducts.propTypes = {
  products: PropTypes.array.isRequired,
  suppliers: PropTypes.array.isRequired,
  productListId: PropTypes.string.isRequired,
};

export default ListAllProducts;
