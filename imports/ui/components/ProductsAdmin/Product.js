import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Panel, ListGroupItem, FormGroup, FormControl, Button, ControlLabel, Checkbox } from 'react-bootstrap';
import { Bert } from 'meteor/themeteorchef:bert';
import { updateProductName, upsertProduct, updateProductUnitPrice, updateProductDescription, UpdateProductSKU, updateProductType, removeProduct } from '../../../api/Products/methods.js';

export const ProductTableHeader = () => (
  <ListGroupItem>
    <Row>
      <Col xs={1}>&nbsp;</Col>
      <Col xs={2}>Product Name</Col>
      <Col xs={2}>Unit Price</Col>
      <Col xs={2}>Unit Of Sale</Col>
      <Col xs={3}>Units For Selection</Col>
      <Col xs={1}>Can be ordered?</Col>
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

function FieldGroup({ controlType, controlLabel, controlName, updateValue, defaultValue, unitOfSale, children, displayControlName = false, ...props }) {
  /* return (
    <FormGroup controlId={id}>
      <ControlLabel>{label}</ControlLabel>
      <FormControl {...props} />

    </FormGroup>
  );
    }*/
  return (
    <FormGroup>
      {displayControlName && <ControlLabel>{controlLabel}</ControlLabel>}
      <FormControl
        type={controlType}
        name={controlName}
        defaultValue={defaultValue}
        onBlur={updateValue}
        componentClass={children || controlType === 'textarea' ? controlType : 'input'}
        {...props}
      >
        {children && children.map((optionValue, index) => (<option value={optionValue} key={`prd-${index}`}> {optionValue}</option>))}
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
    };

    this.handleProductUpsert = this.handleProductUpsert.bind(this);
    this.handleRemoveProduct = this.handleRemoveProduct.bind(this);
    this.updateImageUrl = this.updateImageUrl.bind(this);
  }

  // Life cycle function which will check if the props are updated
  componentWillReceiveProps(nextProps) {
    if (this.props.prodId !== nextProps.prodId) {
      this.setState({
        product: Object.assign({}, nextProps.product),
      });
    }
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
    const field = event.target.name;
    const product = this.state.product;
    let valueToUpdate;

    switch (field) {
      case 'availableToOrder': valueToUpdate = !product.availableToOrder;
        break;
      case 'displayAsSpecial': valueToUpdate = !product.displayAsSpecial;
        break;
      default: valueToUpdate = event.target.value.trim();
        break;
    }

    if (valueToUpdate !== product[field]) {
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

  updateDatabase() {
    const confirmation = 'Product updated!';
    const upsert = Object.assign({}, this.state.product);
    upsert.unitprice = parseFloat(this.state.product.unitprice);
    upsertProduct.call(upsert, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        Bert.alert(confirmation, 'info');
      }
    });
  }

  /*
   <tr>
           <td>
             {this.props.productIndex + 1}
           </td>
           <td>
             <FieldGroup
               controlType="text"
               controlLabel="Name"
               controlName="name"
               updateValue={this.handleProductUpsert}
               defaultValue={this.props.product.name}
               help
             />
           </td>

           <td>
             <FieldGroup
               controlType="number"
               controlLabel="Unit Price"
               controlName="unitprice"
               updateValue={this.handleProductUpsert}
               defaultValue={this.props.product.unitprice}
               help
             />
           </td>
           <td>
             <FieldGroup
               controlType="text"
               controlLabel="Unit Of Sale"
               controlName="unitOfSale"
               updateValue={this.handleProductUpsert}
               defaultValue={this.props.product.unitOfSale}
               help
             />
           </td>
           <td>
             <FieldGroup
               controlType="text"
               controlLabel="Units For Selection"
               controlName="unitsForSelection"
               updateValue={this.handleProductUpsert}
               defaultValue={this.props.product.unitsForSelection}
               help
             />
           </td>
           <td>
             <Checkbox
               name="availableToOrder"
               checked={this.state.product.availableToOrder}
               onChange={this.handleProductUpsert}
             >
                Is Available To Order
             </Checkbox>
           </td>
         </tr>

         <tr>
           <table>
             <tbody>
               <td />
               <td>
                 <FieldGroup
                   controlType="textarea"
                   controlLabel="Description"
                   controlName="description"
                   updateValue={this.handleProductUpsert}
                   defaultValue={this.props.product.description}
                   help
                 />
               </td>

               <td>
                 <FieldGroup
                   controlType="select"
                   controlLabel="Type"
                   controlName="type"
                   updateValue={this.handleProductUpsert}
                   defaultValue={this.props.product.type}
                   children={constants.ProductType}
                   help
                 />
               </td>

               <td>
                 <FieldGroup
                   controlType="select"
                   controlLabel="Category"
                   controlName="category"
                   updateValue={this.handleProductUpsert}
                   defaultValue={this.props.product.category}
                   children={constants.ProductCategory}
                   help
                 />
               </td>
               <td>
                 <FieldGroup
                   controlType="text"
                   controlLabel="SKU"
                   controlName="sku"
                   updateValue={this.handleProductUpsert}
                   defaultValue={this.props.product.sku}
                   help
                 />
               </td>
               <td>
                 <Button
                   name={this.props.product._id}
                   onClick={this.handleRemoveProduct}
                 >Remove
           </Button>
               </td>
             </tbody>
           </table>
         </tr>

  */

  render() {
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
              defaultValue={this.props.product.name}
              help
            />
          </Col>
          <Col xs={2}>
            <FieldGroup
              controlType="number"
              controlLabel="Unit Price"
              controlName="unitprice"
              updateValue={this.handleProductUpsert}
              defaultValue={this.props.product.unitprice}
              help
            />
          </Col>
          <Col xs={2}>
            <FieldGroup
              controlType="text"
              controlLabel="Unit Of Sale"
              controlName="unitOfSale"
              updateValue={this.handleProductUpsert}
              defaultValue={this.props.product.unitOfSale}
              help
            />
          </Col>
          <Col xs={3}>
            <FieldGroup
              controlType="text"
              controlLabel="Units For Selection"
              controlName="unitsForSelection"
              updateValue={this.handleProductUpsert}
              defaultValue={this.props.product.unitsForSelection}
              help
            />
          </Col>
          <Col xs={1}>
            <Checkbox
              name="availableToOrder"
              checked={this.state.product.availableToOrder}
              onChange={this.handleProductUpsert}
            >
              {/* Is Available To Order*/}
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
            <Col xs={3}>
              <Checkbox
                name="displayAsSpecial"
                checked={this.state.product.displayAsSpecial}
                onChange={this.handleProductUpsert}
              >
              Display this as special?
            </Checkbox>
            </Col>
            <Col xs={2}>
              <FieldGroup
                controlType="select"
                controlLabel="Type"
                controlName="type"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={this.props.product.type}
                children={constants.ProductType}
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
                children={constants.ProductCategory}
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
                defaultValue={this.props.product.sku}
                help
              />
            </Col>
          </Row>
          <Row>
            <Col xs={7}>
              <FieldGroup
                controlType="textarea"
                controlLabel="Description"
                controlName="description"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={this.props.product.description}
                help
              />
            </Col>
            <Col xs={3}>
              <FieldGroup
                controlType="text"
                controlLabel="Image URL"
                controlName="image_path"
                displayControlName="true"
                updateValue={this.handleProductUpsert}
                defaultValue={this.props.product.image_path}
                help
              />
            </Col>
            <Col xs={2}>
              <ControlLabel>&nbsp;</ControlLabel><br />
              <Button
                bsSize="small"
                name={this.props.product._id}
                onClick={this.handleRemoveProduct}
              >
                Remove
              </Button>
            </Col>
          </Row>
        </Panel>
      </ListGroupItem>
    );
  }
}

Product.propTypes = {
  productIndex: PropTypes.number.isRequired,
  prodId: PropTypes.string.isRequired,
  product: PropTypes.object.isRequired,
};
