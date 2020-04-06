import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Panel, ListGroupItem, FormGroup, FormControl, Button, ControlLabel, Checkbox } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import AttachIngredient from './AttachIngredient';
import { upsertProduct, removeProduct } from '../../../api/Products/methods.js';
import constants from '../../../modules/constants';
import { retMultiSelectValueInArr } from '../../../modules/helpers';

export const ProductTableHeader = () => (
  <ListGroupItem>
    <Row>
      <Col xs={1}>&nbsp;</Col>
      <Col xs={2}>Product Name</Col>
      <Col xs={2}>Retail Price</Col>
      <Col xs={1}>Retail ordered?</Col>
      <Col xs={1}>Unit Of Sale</Col>
      <Col xs={2}>Whole Sale Price</Col>
      <Col xs={1}>WH ordered?</Col>
      <Col xs={1}>Special?</Col>
      <Col xs={1} />
    </Row>
  </ListGroupItem>

);

/* <thead>
   <tr>
     <th>#</th>
      <th>DP</th>
     <th>Product Name</th>
     <th>Unit Price</th>
     <th>Unit Of Sale</th>
     <th>Units For Selection</th>
     <th>Can be ordered?</th>
     <th />
   </tr>
 </thead>
*/

function FieldGroup({ controlType, controlLabel, controlName, updateValue, defaultValue, unitOfSale, choiceValues, displayControlName = false, ...props }) {
  const values = choiceValues && choiceValues.slice();
  if (values) {
    values.unshift(constants.SELECT_EMPTY_VALUE);
  }
  return (
    <FormGroup>
      {displayControlName && <ControlLabel>{controlLabel}</ControlLabel>}
      <FormControl
        type={controlType}
        name={controlName}
        defaultValue={defaultValue}
        onBlur={updateValue}
        componentClass={values || controlType === 'textarea' ? controlType : 'input'}
        {...props}
      >
        {values && values.map((optionValue, index) => (
          <option value={optionValue._id ? optionValue._id : optionValue} key={`prd-${index}`}>
            {optionValue.name ? optionValue.name : optionValue}
          </option>
        ))
        }
      </FormControl>
    </FormGroup>
  );
}

