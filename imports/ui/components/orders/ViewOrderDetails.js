import React from 'react'
import { Row, Col, Label, Glyphicon, ListGroupItem, Pager, Panel, PanelGroup, Button, ButtonToolbar, ButtonGroup } from 'react-bootstrap'
import { formatMoney } from 'accounting-js'
import { accountSettings, dateSettings } from '../../../modules/settings'
import { upsertOrder } from '../../../api/orders/methods'
import moment from 'moment'
import 'moment-timezone'
import { browserHistory } from 'react-router'

const ViewOrderProducts = ({ products }) => (
  <PanelGroup className = "order-details-products">
      <Panel>
        <Row>
          <Col xs = { 4 }> <strong> Name </strong></Col>
          <Col xs = { 4 }> <strong> Qty / Price </strong></Col>
          <Col xs = { 4 }> <strong> Total </strong></Col>
        </Row>
      </Panel>
     {
      products.map((product) =>(
        <Panel key = { product._id }>
          <Row>
            <Col xs = { 4 }>
                    {  product.name + " " + product.unitOfSale } <br />
                      <small> { product.description } </small>
            </Col>
            <Col xs = { 4 }>  { product.quantity + " x "  + formatMoney(product.unitprice,accountSettings) } </Col>
            <Col xs = { 4 }>  { formatMoney(product.unitprice * product.quantity, accountSettings) } </Col>
          </Row>
        </Panel>
        )
      )
    }
  </PanelGroup>
)

class ViewOrderDetails extends React.Component{

  constructor (props, context){
     super(props, context)

     this.handleCancel = this.handleCancel.bind(this)
     this.goBack = this.goBack.bind(this)
     this.state = { order: this.props.order  }
  }

  goBack(e){
    e.preventDefault() 
    browserHistory.goBack()
  }

  handleCancel (e){
    e.preventDefault()
    if (confirm('Are you sure about cancelling this Order? This is permanent!')) {
        let order = this.state.order
        order.order_status = constants.OrderStatus.Cancelled.name
        upsertOrder.call(order, (error, response)=>{
            const confirmation = 'This Order has been cancelled.'
            if (error) {
              Bert.alert(error.reason, 'danger')
            } else {
              Bert.alert(confirmation, 'success')
              browserHistory.push('/')
            }
        })
    }
  }

  displayCancelOrderButton(orderStatus)
  {
     if (orderStatus == constants.OrderStatus.Pending.name){
       return ( <ButtonToolbar className="pull-right">
                    <ButtonGroup bsSize="small">
                      <Button onClick={ this.handleCancel } className="btn-primary">Cancel Order</Button>
                    </ButtonGroup>
                  </ButtonToolbar>
              )
     }
     return 
  }

  render () {
    const order = this.props.order
    return (
      <div className = "ViewOrderDetails ">
        <div className = "page-header">
          <Row>
            <Col xs = { 12 }>
                <h3 className = "pull-left"> { moment(order.createdAt).tz(dateSettings.timeZone).format(dateSettings.format) } </h3>
                { this.displayCancelOrderButton( order.order_status ) }
            </Col>
          </Row>
        </div>
        <Panel>
         <Row>
            <Col xs = { 12 }>
              <Label bsStyle = { constants.OrderStatus[order.order_status].label }>
                 { constants.OrderStatus[order.order_status].display_value }
              </Label>
            </Col>
          </Row>
         <div className = "orderDetails panel-body">
          <Row>
              <Col xs = { 12 }>
                <ViewOrderProducts products = { order.products } />
              </Col>
          </Row>
          <Row>
              <Col xs = { 4 }> <p> Comments </p></Col>
              <Col xs = { 8 }> { order.comments } </Col>    
          </Row>
         </div>
         <div className = "panel-footer">
          <Row>
                <Col xs = { 8 } className = "text-right"> <strong>Total:</strong> </Col>
                <Col xs = { 4 }> <strong> { formatMoney(order.total_bill_amount, accountSettings) } </strong> </Col>
          </Row>
         </div>
      </Panel>
      <Pager>
        <Pager.Item previous onClick = {this.goBack}>&larr; Back</Pager.Item>
      </Pager>
    </div>
    )
  }
}
ViewOrderDetails.propTypes = {
  order: React.PropTypes.object.isRequired,
}

export default ViewOrderDetails
 