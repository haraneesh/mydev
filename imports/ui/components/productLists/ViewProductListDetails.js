import React from 'react'
import { Row, Col, Label, ListGroup, ListGroupItem, Pager, Panel, PanelGroup } from 'react-bootstrap'
import { ButtonToolbar, ButtonGroup, Button } from 'react-bootstrap'
import { accountSettings, dateSettings } from '../../../modules/settings'
import { getDisplayDateTitle, getProductListStatus } from '../../../modules/helpers'
import { removeProductList } from '../../../api/productLists/methods'
import { Bert } from 'meteor/themeteorchef:bert';
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

     this.handleRemove = this.handleRemove.bind(this)
     this.state = { productList: this.props.productList  }
  }


  handleRemove (_id) {
    if (confirm('Are you sure about deleting this Product List? This is permanent!')) {
      removeProductList.call({ _id }, (error) => {
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          Bert.alert('Product List deleted!', 'success');
          browserHistory.push('/productLists');
        }
      });
    }
  }

  displayDeleteProductListButton(productListStatus, productListId)
  {
     if (productListStatus == constants.ProductListStatus.Future.name){
       return ( <ButtonToolbar className="pull-right">
                    <ButtonGroup bsSize="small">
                      <Button onClick={ () => this.handleRemove(productListId) } className="btn-danger">Delete</Button>
                    </ButtonGroup>
                  </ButtonToolbar>
              )
     }
     return
  }

  goBack(e){
    e.preventDefault()
    browserHistory.goBack()
  }

  render () {
    const productList = this.props.productList
    const productListStatus = getProductListStatus( productList.activeStartDateTime,  productList.activeEndDateTime )
    return (
      <div className = "ViewProductListDetails ">
        <div className = "page-header clearfix">
            <h3 className = "pull-left"> 
                  { getDisplayDateTitle( productList.activeStartDateTime,  productList.activeEndDateTime ) }
            </h3>
              { this.displayDeleteProductListButton( productListStatus, productList._id ) }
          </div>
          <Panel>
            <Row>
              <Col xs = { 12 }>
                <Label bsStyle = { constants.ProductListStatus[productListStatus].label }>
                  { constants.ProductListStatus[productListStatus].display_value }
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
        </Panel>
        <Pager>
          <Pager.Item previous onClick = {this.goBack}>&larr; Back</Pager.Item>
        </Pager>
      </div>
    )
  }
}

ViewProductListDetails.propTypes = {
  productList: React.PropTypes.object.isRequired,
};

export default ViewProductListDetails