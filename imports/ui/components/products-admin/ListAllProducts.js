import React from 'react';
import PropTypes from 'prop-types';
import { Bert } from 'meteor/themeteorchef:bert';
import Datetime from 'react-datetime';
import moment from 'moment';
import 'moment-timezone';
import Product from './product';
import { ListGroup, Alert, Button, Col, Row, ListGroupItem, ControlLabel, HelpBlock } from 'react-bootstrap';
import { dateSettings } from '../../../modules/settings';
import { upsertProductList } from '../../../api/productLists/methods';

class ListAllProducts extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {
      activeStartDate: null,
      activeEndDate: null,
      showEndDateError: false,
    };

    this.productListId = this.props.productListId;

    this.publishProductList = this.publishProductList.bind(this);
    this.checkValidStartDate = this.checkValidStartDate.bind(this);
    this.checkValidEndDate = this.checkValidEndDate.bind(this);
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

  publishProductList() {
    if (this.state.showEndDateError) {
      Bert.alert('Your dates are not quiet right, do correct them and publish', 'danger');
      return;
    }

    const params = {
      activeStartDateTime: new Date(this.state.activeStartDate),
      activeEndDateTime: new Date(this.state.activeEndDate),
      _id: this.productListId,
    };

    upsertProductList.call(params, (error, response) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        const successMsg = (params._id) ? 'ProductList has been updated!' : 'ProductList has been created!';
        Bert.alert(successMsg, 'success');
      }
    });
  }

  checkIsValidDate(current) {
    const yesterday = moment().tz(dateSettings.timeZone).subtract(1, 'day');
    return current.isAfter(yesterday);
  }

  checkValidStartDate(current) {
    this.setState({
      activeStartDate: current,
      showEndDateError: current.isAfter(this.state.activeEndDate),
    });
  }

  checkValidEndDate(current) {
    const isEndDateAfterCurrent = this.state.activeStartDate && current.isAfter(this.state.activeStartDate);
    this.setState({
      activeEndDate: isEndDateAfterCurrent ? current : null,
      showEndDateError: !isEndDateAfterCurrent,
    });
  }

  publishSection() {
    return (
      <ListGroupItem className="publishSection">
        <h3> Publish Product List for Users to order </h3>
        <HelpBlock bsStyle="info">Select dates during which this product list will be available for the users to order</HelpBlock>
        <Row>
          <Col xs={6}>
            <ControlLabel> Active start date </ControlLabel>
          </Col>
          <Col xs={6}>
            <Datetime closeOnSelect isValidDate={this.checkIsValidDate} onChange={this.checkValidStartDate} />
          </Col>
        </Row>
        <Row>
          <Col xs={6}>
            <ControlLabel> Active end date </ControlLabel>
          </Col>
          <Col xs={6}>
            <Datetime closeOnSelect isValidDate={this.checkIsValidDate} onChange={this.checkValidEndDate} />
            {this.state.showEndDateError && <Alert bsStyle="danger"> End date and time should be greater than start date. </Alert>}
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <Button bsStyle="primary" onClick={this.publishProductList}> Publish Product List </Button>
          </Col>
        </Row>
      </ListGroupItem>
    );
  }

  render() {
    return (
      this.props.products.length > 0 ?
        <ListGroup className="products-list">
          {this.props.products.map(product => (
            <Product prodId={product._id} product={product} />
          ))}
          <hr />
          {this.publishSection()}
        </ListGroup>
        :
        <Alert bsStyle="info">The product list is empty. You can add products by typing in the name of the product in the above box.</Alert>
    );
  }
}

ListAllProducts.propTypes = {
  products: PropTypes.array.isRequired,
  productListId: PropTypes.string,
};

export default ListAllProducts;