export default class Product extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      product: Object.assign({}, this.props.product),
      open: false,
      supplierHash: this.retSupplierHash(this.props.suppliers),
    };

    this.handleProductUpsert = this.handleProductUpsert.bind(this);
    this.handleRemoveProduct = this.handleRemoveProduct.bind(this);
    this.handleChangeInAssocIngredient = this.handleChangeInAssocIngredient.bind(this);
    this.updateImageUrl = this.updateImageUrl.bind(this);
  }

  // Life cycle function which will check if the props are updated
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.prodId !== nextProps.prodId) {
      this.setState({
        product: Object.assign({}, nextProps.product),
      });
    }
  }

  retSupplierHash(suppliers /* _id, name */) {
    return suppliers.reduce((map, obj) => {
      map[obj._id] = obj;
      return map;
    }, {});
  }

  handleRemoveProduct(event) {
    event.preventDefault();
    const productId = event.target.name;
    if (confirm(`Do you want to remove the product ${this.props.product.name}? This is permanent!`)) {
      removeProduct.call({
        _id: productId,
      }, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Product removed!', 'info');
        }
      });
    }
  }

  handleProductUpsert(event) {
    const selectedValue = event.target.value.trim();
    const field = event.target.name;
    const { product, supplierHash } = this.state;

    let valueToUpdate;

    switch (field) {
      case 'availableToOrder': valueToUpdate = !product.availableToOrder;
        break;
      case 'availableToOrderWH': valueToUpdate = !product.availableToOrderWH;
        break;
      case 'displayAsSpecial': valueToUpdate = !product.displayAsSpecial;
        break;
      case 'associatedFoodGroups':
        valueToUpdate = retMultiSelectValueInArr(event.target.selectedOptions);
        break;
      case 'sourceSuppliers':
        valueToUpdate = (selectedValue !== constants.SELECT_EMPTY_VALUE) ? [{
          ...supplierHash[selectedValue]
        }] : null;
        break;
      default: valueToUpdate = selectedValue;
        break;
    }

    const currentValue = (product[field]) ? product[field] : "";

    if (valueToUpdate !== currentValue.toString()) {
      product[field] = valueToUpdate;
      this.setState({ product });
      this.updateDatabase();
    }
  }

  updateImageUrl(url) {
    const product = this.state.product;
    product.image_path = url;
    this.setState({ product });
    this.updateDatabase();
  }

  handleChangeInAssocIngredient(ingredient) {
    const product = this.state.product;
    product.associatedIngredient = ingredient;
    this.setState({ product });
    this.updateDatabase();
  }

  updateDatabase() {
    const confirmation = 'Product updated!';
    const upsert = Object.assign({}, this.state.product);
    upsert.unitprice = parseFloat(upsert.unitprice);
    upsert.wSaleBaseUnitPrice = parseFloat(upsert.wSaleBaseUnitPrice);
    upsert.maxUnitsAvailableToOrder = parseFloat(upsert.maxUnitsAvailableToOrder);
    //upsert.displayOrder = parseFloat(upsert.displayOrder);
    delete upsert.displayOrder;

    upsertProduct.call(upsert, (error) => {
      if (error) {
        const errReason = (error.reason) ? error.reason : error.message;
        Bert.alert(errReason, 'danger');
      } else {
        Bert.alert(confirmation, 'info');
      }
    });
  }

  render() {
    const product = this.props.product;
    return (
      <ListGroupItem>
        <Row>
          <Col xs={1}>{this.props.productIndex + 1}</Col>
          <Col xs={2}>
            <FieldGroup
              controlType="text"
              controlLabel="Name"
              controlName="name"
              updateValue={this.handleProductUpsert}
              defaultValue={product.name}
              help
            />
          </Col>
          <Col xs={2}>
            <FieldGroup
              controlType="number"
              controlLabel="Unit Price"
              controlName="unitprice"
              updateValue={this.handleProductUpsert}
              defaultValue={product.unitprice}
              help
            />
          </Col>
          <Col xs={1}>
            <Checkbox
              name="availableToOrder"
              checked={this.state.product.availableToOrder}
              onChange={this.handleProductUpsert}
            >
              {/* Is Available To Order */}
            </Checkbox>
          </Col>
          <Col xs={1}>
            <FieldGroup
              controlType="text"
              controlLabel="Unit Of Sale"
              controlName="unitOfSale"
              updateValue={this.handleProductUpsert}
              defaultValue={product.unitOfSale}
              help
            />
          </Col>
          <Col xs={2}>
            <FieldGroup
              controlType="number"
              controlLabel="Whole Price"
              controlName="wSaleBaseUnitPrice"
              updateValue={this.handleProductUpsert}
              defaultValue={product.wSaleBaseUnitPrice}
              //defaultValue={this.props.product.sourceSupplier ? this.props.product.sourceSupplier._id : ''}
              //choiceValues={this.props.suppliers}
              help
            />
          </Col>
          <Col xs={1}>
            <Checkbox
              name="availableToOrderWH"
              checked={this.state.product.availableToOrderWH}
              onChange={this.handleProductUpsert}
            />
          </Col>
          <Col xs={1}>
            <Checkbox
              name="displayAsSpecial"
              checked={this.state.product.displayAsSpecial}
              onChange={this.handleProductUpsert}
            >
              {/*Display this as special? */}
            </Checkbox>
          </Col>
          <Col xs={1} >
            <Button
              bsStyle="link"
              bsSize="small"
              onClick={() => this.setState({ open: !this.state.open })}
            >
              {this.state.open ? <span>&#9650;</span> : <span>&#9660;</span>}
            </Button>
          </Col>
        </Row>
        <Panel collapsible expanded={this.state.open}>
          <Row>
            <Col xs={1} />

            <Col xs={2}>
              <FieldGroup
                controlType="number"
                controlLabel="Max Units Available"
                controlName="maxUnitsAvailableToOrder"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={(product.maxUnitsAvailableToOrder && product.maxUnitsAvailableToOrder > 0) ?
                  product.maxUnitsAvailableToOrder : ''}
                help
              />
            </Col>
            {/* <Col xs={1}>
              <FieldGroup
                controlType="number"
                controlLabel="Display Order"
                controlName="displayOrder"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={(product.displayOrder) ?
                  product.displayOrder : ''}
                help
              />
                </Col> 
            <Col xs={3}>
               <FieldGroup
                controlType="select"
                controlLabel="Category"
                controlName="category"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={this.props.product.category}
                choiceValues={constants.ProductCategory}
                help
              /> */}
            <Col xs={2}>
              <FieldGroup
                controlType="select"
                controlLabel="Type"
                controlName="type"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={product.type}
                choiceValues={constants.ProductType}
                help
              />
            </Col>
            <Col xs={3}>
              <FieldGroup
                controlType="text"
                controlLabel="Category"
                controlName="category"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={product.category}
                help
              />
            </Col>
            <Col xs={3}>
              <FieldGroup
                controlType="text"
                controlLabel="SKU"
                controlName="sku"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={product.sku}
                help
              />
            </Col>
          </Row>
          <Row>
            <Col xs={1} />
            <Col xs={7}>
              <FieldGroup
                controlType="textarea"
                controlLabel="Description"
                controlName="description"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={product.description}
                help
              />
            </Col>
            <Col xs={4}>
              <FieldGroup
                controlType="text"
                controlLabel="Image URL"
                controlName="image_path"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={product.image_path}
                help
              />
            </Col>
          </Row>
          <Row>
            <Col xs={1} />
            <Col xs={6}>
              <ControlLabel>Associated with Ingredient:
                <strong>
                  {product.associatedIngredient ? ` ${product.associatedIngredient.Long_Desc}` : ''}
                </strong>
              </ControlLabel>
              <AttachIngredient
                onChange={this.handleChangeInAssocIngredient}
                ingredient={product.associatedIngredient}
              />
            </Col>
            <Col xs={5}>
              <FieldGroup
                style={{ height: '170px' }}
                controlType="select"
                controlLabel="Food Group"
                controlName="associatedFoodGroups"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={product.associatedFoodGroups}
                choiceValues={constants.FoodGroups.names}
                multiple
                help
              />
            </Col>
          </Row>
          <Row>
            <Col xs={1} />
            <Col xs={5}>
              <FieldGroup
                controlType="text"
                controlLabel="Units For Selection"
                controlName="unitsForSelection"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={product.unitsForSelection}
                help
              />
            </Col>
            <Col xs={3}>
              <FieldGroup
                controlType="select"
                controlLabel="Suppliers"
                controlName="sourceSuppliers"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={this.props.product.sourceSuppliers && this.props.product.sourceSuppliers.length > 0 ? this.props.product.sourceSuppliers[0]._id : ''}
                choiceValues={this.props.suppliers}
                help
              />
            </Col>
            <Col xs={2}>
              <ControlLabel>&nbsp;</ControlLabel><br />
              <Button
                bsSize="small"
                name={product._id}
                onClick={this.handleRemoveProduct}
              > Delete Product
              </Button>
            </Col>
          </Row>
        </Panel>
      </ListGroupItem >
    );
  }
}

Product.defaultProps = {
  suppliers: [],
};

Product.propTypes = {
  productIndex: PropTypes.number.isRequired,
  prodId: PropTypes.string.isRequired,
  product: PropTypes.object.isRequired,
  suppliers: PropTypes.array.isRequired,
};
