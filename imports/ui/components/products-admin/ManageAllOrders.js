import React from 'react'
import { ListGroup, Row, Col, SplitButton, MenuItem } from 'react-bootstrap'
//import  Griddle from 'griddle-react'
import {Table, Column, Cell} from 'fixed-data-table-2'
import { LinkCell, ImageCell, TextCell, DateCell, AmountCell, OrderStatusCell, RowSelectedCell } from '../../../modules/ui/ShopTableCells'
import Dimensions from 'react-dimensions'
import { browserHistory } from 'react-router'
import constants from '../../../modules/constants'
import { Bert } from 'meteor/themeteorchef:bert'
import { updateOrderStatus } from '../../../api/orders/methods'


const UpdateStatusButtons = ({title, statuses, onSelectCallBack}) => {
    let rows = []
    _.each(statuses, function(value, key){
            rows.push(<MenuItem eventKey = {value.name} onSelect = {onSelectCallBack} >  {"to " + value.display_value} </MenuItem>)
        })
    return( 
        <SplitButton title = {title} key = "split-button-status-change" id = {`split-button-basic-status`}>
            { rows }
        </SplitButton>
    )
  }

const OrderTable = ({ dataList, dynamicWidth, onChecked, onRowClickCallBack }) =>(
    <Table
        rowHeight = { 50 }
        headerHeight = { 50 }
        rowsCount = { dataList.length }
        width = { dynamicWidth }
        onRowClick = { onRowClickCallBack }
        height = { 500 }>
        <Column
            header = { <Cell>Selected</Cell> }
            cell = { <RowSelectedCell data={dataList} onChecked={onChecked} col="selected" /> }
            flexGrow = { 1 }
            width = { 50 }
        />
        <Column
            header = { <Cell>Status</Cell> }
            cell = { <OrderStatusCell data={dataList} col="status" /> }
            flexGrow = { 1 }
            width = { 50 }
        />
        <Column
            header = {<Cell>Name</Cell>}
            cell = { <TextCell data={dataList} col="name" /> }
            width = { 100 }
            flexGrow = { 4 }
        />
        <Column
            header = { <Cell>Mobile Number</Cell> }
            cell = { <TextCell data={dataList} col="whMobileNum" /> }
            width = { 100 }
            flexGrow = { 2 }
        />
        <Column
            header = { <Cell>Order Date</Cell> }
            cell = { <DateCell data={dataList} col="date" /> }
            width = { 100 }
            flexGrow = { 3 }
        />
        <Column
            header = { <Cell>Bill Amount</Cell> }
            cell = { <AmountCell data={dataList} col="amount" /> }
            width = { 100 }
            flexGrow = { 2 }
        />
    </Table>
)

class ManageAllOrders extends React.Component{

    constructor(props){
        super(props)
        
        let displayOrderList = this.getDisplayOrderList(this.props.orders)
        this.state = {
            displayOrderList
        }

        this.handleRowClick = this.handleRowClick.bind(this)
        this.handleCheckBoxClick = this.handleCheckBoxClick.bind(this)
        this.handleStatusUpdate = this.handleStatusUpdate.bind(this)
    }

   getDisplayOrderList (orders){
       let displayOrderList = []
        orders.map(({ _id,  order_status, createdAt, total_bill_amount, customer_details  }) => {
            displayOrderList.push(
                { 
                    id:_id, 
                    status:order_status, 
                    date:createdAt, 
                    amount:total_bill_amount,
                    name:customer_details.name,
                    whMobileNum:customer_details.mobilePhone,
                    selected: false,
                }
            )
        })
        return displayOrderList
   }

   componentWillMount() {
        /* Create a new property to save checked boxes */  
        this.selectedOrderIds = new Set()
    }

   handleCheckBoxClick(e, rowIndex){
        const orderId = this.state.displayOrderList[rowIndex].id
        if (this.selectedOrderIds.has(orderId)) {
            this.selectedOrderIds.delete(orderId)
        } else {
            this.selectedOrderIds.add(orderId)
        }

        /* let displayOrderList = this.state.displayOrderList
        displayOrderList[rowIndex].selected = !displayOrderList[rowIndex].selected

        this.setState(
            displayOrderList
        )*/
   }

   componentWillReceiveProps(nextProps){
     if (nextProps.orders != this.props.orders){

        let displayOrderList = this.getDisplayOrderList(nextProps.orders)   
        this.setState ({displayOrderList})
     }
   }

   handleRowClick(e, rowIndex){
       e.preventDefault()
       browserHistory.push("/order/" + this.state.displayOrderList[rowIndex].id)
   }

   handleStatusUpdate(eventKey){
       if (this.selectedOrderIds.length <= 0) {
            Bert.alert("Please select order(s) to update the status to " + constants.OrderStatus[eventKey].display_value, 
            'danger');
       }
       else {
           const orderIds = [...this.selectedOrderIds]
           const updateToStatus = constants.OrderStatus[eventKey].name
            updateOrderStatus.call( { orderIds, updateToStatus } ,(error, response)=>{
                const confirmation = 'Status of selected order(s) have been updated to ' + 
                    constants.OrderStatus[eventKey].display_value  +  
                        ' successfully!'
                if (error) {
                    Bert.alert(error.reason, 'danger')
                } else {
                    Bert.alert(confirmation, 'success')
                }
            })
        }
   }

    render(){
        return (
                <Row>
                    <UpdateStatusButtons title = {"Update Status"} statuses = {constants.OrderStatus} onSelectCallBack= {this.handleStatusUpdate}/>
                    <OrderTable  
                        dataList = {this.state.displayOrderList} 
                        dynamicWidth = { this.props.containerWidth }  
                        onRowClickCallBack = { this.handleRowClick } 
                        onChecked = { this.handleCheckBoxClick }
                    />
                 </Row>
        )
    }
}

ManageAllOrders.propTypes = {
    orders: React.PropTypes.array,
    containerWidth: React.PropTypes.number.isRequired,   
}

export default Dimensions()(ManageAllOrders)
