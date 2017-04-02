import React from 'react'
import { Row, Col, ListGroupItem, Form, FormControl, Button, Image } from 'react-bootstrap'
import { ControlLabel, Thumbnail, HelpBlock } from 'react-bootstrap'
import { Bert } from 'meteor/themeteorchef:bert'
import '../../../modules/validation'
import { formatMoney } from 'accounting-js'
import { accountSettings } from '../../../modules/settings'
import QuantitySelector from './QuantitySelector'

//<Col sm = { 2 }><Image  src={ image } className = "order-image" responsive /> </Col>
const FieldGroup = ({ productId, sku, name, image, description, unit, unitprice, vendor, onChange, quantitySelected }) => (
    <Row>
      <Col sm = { 5 }>
        <h4 className = "product-name"><strong>{name + " " + unit}</strong></h4>
        <h4><small>{description}</small></h4>
      </Col>
      <Col sm = { 4 } className = "text-right-not-xs">
        <h4>{formatMoney(unitprice,accountSettings)} <span className = "text-muted">x</span></h4>
      </Col>
      <Col sm = { 3 }>
        <QuantitySelector onChange = { onChange } controlName = { productId } quantitySelected = { quantitySelected } />
      </Col>
  </Row>
)

const Product = ({ updateProductQuantity, product }) => (
      <ListGroupItem key = { product._id }>
          <FieldGroup
                productId = { product._id }
                sku = { product.sku }
                name = { product.name }
                image = { product.image_path }
                description = { product.description }
                unit = { product.unitOfSale }
                unitprice = { product.unitprice }
                vendor = { product.vendor_details }
                onChange = { updateProductQuantity }
                quantitySelected = { product.quantity }
          />
      </ListGroupItem>
  )

Product.propTypes = {
  updateProductQuantity: React.PropTypes.func.isRequired,
  product: React.PropTypes.object.isRequired,
}

export default Product
