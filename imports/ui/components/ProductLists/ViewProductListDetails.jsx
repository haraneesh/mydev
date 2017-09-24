import React from 'react';
import { Row, Col, Label, ListGroup, ListGroupItem, Pager, Panel, PanelGroup } from 'react-bootstrap';
import { ButtonToolbar, Button } from 'react-bootstrap';
import { accountSettings, dateSettings } from '../../../modules/settings';
import { getDisplayDateTitle, getProductListStatus } from '../../../modules/helpers';
import { removeProductList } from '../../../api/ProductLists/methods';
import { Bert } from 'meteor/themeteorchef:bert';
import PropTypes from 'prop-types';
import constants from '../../../modules/constants';

function FieldGroup({ label, value }) {
  return (
    <Row>
      <Col xs={4}>
        <p>{ label }</p>
      </Col>
      <Col xs={8}>
        <p>{ value }</p>
      </Col>
    </Row>
  );
}

const ViewProductListProducts = ({ products }) => (

  <Row className="view-product-list-details">
    <h4> Products </h4>
    {
      products.map(product => (
        <Col xs={12} key={product._id}>
          <p className="lead" ><strong> { product.name } </strong></p>
          <FieldGroup label="SKU" value={product.sku} />
          <FieldGroup label="Unit of Sale" value={product.unitOfSale} />
          <FieldGroup label="Unit Price" value={product.unitprice} />
          <FieldGroup label="Description" value={product.description} />
          <FieldGroup label="Type" value={product.type} />
          <FieldGroup label="Max Orderable Units" value={product.maxUnitsAvailableToOrder} />
          <FieldGroup label="Total Units Ordered" value={product.totQuantityOrdered} />
        </Col>
        ),
      )
    }
  </Row>
);

class ViewProductListDetails extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.handleRemove = this.handleRemove.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.goBack = this.goBack.bind(this);
    this.state = { productList: this.props.productList };
  }


  handleRemove(_id) {
    if (confirm('Are you sure about deleting this Product List? This is permanent!')) {
      removeProductList.call({ _id }, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Product List deleted!', 'success');
          this.props.history.push('/productLists');
        }
      });
    }
  }

  handleEdit(_id) {
    this.props.history.push(`/productLists/${_id}/edit`);
  }

  displayDeleteProductListButton(productListStatus, productListId) {
    if (productListStatus != constants.ProductListStatus.Expired.name) {
      return (<ButtonToolbar className="pull-right">
        <Button bsSize="small" onClick={() => this.handleEdit(productListId)} className="btn-primary">Edit</Button>
        <Button bsSize="small" onClick={() => this.handleRemove(productListId)} className="btn">Delete</Button>
      </ButtonToolbar>
      );
    }
    
  }

  goBack(e) {
    e.preventDefault();
    this.props.history.goBack();
  }

  render() {
    const productList = this.props.productList;
    const productListStatus = getProductListStatus(productList.activeStartDateTime, productList.activeEndDateTime);
    return (
      <div className="ViewProductListDetails ">
        <div className="page-header clearfix">
          <h3 className="pull-left">
            { getDisplayDateTitle(productList.activeStartDateTime, productList.activeEndDateTime) }
          </h3>
          { this.displayDeleteProductListButton(productListStatus, productList._id) }
        </div>
        <Panel>
          <Row>
            <Col xs={12}>
              <Label bsStyle={constants.ProductListStatus[productListStatus].label}>
                { constants.ProductListStatus[productListStatus].display_value }
              </Label>
            </Col>
          </Row>
          <div className="productListDetails panel-body">
            <Row>
              <Col xs={12}>
                <ViewProductListProducts products={productList.products} />
              </Col>
            </Row>
          </div>
        </Panel>
        <Pager>
          <Pager.Item previous onClick={this.goBack}>&larr; Back</Pager.Item>
        </Pager>
      </div>
    );
  }
}

ViewProductListDetails.propTypes = {
  productList: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default ViewProductListDetails;
