import React from 'react'
import { ListGroup, Alert, Row, Col, Panel, Button, ButtonToolbar } from 'react-bootstrap'
import { ListGroupItem, ControlLabel, FormControl, Tabs, Tab } from 'react-bootstrap'
import  Product from './Product'
import { upsertOrder, updateMyOrderStatus } from '../../../api/orders/methods'
import { updateProductListWithOrderId } from '../../../api/productLists/methods'
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../modules/settings'
import { Meteor } from 'meteor/meteor'
import constants from '../../../modules/constants'
import { browserHistory } from 'react-router'

const OrderFooter = ({ total_bill_amount, onButtonClick, submitButtonName }) =>(
  <ListGroupItem>
      <Row>
          <Col sm = { 9 }>
            <h4 className="text-right-not-xs">Total <strong>{
                formatMoney(total_bill_amount, accountSettings)
              }</strong></h4>
          </Col>
          <Col sm = { 3 }>
           <div className="text-right-not-xs">
              <Button bsStyle="primary" disabled = { total_bill_amount <= 0 } onClick = { onButtonClick }>
                { submitButtonName }
              </Button>
            </div>
          </Col>
      </Row>
  </ListGroupItem>
)

const OrderComment = ({comments}) =>(
  <ListGroupItem>
      <Row>
          <Col sm = { 3 }>
            <h4 className = "product-name">
            <strong> Comments </strong>
            </h4> 
          </Col>
          <Col sm = { 9 }>  
            <FormControl name = "comments"  componentClass="textarea" 
              placeholder = "Is there anything that you would like to tell us about this order?"
              defaultValue = { comments }
            />
          </Col>
      </Row>
  </ListGroupItem>
)

export default class ProductsOrderList extends React.Component{
   constructor (props, context){
      super(props, context)

      let productArray = props.products.reduce(function(map, obj) {
        map[obj._id] = obj;
        return map;
       }, {});
  
      const total_bill_amount = (props.total_bill_amount)? props.total_bill_amount : 0  

      this.state = {
            products: productArray,
            total_bill_amount: total_bill_amount,
      }

      this.updateProductQuantity = this.updateProductQuantity.bind(this)
      this.handleOrderSubmit = this.handleOrderSubmit.bind(this)
      this.handleCancel = this.handleCancel.bind(this)
      this.displayProductsAndSubmit = this.displayProductsAndSubmit.bind(this)
   }

  updateProductQuantity(event){
      const productId = event.target.name
      let products_copy = this.state.products
      products_copy[productId].quantity = parseFloat(event.target.value)

      let total_bill_amount = 0
      for (let key in products_copy) {
          const quantity = products_copy[key].quantity? products_copy[key].quantity : 0
          total_bill_amount += quantity * products_copy[key].unitprice
      }

      this.setState({
        products: Object.assign({}, products_copy),
        total_bill_amount: total_bill_amount,
      })
  }

   handleOrderSubmit(){
      products = []
      for (let key in this.state.products) {
           if ( this.state.products[key].quantity &&  this.state.products[key].quantity > 0 ){
             products.push(this.state.products[key])
         }
       }

       let loggedInUser = Meteor.user()
       let order = {
          products:products,
          productOrderListId:this.props.productListId,
          customer_details:{
                _id: loggedInUser._id ,
                name: loggedInUser.profile.name.first + " " + loggedInUser.profile.name.last,
                email: loggedInUser.emails[0].address,
                mobilePhone: parseFloat ( loggedInUser.profile.whMobilePhone ),
                deliveryAddress: loggedInUser.profile.deliveryAddress,
              },
          _id:this.props.orderId,
          order_status: constants.OrderStatus.Pending.name,
          total_bill_amount: this.state.total_bill_amount,
          comments: document.querySelector('[name="comments"]').value,
       }
  
       upsertOrder.call(order, (error, response)=>{
           const confirmation = 'Your Order has been placed'
           if (error) {
             Bert.alert(error.reason, 'danger')
           } else {
              const isNewOrder = (response.insertedId)
              if (isNewOrder){
                  this.updateProductListWithOrderId(response.insertedId, this.props.productListId)
              }
              else{
                  Bert.alert(confirmation, 'success')
                  browserHistory.goBack()
              }
           }
       }) 
    }

