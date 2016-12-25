import React from 'react'
import { ListGroup, Alert, Row, Col, Panel, Button, ListGroupItem } from 'react-bootstrap'
import  Product from './Product'
import { upsertOrder } from '../../../api/orders/methods'
import { formatMoney } from 'accounting-js';
import { accountSettings } from '../../../modules/settings'
import { Meteor } from 'meteor/meteor'
import constants from '../../../modules/constants'

const OrderFooter = ({ total_bill_amount, onButtonClick }) =>(
  <ListGroupItem>
      <Row>
          <div className="col-xs-7 col-sm-10">
            <h4 className="text-right-not-xs">Total <strong>{
                formatMoney(total_bill_amount, accountSettings)
              }</strong></h4>
          </div>
          <div className="col-xs-5 col-sm-2">
            <Button className="btn btn-success btn-block" disabled = { total_bill_amount <= 0 } onClick = { onButtonClick }>
              Place Order
            </Button>
          </div>
      </Row>
  </ListGroupItem>
)

export default class ProductsOrderList extends React.Component{
   constructor (props, context){
      super(props, context)

      let productArray = this.props.products.reduce(function(map, obj) {
        map[obj._id] = obj;
        return map;
        }, {});

      this.state = {
            products: productArray,
            total_bill_amount: 0,
      }

      this.updateProductQuantity = this.updateProductQuantity.bind(this)
      this.handleOrderSubmit = this.handleOrderSubmit.bind(this)
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
          customer_details:{
                _id: loggedInUser._id ,
                name: loggedInUser.profile.name.first + " " + loggedInUser.profile.name.last,
                email: loggedInUser.emails[0].address,
                mobilePhone: parseFloat ( loggedInUser.profile.whMobilePhone ),
              },
          order_status: constants.OrderStatus.Pending.name,
          total_bill_amount: this.state.total_bill_amount,
       }

       upsertOrder.call({order, productId:this.props.productId}, (error, response)=>{
           debugger;
           const confirmation = 'Your Order has been placed'
           if (error) {
             Bert.alert(error.reason, 'danger')
           } else {
             Bert.alert(confirmation, 'success')
           }
       })
    }

  render(){
      return (
        this.props.products.length > 0 ? <Row>
          <Col xs = { 12 }>
                <ListGroup className="products-list">
                    {this.props.products.map((product) => (
                      <Product updateProductQuantity = { this.updateProductQuantity } product = { product } />
                    ))}
                    <OrderFooter total_bill_amount = { this.state.total_bill_amount } onButtonClick = { this.handleOrderSubmit }/>
              </ListGroup>
          </Col>
      </Row>
      :
      <Alert bsStyle="info">No products yet.</Alert>
    )
  }
}

ProductsOrderList.propTypes = {
  products: React.PropTypes.array.isRequired,
  productListId: React.PropTypes.string.isRequired,
}
