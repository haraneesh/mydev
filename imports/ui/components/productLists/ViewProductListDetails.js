import React from 'react'
import { Row, Col, Label, ListGroup, ListGroupItem, Pager, Panel, PanelGroup, Button } from 'react-bootstrap'
import { accountSettings, dateSettings } from '../../../modules/settings'
import { getDisplayDates2, getDateStatusLabel, getDateDisplayStatus } from '../../../modules/helpers'
import { removeProductList } from '../../../api/productLists/methods'

import { browserHistory } from 'react-router'

function FieldGroup({ label, value }) {
    return(
      <Row>
          <Col xs={ 4 }>
             <p>{ label }</p>
          </Col>
          <Col xs={ 8 }>
              <p>{ value }</p>
         </Col>
      </Row>
    )
}

const ViewProductListProducts = ({ products }) => (
 
  <Row className = "view-product-list-details">   
     <h4> Products </h4> 
     {
      products.map((product) =>(
        <Col xs ={ 12 } key = { product._id }>
          <p className = "lead" ><strong> { product.name } </strong></p>
          <FieldGroup label = "SKU" value = { product.sku } />
          <FieldGroup label = "Unit of Sale" value = { product.unitOfSale } />
          <FieldGroup label = "Unit Price" value = { product.unitprice } />
          <FieldGroup label = "Description" value = { product.description } />
          <FieldGroup label = "Type" value = { product.type } />
        </Col>
        )
      )
    }
  </Row>
)

class ViewProductListDetails extends React.Component{

  constructor (props, context){
     super(props, context)

     this.handleDelete = this.handleDelete.bind(this)
     this.state = { productList: this.props.productList  }
  }

  handleDelete (event){
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

  render () {
    const productList = this.props.productList
    const productListStatus = getDateDisplayStatus( productList.activeactiveStartDateTime,  productList.activeEndDateTime )
    return (
      <div className = "ViewProductListDetails ">
        <div className = "page-header">
          <Row>
            <Col xs = { 12 }>
                <h3> 
                     { getDisplayDates2( productList.activeactiveStartDateTime,  productList.activeEndDateTime ) }
                </h3>
            </Col>
          </Row>
          </div>
          <Row>
            <Col xs = { 12 }>
              <Label bsStyle = { getDateStatusLabel( productList.activeactiveStartDateTime,  productList.activeEndDateTime ) }>
                 { productListStatus }
              </Label>
            </Col>

          </Row>
        <div className = "productListDetails panel-body">
          <Row>
              <Col xs = { 12 }>
                <ViewProductListProducts products = { productList.products } />
              </Col>
          </Row>
        </div>
        <Pager>
          <Pager.Item previous href={ '/'}>&larr; View All Product Lists</Pager.Item>
          { (constants.ProductListStatus.Future == productListStatus) && (
                  <Button onClick = { () => {
                  if(confirm('Are you sure about deleting this product list ?'))
                    { this.handleDelete () } } } className = "pull-right">Delete Product List</Button>
             )
          }
        </Pager>
      </div>
    )
  }
}

ViewProductListDetails.propTypes = {
  productList: React.PropTypes.object.isRequired,
};

export default ViewProductListDetails
