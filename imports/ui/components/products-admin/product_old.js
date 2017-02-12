import React from 'react'
import { Row, Col, ListGroupItem, Form, FormControl, Button, ControlLabel, Thumbnail } from 'react-bootstrap'
import { Bert } from 'meteor/themeteorchef:bert'
import { updateProductName,upsertProduct, updateProductUnitPrice, updateProductDescription, UpdateProductSKU, updateProductType, removeProduct } from '../../../api/products/methods.js'
import '../../../modules/validation';


//export const Product = ({ product }) => (
export class Product_Old extends React.Component{

  constructor(props,context){
      super(props, context);
      this.handleProductUpsert = this.handleProductUpsert.bind(this);
      this.state = {
          product:Object.assign({},this.props.product)
        };
    }


/*const EnterKeyPressed = 13

const handleUpdateProductName = (productId, event) => {
  const name = event.target.value.trim()
  if (name !== '' || event.keyCode === EnterKeyPressed) {
    updateProductName.call({
      _id: productId,
      update: { name },
    }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger')
      } else {
        Bert.alert('Name updated!', 'success')
      }
    })
  }
}

const handleUpdateProductUnitPrice = (productId, event) => {
  const priceString = event.target.value.trim()
  const unitprice = parseFloat(priceString)
  if (price !== '' || event.keyCode === EnterKeyPressed) {
    updateProductUnitPrice.call({
      _id: productId,
      update: { unitprice },
    }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger')
      } else {
        Bert.alert('Price updated!', 'success')
      }
    })
  }
}

const handleUpdateProductDescription = (productId, event) => {
  const description = event.target.value.trim()
  if (description !== '' || event.keyCode === EnterKeyPressed) {
    updateProductDescription.call({
      _id: productId,
      update: { description },
    }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger')
      } else {
        Bert.alert('Description updated!', 'success')
      }
    })
  }
}

const handleUpdateProductSKU = (productId, event) => {
  const sku = event.target.value.trim()
  if (description !== '' || event.keyCode === EnterKeyPressed) {
    updateProductSKU.call({
      _id: productId,
      update: { sku },
    }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger')
      } else {
        Bert.alert('Sku updated!', 'success')
      }
    })
  }
}

const handleUpdateProductType = (productId, event) =>{
  const type = event.target.value.trim()
  if (type != '' || event.keyCode == EnterKeyPressed){
    updateProductType.call({
        _id: productId,
        update:{type}
    }, (error) =>{
      if (error) {
        Bert.alert(error.reason, 'danger')
      } else {
        Bert.alert('Type updated!', 'success')
      }
    })
  }
} */


function handleRemoveProduct (productId, event) {
  event.preventDefault()
  // this should be replaced with a styled solution so for now we will
  // disable the eslint `no-alert`
  // eslint-disable-next-line no-alert
  if (confirm('Are you sure? This is permanent.')) {
    removeProduct.call({
      _id: productId,
    }, (error) => {
      if (error) {
        Bert.alert(error.reason, 'danger')
      } else {
        Bert.alert('Product removed!', 'success')
      }
    })
  }
}

/*const validate = () => {
  $(component.documentEditorForm).validate({
    rules: {
      title: {
        required: true,
      },
      body: {
        required: true,
      },
    },
    messages: {
      title: {
        required: 'Need a title in here, Seuss.',
      },
      body: {
        required: 'This needs a body, please.',
      },
    },
    submitHandler() { handleUpsert(); },
  });
};
*/
/*export default function documentEditor(options) {
  component = options.component;
  validate();
}*/

  //Life cycle function which will check if the props are updated
  componentWillReceiveProps(nextProps){
    if (this.props.key != nextProps.key){
        this.setState({
            product:Object.assign({},nextProps.product)
          });
    }
  }

  updateProductChange(event){
    const field = event.target.name;
    let product = this.state.product;
    product[field] = event.target.value;
    return this.setState({product:product});
  }

  handleProductUpsert (productId, event) {
      const confirmation = 'Product updated!'
      const upsert = {
        _id: productId,
        name: document.querySelector('[name="' + productId + '-name]').value.trim(),
        sku: document.querySelector('[name="' + productId + '-sku]').value.trim(),
        unitprice: parseFloat(document.querySelector('[name="' + productId + '-unitprice]').value.trim()),
        description: document.querySelector('[name="' + productId + '-description]').value.trim(),
        type: document.querySelector('[name="' + productId + '-type]').value.trim(),
        /*
        sku: {  type: String, label: 'The SKU of the product.', },
        name: { type: String, label: 'The name of the product.', },
        unitprice: { type: Number, decimal: true, label: 'The unit price of the product.', },
        description: { type: String, label: 'The description of the product.', },
        image_path: { type: String, label: 'The image path of the product.', },
        type: { type:String, label: 'The type of the product.', },
        */
      };

      upsertProduct.call(upsert, (error, { insertedId }) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          component.documentEditorForm.reset();
          Bert.alert(confirmation, 'success');
          }
      });
  }

render(){
      <ListGroupItem key={ product._id }>
        <Row>
          <Col xs={ 8 } sm={ 10 }>
            <Form horizontal>
              <Col xs={ 4 } sm={ 5 }>
                <Thumbnail src={ product.image_path } />
              </Col>
              <Col xs={ 4 } sm={ 5 }>
                <Row>
                  <Col componentClass={ControlLabel} sm={ 4 }>
                    Name
                  </Col>
                  <Col sm={ 8 }>
                    <FormControl
                      type="text"
                      inputRef={ref => { this.input = "name"; }}
                      defaultValue={ product.name }
                      onBlur={ this.updateProductChange }
                    />
                  </Col>
                </Row>
                <Row>
                  <Col componentClass={ControlLabel} sm={ 4 }>
                    Unit Price
                  </Col>
                  <Col sm={ 8 }>
                    <FormControl
                      type="number"
                      step="1"
                      ref = {product._id + "-unitprice"}
                      defaultValue={ product.unitprice }
                      onBlur={ handleUpdateProductUnitPrice.bind(this, product._id) }
                    />
                  </Col>
                </Row>

                <Row>
                <Col componentClass={ControlLabel} sm={ 4 }>
                  Type
                </Col>
                <Col sm={ 8 }>
                  <FormControl
                    type="text"
                    defaultValue={ product.type }
                    ref = { product._id + "-type" }
                    onBlur={ handleUpdateProductType.bind(this, product._id) }
                  />
                </Col>
                </Row>

                <Row>
                <Col componentClass={ControlLabel} sm={ 4 }>
                  SKU
                </Col>
                <Col sm={ 8 }>
                  <FormControl
                    type="text"
                    defaultValue={ product.sku }
                    ref = { product._id + "-sku" }
                    onBlur={ handleUpdateProductSKU.bind(this, product._id) }
                  />
                </Col>
                </Row>

                <Row>
                <Col componentClass={ControlLabel} sm={ 4 }>
                  Description
                </Col>
                <Col sm={ 8 }>
                  <FormControl
                    type="text"
                    defaultValue={ product.description }
                    ref = { product._id + "-description" }
                    onBlur={ handleUpdateProductDescription.bind(this, product._id) }
                  />
                </Col>
                </Row>
              </Col>
            </Form>
          </Col>
          <Col xs={ 4 } sm={ 2 }>
            <Button
              bsStyle="danger"
              className="btn-block"
              onClick={ handleRemoveProduct.bind(this, product._id) }>
              Remove
            </Button>
          </Col>
        </Row>
      </ListGroupItem>
  }
}

Product.propTypes = {
  key: React.PropTypes.string,
  product: React.PropTypes.object
}
