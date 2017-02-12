import React from 'react'
import { ListGroup, Row, Col, SplitButton, MenuItem, Button } from 'react-bootstrap'
//import  Griddle from 'griddle-react'
import {Table, Column, Cell} from 'fixed-data-table-2'
import { DataListStore, SortTypes, SortHeaderCell, LinkCell, ImageCell } from '../../../modules/ui/ShopTableCells'
import { AmountCell, OrderStatusCell, RowSelectedCell, TextCell, DateCell } from '../../../modules/ui/ShopTableCells'
import Dimensions from 'react-dimensions'
import { browserHistory } from 'react-router'
import constants from '../../../modules/constants'
import { Bert } from 'meteor/themeteorchef:bert'
import { updateOrderStatus, getOrders } from '../../../api/orders/methods'
import GenerateOrderBills from './GenerateOrderBills'

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

const OrderTable = ({ dataList, dynamicWidth, onChecked, colSortDirs, onRowClickCallBack, onSortChangeCallBack }) =>(
    <Table
        rowHeight = { 50 }
        headerHeight = { 50 }
        rowsCount = { dataList.getSize() }
        width = { dynamicWidth }
        onRowClick = { onRowClickCallBack }
        height = { 500 }>
        <Column
            columnKey="selected"
            //header = { <Cell>Selected</Cell> }
            header={
                <SortHeaderCell
                onSortChange={onSortChangeCallBack}
                sortDir={colSortDirs.selected}>
                Selected
                </SortHeaderCell>
            }
            cell = { <RowSelectedCell data={dataList} onChecked={onChecked} /> }
            flexGrow = { 1 }
            width = { 50 }
        />
        <Column
            columnKey="status"
            cell = { <OrderStatusCell data={dataList} /> }
            flexGrow = { 2 }
            width = { 50 }
            //header = { <Cell>Status</Cell> }
            header={
                <SortHeaderCell
                onSortChange={onSortChangeCallBack}
                sortDir={colSortDirs.status}>
                Status
                </SortHeaderCell>
            }
        />
        <Column
            columnKey="name"
            header={
                <SortHeaderCell
                onSortChange={onSortChangeCallBack}
                sortDir={colSortDirs.name}>
                Name
                </SortHeaderCell>
            }
            cell = { <TextCell data={dataList}  /> }
            width = { 100 }
            flexGrow = { 3 }
        />
        <Column
            columnKey="whMobileNum"
             header={
                <SortHeaderCell
                onSortChange={onSortChangeCallBack}
                sortDir={colSortDirs.whMobileNum}>
                Mobile Number
                </SortHeaderCell>
            }
            cell = { <TextCell data={dataList}  /> }
            width = { 100 }
            flexGrow = { 2 }
        />
        <Column
            columnKey="date"
            header={
                <SortHeaderCell
                onSortChange={onSortChangeCallBack}
                sortDir={colSortDirs.date}>
                Order Date
                </SortHeaderCell>
            }
            cell = { <DateCell data={dataList}  /> }
            width = { 100 }
            flexGrow = { 3 }
        />
        <Column
            columnKey="amount"
            header={
                <SortHeaderCell
                onSortChange={onSortChangeCallBack}
                sortDir={colSortDirs.amount}>
                Bill Amount
                </SortHeaderCell>
            }
            cell = { <AmountCell data={dataList} /> }
            width = { 100 }
            flexGrow = { 2 }
        />
    </Table>
)

class DataListWrapper {
  constructor(indexMap, data) {
    this._indexMap = indexMap;
    this._data = data;
  }

  getSize() {
    return this._indexMap.length;
  }

  getObjectAt(index) {
    return this._data.getObjectAt(
      this._indexMap[index],
    );
  }
}


class ManageAllOrders extends React.Component{
    constructor(props){
        super(props)

        this._dataList =  this.getTableDataList(this.props.orders)

        this._defaultSortIndexes = [];
        var size = this._dataList.getSize();
        for (var index = 0; index < size; index++) {
            this._defaultSortIndexes.push(index);
        }

        this.state = {
            sortedDataList: new DataListWrapper(this._defaultSortIndexes, this._dataList),
            colSortDirs: {},
        }

        this.handleRowClick = this.handleRowClick.bind(this)
        this.handleCheckBoxClick = this.handleCheckBoxClick.bind(this)
        this.handleStatusUpdate = this.handleStatusUpdate.bind(this)
        this._onSortChange = this._onSortChange.bind(this);
        this.handleGenerateBills = this.handleGenerateBills.bind(this);

    }

