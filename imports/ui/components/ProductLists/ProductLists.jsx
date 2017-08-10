import React from 'react'
import { ListGroup, ListGroupItem, Alert, Accordion, Panel, Row,  Col, Glyphicon, Label } from 'react-bootstrap'
import  { getDisplayDateTitle, getProductListStatus } from '../../../modules/helpers'
import PropTypes from 'prop-types'

const DisplayProductLists = ({ productLists }) =>(
    productLists.length > 0 ? <ListGroup className = "productsList-list">{
    productLists.map(({ _id, activeStartDateTime, activeEndDateTime }) =>{
      const productListStatus = getProductListStatus( activeStartDateTime,  activeEndDateTime )
      return (
        <ListGroupItem key={ _id } href={`/productLists/${_id}`}>
          <ProductListTitleRow
               dateRangeToDisplay = { getDisplayDateTitle(activeStartDateTime, activeEndDateTime) }     
               statusToDisplay = { constants.ProductListStatus[productListStatus].display_value }      
               labelStyle = { constants.ProductListStatus[productListStatus].label }     
          />
        </ListGroupItem>
      ) 
    }
 )}
 </ListGroup> :
 <Alert bsStyle="info">No Product Lists have been created yet.</Alert>
)

export const ProductListTitleRow = ( { dateRangeToDisplay, labelStyle, statusToDisplay  } ) => (
    <Row>
      <Col xs = { 4 } sm = { 3 }> <Label bsStyle = { labelStyle }> { statusToDisplay } </Label> </Col>
      <Col xs = { 8 } sm = { 9 }> { dateRangeToDisplay } </Col>
    </Row>
  )

DisplayProductLists.propTypes = {
  productLists: PropTypes.array,
};
export default DisplayProductLists;
