import React from 'react'
import { ListGroup, ListGroupItem, Alert, Accordion, Panel, Row,  Col, Glyphicon, Label } from 'react-bootstrap'
import  { getDisplayDates2, getDateStatusLabel, getDateDisplayStatus } from '../../../modules/helpers'

const DisplayProductLists = ({ productLists }) =>(
    productLists.length > 0 ? <ListGroup className = "productsList-list">{
    productLists.map(({ _id, activeStartDateTime, activeEndDateTime }) =>{ 
      
      return (
        <ListGroupItem key={ _id } href={`/productLists/${_id}`}>
          <ProductListTitleRow
               dateRangeToDisplay = { getDisplayDates2(activeStartDateTime, activeEndDateTime) }     
               statusToDisplay = { getDateDisplayStatus(activeStartDateTime, activeEndDateTime) }      
               labelStyle = { getDateStatusLabel(activeStartDateTime, activeEndDateTime ) }     
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
  productLists: React.PropTypes.array,
};
export default DisplayProductLists;
