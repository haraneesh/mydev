import React from 'react'
import { Row, Col, ListGroupItem, Form, FormControl, Button, Image } from 'react-bootstrap'
import { ControlLabel, Thumbnail, HelpBlock } from 'react-bootstrap'
import QuantitySelector from './QuantitySelector'
import { Bert } from 'meteor/themeteorchef:bert'
import { formatMoney } from 'accounting-js'
import { accountSettings } from '../../../modules/settings'
import PropTypes from 'prop-types'

//<Col sm = { 2 }><Image  src={ image } className = "order-image" responsive /> </Col>
const FieldGroup = ({ productId, sku, name, image, description, unit, unitprice, vendor, onChange, quantitySelected, unitsForSelection, isAdmin }) => (
    <Row>
      <Col sm = { 6 }>
        <h4 className = "product-name"><strong>{name + " " + unit}</strong></h4>
        <h4><small>{description}</small></h4>
      </Col>
      <Col sm = { 3 } className = "text-right-not-xs">
        <h4>{formatMoney(unitprice,accountSettings)} <span className = "text-muted">x</span></h4>
      </Col>
      <Col sm = { 3 }>
        <QuantitySelector onChange = { onChange } 
            controlName = { productId } 
            quantitySelected = { quantitySelected } 
            values = { (unitsForSelection)?unitsForSelection.split(',') : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }
            isAdmin = { isAdmin }
          />
      </Col>
  </Row>
)

const Product = ({ updateProductQuantity, product, isAdmin }) => (
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
                unitsForSelection = { product.unitsForSelection }
                isAdmin = { isAdmin }
          />
      </ListGroupItem>
  )

Product.propTypes = {
  updateProductQuantity: PropTypes.func.isRequired,
  product: PropTypes.object.isRequired,
}

export default Product
