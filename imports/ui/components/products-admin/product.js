import React from 'react'
import { Row, Col, ListGroupItem, Form, FormControl, Button, ControlLabel, Thumbnail, Alert, Checkbox } from 'react-bootstrap'
import { Bert } from 'meteor/themeteorchef:bert'
import { updateProductName, upsertProduct, updateProductUnitPrice, updateProductDescription, UpdateProductSKU, updateProductType, removeProduct } from '../../../api/products/methods.js'
import '../../../modules/validation'
import ImageUploader from '../common/ImageUploader'
import PropTypes from 'prop-types'

function FieldGroup({ controlType, controlLabel, controlName, updateValue, defaultValue, unitOfSale, children ,...props }) {
/*return (
  <FormGroup controlId={id}>
    <ControlLabel>{label}</ControlLabel>
    <FormControl {...props} />

  </FormGroup>
);
  }*/
    return(
      <Row>
          <Col xs={ 4 }>
            <ControlLabel>{ controlLabel }</ControlLabel>
          </Col>
          <Col xs={ 8 }>
            <FormControl
              type = { controlType }
              name = { controlName }
              defaultValue = { defaultValue }
              onBlur = { updateValue }
              componentClass = { children || 'textarea' == controlType ? controlType : 'input' }
              {...props }
            >
           { children && children.map((optionValue) => (<option value= { optionValue}> { optionValue }</option>)) }
           </FormControl>
         </Col>
      </Row>
    )
}

export default class Product extends React.Component {
    constructor(props,context) {
      super(props, context)

      this.state = {
          product:Object.assign({},this.props.product)
        };

      this.handleProductUpsert = this.handleProductUpsert.bind(this)
      this.handleRemoveProduct = this.handleRemoveProduct.bind(this)
      this.updateImageUrl = this.updateImageUrl.bind(this)
    }

    //Life cycle function which will check if the props are updated
    componentWillReceiveProps(nextProps){
        if (this.props.prodId != nextProps.prodId){
            this.setState({
                product:Object.assign({},nextProps.product)
              });
        }
    }

    handleRemoveProduct (event) {
        event.preventDefault();
        const productId = event.target.name
        if (confirm('Are you sure? This is permanent.')) {
          removeProduct.call({
            _id: productId,
          }, (error) => {
            if (error) {
              Bert.alert(error.reason, 'danger')
            } else {
              Bert.alert('Product removed!', 'info')
            }
          })
        }
    }

    handleProductUpsert(event){
      const field = event.target.name;
      let product = this.state.product;
      const valueToUpdate = (field == "availableToOrder") ? !product.availableToOrder : event.target.value.trim()
      if (valueToUpdate != product[field]){
          product[field] = valueToUpdate
          this.setState({product:product})
          this.updateDatabase();
      }
    }

    updateImageUrl(url){
      let product = this.state.product;
      product["image_path"] = url
      this.setState({product:product})
      this.updateDatabase();
    }

    updateDatabase (){
      const confirmation = 'Product updated!'
      const upsert = Object.assign({},this.state.product)
      upsert.unitprice = parseFloat(this.state.product.unitprice)
      upsertProduct.call(upsert, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert(confirmation, 'info');
          }
      });
    }

    render(){
      return (
      <ListGroupItem key={ this.props.product._id }>
        <Row>
          <Col sm={ 4 }>
             { /* <Thumbnail src={ this.props.product.image_path } /> */ }
             <ImageUploader imageType = "Product" 
                  imageUrl= { this.props.product.image_path } 
                  updateImageUrl = { this.updateImageUrl } 
                  imageNameOnServer = { this.props.product._id }
              />
             <Checkbox  name = "availableToOrder"
               checked = { this.state.product.availableToOrder? true : false }
               onChange = {this.handleProductUpsert} >
               Is Available To Order
             </Checkbox>

             
             <FieldGroup controlType = "text"
               controlLabel = "Image URL"
               controlName =  "image_path"
               updateValue = { this.handleProductUpsert }
               defaultValue = { this.props.product.image_path }
               help />

          </Col>

         <Col sm = { 6 }>
            <Form horizontal>
              <FieldGroup controlType = "text"
                controlLabel = "Name"
                controlName = "name"
                updateValue = { this.handleProductUpsert }
                defaultValue = { this.props.product.name }
                help />

              <FieldGroup controlType = "text"
               controlLabel = "Unit Of Sale"
               controlName =  "unitOfSale"
               updateValue = { this.handleProductUpsert }
               defaultValue = { this.props.product.unitOfSale }
               help />

              <FieldGroup controlType = "number"
                controlLabel = "Unit Price"
                controlName =  "unitprice"
                updateValue = { this.handleProductUpsert }
                defaultValue = { this.props.product.unitprice }
                help />

              <FieldGroup controlType = "text"
                controlLabel = "SKU"
                controlName = "sku"
                updateValue = { this.handleProductUpsert }
                defaultValue = { this.props.product.sku }
                help />

              <FieldGroup controlType = "textarea"
                controlLabel = "Description"
                controlName = "description"
                updateValue = { this.handleProductUpsert }
                defaultValue = { this.props.product.description }
                help />

              <FieldGroup controlType = "select"
                controlLabel = "Type"
                controlName = "type"
                updateValue = { this.handleProductUpsert }
                defaultValue = { this.props.product.type }
                children = { constants.ProductType }
                help />

                <FieldGroup controlType = "select"
                controlLabel = "Category"
                controlName = "category"
                updateValue = { this.handleProductUpsert }
                defaultValue = { this.props.product.category }
                children = { constants.ProductCategory }
                help />

               <FieldGroup controlType = "text"
                controlLabel = "Units For Selection"
                controlName = "unitsForSelection"
                updateValue = { this.handleProductUpsert }
                defaultValue = { this.props.product.unitsForSelection }
                help />

            </Form>
          </Col>

          <Col sm={ 2 }>
            <Button
              name = { this.props.product._id }
              onClick={ this.handleRemoveProduct }>
              Remove
            </Button>
          </Col>
        </Row>
      </ListGroupItem>
    )
  }
}

Product.propTypes = {
  prodId: PropTypes.string.isRequired,
  product: PropTypes.object.isRequired,
}