   updateProductListWithOrderId(orderId, productListId){
      updateProductListWithOrderId.call( { orderId, productListId } ,(error, response)=>{
            const confirmation = 'Your Order has been placed'
            if (error) {
                Bert.alert(error.reason, 'danger')
            } else {
                Bert.alert(confirmation, 'success')
                browserHistory.goBack()
            }
        })
  }

  handleCancel (e){
    e.preventDefault()
    if (confirm('Are you sure about cancelling this Order? This is permanent!')) {
        const order = {
          orderId: this.props.orderId ,
          updateToStatus: constants.OrderStatus.Cancelled.name
        }

        updateMyOrderStatus.call(order, (error, response)=>{
            const confirmation = 'This Order has been cancelled.'
            if (error) {
              Bert.alert(error.reason, 'danger')
            } else {
              Bert.alert(confirmation, 'success')
              browserHistory.goBack()
            }
        })
    }
  }

 displayCancelOrderButton(orderStatus)
 {
     if (orderStatus == constants.OrderStatus.Pending.name){
       return ( <ButtonToolbar className="pull-right">
                    <Button bsSize="small" onClick={ this.handleCancel }>Cancel Order</Button>
                 </ButtonToolbar>
              )
     } 
  }

displayProductsByType(products){

   //Grouping product categories by tabs
   let productGroceries = []
   let productVegetables = []
   let productBatters = []

   products.map((product) => {
    switch(product.type) {
      case constants.ProductType[0]: //Vegetables
          productVegetables.push(
            <Product updateProductQuantity = { this.updateProductQuantity } product = { product }/>
          )
          break;
      case constants.ProductType[1]: //Groceries
          productGroceries.push(
            <Product updateProductQuantity = { this.updateProductQuantity } product = { product }/>
          )
          break;
      case constants.ProductType[2]: //Batters
          productBatters.push(
            <Product updateProductQuantity = { this.updateProductQuantity } product = { product }/>
          )
          break;
      default:
          break;
        }
   })

  return(
    <Tabs defaultActiveKey={1} id="productTabs" bsStyle="pills">
    <Tab eventKey={1} title="Vegetables" tabClassName="vegetables_bk">
          { productVegetables }
    </Tab>
    <Tab eventKey={2} title="Groceries" tabClassName="groceries_bk">
         { productGroceries }
    </Tab>
    <Tab eventKey={3} title="Batters" tabClassName="batters_bk">
         { productBatters }

    </Tab>
  </Tabs>
  )
}

 displayProductsAndSubmit(submitButtonName){
   //Grouping product categories by tabs
   return(
     this.props.products.length > 0 ? <Panel>
        <Row>
          <Col xs = { 12 }>
                <ListGroup className="products-list">
                    { this.displayProductsByType ( this.props.products) }
                    <OrderComment comments = { this.props.comments } />
                    <OrderFooter total_bill_amount = { this.state.total_bill_amount } 
                        onButtonClick = { this.handleOrderSubmit }
                        submitButtonName = { submitButtonName }
                     />
              </ListGroup>
          </Col>
        </Row>
      </Panel>
      :
      <Alert bsStyle="info">We do not have any products for you to order today. Please check back tomorrow.</Alert>
   )
 }

  render(){
      const formHeading = (this.props.order_status)? "Update your Order" : " Place your Order" 
      const submitButtonName = (this.props.order_status)? "Update Order" : " Place Order" 
      return (
        <div className = "EditOrderDetails ">
          <Row>
            <Col xs = { 12 }>
                <h3 className = "page-header"> { formHeading }
                  { this.displayCancelOrderButton( this.props.order_status ) }
                </h3>
                  { this.displayProductsAndSubmit(submitButtonName) }
            </Col>
          </Row>
        </div>
      )
  }
}

ProductsOrderList.propTypes = {
  products: React.PropTypes.array.isRequired,
  productListId: React.PropTypes.string.isRequired,
  orderId : React.PropTypes.string,
  order_status: React.PropTypes.string,
  comments: React.PropTypes.string,
  total_bill_amount: React.PropTypes.number
}