    _onSortChange(columnKey, sortDir) {
        let sortIndexes = this._defaultSortIndexes.slice()
        sortIndexes.sort((indexA, indexB) => {
            let valueA, valueB
            if (columnKey === "selected"){
                const orderIdA = this._dataList.getObjectAt(indexA)["id"]
                const orderIdB = this._dataList.getObjectAt(indexB)["id"]
                valueA = this.selectedOrderIds.has(orderIdA)
                valueB = this.selectedOrderIds.has(orderIdB)
            }else
            {
                valueA = this._dataList.getObjectAt(indexA)[columnKey]
                valueB = this._dataList.getObjectAt(indexB)[columnKey]
            }
            let sortVal = 0;
            if (valueA > valueB) {
                sortVal = 1;
            }
            if (valueA < valueB) {
                sortVal = -1;
            }
            if (sortVal !== 0 && sortDir === SortTypes.ASC) {
                sortVal = sortVal * -1;
            }

            return sortVal;
        });

        this._defaultSortIndexes = sortIndexes.slice()

        this.setState({
            sortedDataList: new DataListWrapper(this._defaultSortIndexes, this._dataList) ,
            colSortDirs: {
                [columnKey]: sortDir,
            },
        });
    }  

   getTableDataList (orders){
       let orderList = []
        orders.map(({ _id,  order_status, createdAt, total_bill_amount, customer_details  }) => {
            orderList.push(
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
        return new DataListStore (orderList)
   }

   componentWillMount() {
        /* Create a new property to save checked boxes */  
        this.selectedOrderIds = new Set()
    }

   handleGenerateBills(){
       const orderIds = [...this.selectedOrderIds]
        getOrders.call( { orderIds } ,(error, orders)=>{
            const confirmation = 'pdf document containing the Bills has been generated successfully!'
            if (error) {
                Bert.alert(error.reason, 'danger')
            } else {
                let genOrderBills = new GenerateOrderBills();
                genOrderBills.PrintOrderBills(orders)
                Bert.alert(confirmation, 'success')
            }
        })   
   }

   handleRowClick(e, rowIndex){
       e.preventDefault()
       //browserHistory.push("/order/" + this.state.sortedDataList[rowIndex].id)
       browserHistory.push("/order/" + this.state.sortedDataList.getObjectAt(rowIndex)["id"])
   } 

   handleCheckBoxClick(e, rowIndex){
        const orderId = this.state.sortedDataList.getObjectAt(rowIndex)["id"]
        //const orderId = this._dataList.getObjectAt(rowIndex)["id"]
        if (this.selectedOrderIds.has(orderId)) {
            this.selectedOrderIds.delete(orderId)
        } else {
            this.selectedOrderIds.add(orderId)
        }

        let sortedDataList = _.clone(this.state.sortedDataList)
        sortedDataList.getObjectAt(rowIndex)["selected"] = !sortedDataList.getObjectAt(rowIndex)["selected"]
        //this._dataList.getObjectAt(rowIndex)["selected"] = !this._dataList.getObjectAt(rowIndex)["selected"]
        this.setState({
            sortedDataList: sortedDataList,
        });

      /*  let sortedDataList = this.state.sortedDataList
        sortedDataList.getObjectAt(rowIndex).selected = !sortedDataList.getObjectAt(rowIndex).selected

        this.setState(
            {sortedDataList}
        )*/
   }

   componentWillReceiveProps(nextProps){
     if (nextProps.orders != this.props.orders){

        let sortedDataList = this.getsortedDataList(nextProps.orders)   
        this.setState ({sortedDataList})
     }
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
                    <Col xs = { 12 }>
                        <UpdateStatusButtons title = {"Update Status"} 
                        statuses = {constants.OrderStatus} onSelectCallBack= {this.handleStatusUpdate}/>
                        <Button
                        bsStyle="default"
                        onClick={ this.handleGenerateBills }>
                        Generate Bills
                        </Button>
                    </Col>
                    <OrderTable  
                        dataList = { this.state.sortedDataList } 
                        dynamicWidth = { this.props.containerWidth }  
                        onRowClickCallBack = { this.handleRowClick }  
                        onChecked = { this.handleCheckBoxClick } 
                        colSortDirs = { this.state.colSortDirs }  
                        onSortChangeCallBack = { this._onSortChange }
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
