import React from 'react'
import { ListGroup, Alert, Button, Col, ListGroupItem, Form, FormControl, ControlLabel, HelpBlock } from 'react-bootstrap'
import { Bert } from 'meteor/themeteorchef:bert'
import Datetime from 'react-datetime'
import Product from './product'
import moment from 'moment'
import 'moment-timezone'
import { dateSettings } from '../../../modules/settings'
import { upsertProductList } from '../../../api/productLists/methods'

class ListAllProducts extends React.Component {

  constructor(props, context){
    super(props, context)

    this.state = {
      activeStartDate: null,
      activeEndDate: null,
      showEndDateError: false,
    }

    this.publishProductList = this.publishProductList.bind(this)
    this.checkValidStartDate = this.checkValidStartDate.bind(this)
    this.checkValidEndDate = this.checkValidEndDate.bind(this)
  }

  publishProductList(){
      if (this.state.showEndDateError) {
        Bert.alert("Your dates are not quiet right, do correct them and publish", 'danger')
        return
      }

      const params = {
        activeStartDateTime: new Date (this.state.activeStartDate),
        activeEndDateTime: new Date (this.state.activeEndDate),
        _id: null,
      }

      upsertProductList.call(params, (error, response) => {
          if (error) {
            Bert.alert(error.reason, 'danger')
          } else {
            Bert.alert('ProductList has been created! ', 'success')
          }
        })
  }

  checkIsValidDate ( current )
  {
    const yesterday = moment().tz(dateSettings.timeZone).subtract(1, 'day')
    return current.isAfter( yesterday )
  }

  checkValidStartDate ( current ) {
    const yesterday = moment().tz(dateSettings.timeZone).subtract(1, 'day')
    this.setState({
      activeStartDate: current,
      showEndDateError: current.isAfter(this.state.activeEndDate),
    })
  }

  checkValidEndDate( current ) {
    const isEndDateAfterCurrent = this.state.activeStartDate && current.isAfter( this.state.activeStartDate )
    this.setState({
      activeEndDate: isEndDateAfterCurrent? current : null,
      showEndDateError: !isEndDateAfterCurrent,
    })
  }

  onFocusChange(focusedInput) {
    this.setState({ focusedInput });
  }

 PublishSection() {
   return (
     <ListGroupItem className = 'publishSection'>
       <h3> Publish Product List for Users to order </h3>
       <HelpBlock bStyle = "info">Select dates during which this product list will be available for the users to order</HelpBlock>
       <Col xs = { 6 }>
         <ControlLabel> Active start date </ControlLabel>
       </Col>
       <Col xs = { 6 }>
         <Datetime closeOnSelect={ true } isValidDate={ this.checkIsValidDate } onChange={ this.checkValidStartDate } />
       </Col>
       <Col xs = { 6 }>
         <ControlLabel> Active end date </ControlLabel>
       </Col>
       <Col xs = { 6 }>
         <Datetime closeOnSelect = { true } isValidDate={ this.checkIsValidDate } onChange={ this.checkValidEndDate } />
         {this.state.showEndDateError && <Alert bsStyle="danger"> End date and time should be greater than start date. </Alert>}
       </Col>
       <Col xs = { 12 }>
         <Button bsStyle = "success" onClick = { this.publishProductList }> Publish Product List </Button>
       </Col>
     </ListGroupItem>
   )
 }

  render() {
     return (
        this.props.products.length > 0 ?
          <ListGroup className="products-list">
            {this.props.products.map((product) => (
              <Product prodId={ product._id } product={ product } />
            ))}
            <hr />
            { this.PublishSection() }
          </ListGroup>
         :
        <Alert bsStyle="info">The product list is empty. You can add products by typing in the name of the product in the above box.</Alert>
      )
  }
}

ListAllProducts.propTypes = {
  products: React.PropTypes.array.isRequired,
}

export default ListAllProducts
