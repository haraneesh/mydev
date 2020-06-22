import React from 'react';
import PropTypes from 'prop-types';
import { Row, SplitButton, MenuItem, Button, ButtonToolbar } from 'react-bootstrap';
import autoBind from 'react-autobind/lib/autoBind';
import { Table, Column } from 'fixed-data-table-2';
import Dimensions from 'react-dimensions';
import { Bert } from 'meteor/themeteorchef:bert';
import {
  DataListStore, SortTypes, SortHeaderCell, AmountCell, OrderStatusCell, RowSelectedCell,
  TextCell, DateCell,
} from '../Common/ShopTableCells';
import constants from '../../../modules/constants';
import {
  updateOrderStatus, getOrders, updateExpectedDeliveryDate,
  getProductQuantityForOrderAwaitingFullFillment,
  getProductQuantityForOrderAwaitingFullFillmentNEW,
}
  from '../../../api/Orders/methods';
import generateOrderBills from '../../../reports/client/GenerateOrderBills';
import generateOPL from '../../../reports/client/GenerateOPL';
import generateOPLByProductType from '../../../reports/client/GenerateOPLByProductType';
import exportPOsAsCSV from '../../../reports/client/GenerateWholeSalePOs';
import exportPackingPOsAsCSV from '../../../reports/client/GenerateWholeSalePackingPOs';

const UpdateStatusButtons = ({ title, statuses, onSelectCallBack, ignoreStatuses }) => {
  const rows = [];
  _.each(statuses, (value, key) => {
    if (!ignoreStatuses[key]) {
      rows.push(<MenuItem eventKey={value.name} onSelect={onSelectCallBack} >
        {`to ${value.display_value}`} </MenuItem>);
    }
  });
  return (
    <SplitButton bsSize="small" title={title} key="split-button-status-change" id={'split-button-basic-status'}>
      {rows}
    </SplitButton>
  );
};

const OrderTable = ({ dataList, dynamicWidth, onChecked, colSortDirs, onRowClickCallBack, onSortChangeCallBack }) => (
  <Table
    rowHeight={50}
    headerHeight={50}
    rowsCount={dataList.getSize()}
    width={dynamicWidth}
    onRowClick={onRowClickCallBack}
    height={5070}
  >
    <Column
      columnKey="selected"
      // header = { <Cell>Selected</Cell> }
      header={
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.selected}
        >
          Selected
        </SortHeaderCell>
      }
      cell={<RowSelectedCell data={dataList} onChecked={onChecked} />}
      flexGrow={1}
      width={50}
    />
    <Column
      columnKey="status"
      cell={<OrderStatusCell data={dataList} />}
      flexGrow={2}
      width={50}
      // header = { <Cell>Status</Cell> }
      header={
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.status}
        >
          Status
        </SortHeaderCell>
      }
    />
    <Column
      columnKey="name"
      header={
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.name}
        >
          Name
        </SortHeaderCell>
      }
      cell={<TextCell data={dataList} />}
      width={100}
      flexGrow={3}
    />
    <Column
      columnKey="whMobileNum"
      header={
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.whMobileNum}
        >
          Mobile Number
        </SortHeaderCell>
      }
      cell={<TextCell data={dataList} />}
      width={100}
      flexGrow={2}
    />
    <Column
      columnKey="date"
      header={
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.date}
        >
          Delivery Date
        </SortHeaderCell>
      }
      cell={<DateCell data={dataList} />}
      width={100}
      flexGrow={3}
    />
    <Column
      columnKey="amount"
      header={
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.amount}
        >
          Bill Amount
        </SortHeaderCell>
      }
      cell={<AmountCell data={dataList} />}
      width={100}
      flexGrow={2}
    />
  </Table>
);

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


class ManageAllOrders extends React.Component {
  constructor(props) {
    super(props);

    this.reportPopupAllowMsg = 'Requested report has generated successfully. If you do not see it, please ensure that you have disabled pop up blocker for this website.';

    this._dataList = this.getTableDataList(this.props.orders);

    this._defaultSortIndexes = [];
    const size = this._dataList.getSize();
    for (let index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }

    this.state = {
      sortedDataList: new DataListWrapper(this._defaultSortIndexes, this._dataList),
      colSortDirs: this.props.colSortDirs || {},
    };

    autoBind(this);
    /*
    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleCheckBoxClick = this.handleCheckBoxClick.bind(this);
    this.handleStatusUpdate = this.handleStatusUpdate.bind(this);
    this.onSortChange = this.onSortChange.bind(this);
    this.groupSelectedRowsInUI = this.groupSelectedRowsInUI.bind(this);
    this.handleGenerateBills = this.handleGenerateBills.bind(this);
    this.handleGenerateOPL = this.handleGenerateOPL.bind(this);
    this.handleGenerateOPLNew = this.handleGenerateOPLNew.bind(this);
    this.handleDeliveryDateUpdate = this.handleDeliveryDateUpdate.bind(this);
    */
  }

  UNSAFE_componentWillMount() {
    this.resetSelectedOrderIds();
  }

  onSortChange(columnKey, sortDir) {
    if (columnKey === 'selected') {
      this.groupSelectedRowsInUI(columnKey, sortDir);
    } else {
      this.props.changeSortOptions(columnKey, sortDir);
    }
  }

  groupSelectedRowsInUI(columnKey, sortDir) {
    const sortIndexes = this._defaultSortIndexes.slice();
    sortIndexes.sort((indexA, indexB) => {
      let valueA,
        valueB;

      const orderIdA = this._dataList.getObjectAt(indexA).id;
      const orderIdB = this._dataList.getObjectAt(indexB).id;
      valueA = this.selectedOrderIds.has(orderIdA);
      valueB = this.selectedOrderIds.has(orderIdB);

      let sortVal = 0;
      if (valueA > valueB) {
        sortVal = 1;
      }
      if (valueA < valueB) {
        sortVal = -1;
      }
      if (sortVal !== 0 && sortDir === SortTypes.ASC) {
        sortVal *= -1;
      }

      return sortVal;
    });

    this._defaultSortIndexes = sortIndexes.slice();

    this.setState({
      sortedDataList: new DataListWrapper(this._defaultSortIndexes, this._dataList),
      colSortDirs: {
        [columnKey]: sortDir,
      },
    });
  }

  getTableDataList(orders) {
    const orderList = [];
    orders.map(({ _id, order_status, expectedDeliveryDate, total_bill_amount, customer_details }) => {
      orderList.push(
        {
          id: _id,
          status: order_status,
          date: expectedDeliveryDate,
          amount: total_bill_amount,
          name: customer_details.name,
          whMobileNum: customer_details.mobilePhone,
          selected: false,
        },
      );
    });
    return new DataListStore(orderList);
  }

  resetSelectedOrderIds() {
    /* Create a new property to save checked boxes */
    this.selectedOrderIds = new Set();
  }


  handleGenerateOPL() {
    getProductQuantityForOrderAwaitingFullFillment.call({ isWholeSale: this.props.isWholeSale }, (error, aggr) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        generateOPL(aggr, this.props.isWholeSale);
        Bert.alert(this.reportPopupAllowMsg, 'info');
      }
    });
  }

  handleGenerateOPLNew() {
    getProductQuantityForOrderAwaitingFullFillmentNEW.call({ isWholeSale: this.props.isWholeSale }, (error, aggr) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        generateOPLByProductType(aggr, this.props.isWholeSale);
        Bert.alert(this.reportPopupAllowMsg, 'info');
      }
    });
  }

  handleGenerateBills() {
    const orderIds = [...this.selectedOrderIds];
    getOrders.call({ orderIds }, (error, orders) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        generateOrderBills(orders);
        Bert.alert(this.reportPopupAllowMsg, 'info');
      }
    });
  }

  handleGeneratePOsAsCSV() {
    const selectedWholeSaleOrderIds = [...this.selectedOrderIds];
    Meteor.call('admin.fetchDetailsForPO', { orderIds: selectedWholeSaleOrderIds, includeBuyer: false }, (error, poDetails) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        exportPOsAsCSV(poDetails);
        Bert.alert('PO Details Downloaded', 'success');
      }
    });

  }

  handleGeneratePackingPOs() {
    const selectedWholeSaleOrderIds = [...this.selectedOrderIds];

    Meteor.call('admin.fetchDetailsForPO', { orderIds: selectedWholeSaleOrderIds, includeBuyer: true }, (error, poDetails) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        exportPackingPOsAsCSV(poDetails);
        Bert.alert('PO Details Downloaded', 'success');
      }
    });

  }

  handleRowClick(e, rowIndex) {
    e.preventDefault();
    // this.props.history.push("/order/" + this.state.sortedDataList[rowIndex].id)
    this.props.history.push(`/order/${this.state.sortedDataList.getObjectAt(rowIndex).id}`);
  }

  handleCheckBoxClick(e, rowIndex) {
    const orderId = this.state.sortedDataList.getObjectAt(rowIndex).id;
    // const orderId = this._dataList.getObjectAt(rowIndex)["id"]
    if (this.selectedOrderIds.has(orderId)) {
      this.selectedOrderIds.delete(orderId);
    } else {
      this.selectedOrderIds.add(orderId);
    }

    // const sortedDataList = _.clone(this.state.sortedDataList);
    const sortedDataList = Object.create(this.state.sortedDataList);
    sortedDataList.getObjectAt(rowIndex).selected = !sortedDataList.getObjectAt(rowIndex).selected;
    // this._dataList.getObjectAt(rowIndex)["selected"] = !this._dataList.getObjectAt(rowIndex)["selected"]
    this.setState({
      sortedDataList,
    });

    /*  let sortedDataList = this.state.sortedDataList
      sortedDataList.getObjectAt(rowIndex).selected = !sortedDataList.getObjectAt(rowIndex).selected

      this.setState(
          {sortedDataList}
      ) */
  }

  getsortedDataList(orders) {
    this._dataList = this.getTableDataList(orders);

    this._defaultSortIndexes = [];
    const size = this._dataList.getSize();
    for (let index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }
    return new DataListWrapper(this._defaultSortIndexes, this._dataList);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.orders !== this.props.orders) {
      const sortedDataList = this.getsortedDataList(nextProps.orders);
      this.setState({
        sortedDataList,
        colSortDirs: nextProps.colSortDirs || {},
      });
    }
  }

  handleDeliveryDateUpdate(eventKey) {
    if (this.selectedOrderIds.length <= 0) {
      Bert.alert(`Please select order(s) to update the delivery date to ${constants.DaysFromTodayForward[eventKey].display_value}`,
        'danger');
    } else {
      const orderIds = [...this.selectedOrderIds];
      const incrementDeliveryDateBy = constants.DaysFromTodayForward[eventKey].increment;
      updateExpectedDeliveryDate.call({ orderIds, incrementDeliveryDateBy }, (error) => {
        const confirmation = `Delivery date of selected order(s) have been updated to ${
          constants.DaysFromTodayForward[eventKey].display_value
          } successfully!`;
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          this.resetSelectedOrderIds();
          Bert.alert(confirmation, 'success');
        }
      });
    }
  }

  handleStatusUpdate(eventKey) {
    if (this.selectedOrderIds.length <= 0) {
      Bert.alert(`Please select order(s) to update the status to ${constants.OrderStatus[eventKey].display_value}`,
        'danger');
    } else {
      const orderIds = [...this.selectedOrderIds];
      const updateToStatus = constants.OrderStatus[eventKey].name;
      updateOrderStatus.call({ orderIds, updateToStatus }, (error) => {
        const confirmation = `Status of selected order(s) have been updated to ${
          constants.OrderStatus[eventKey].display_value
          } successfully!`;
        if (error) {
          Bert.alert(error.reason, 'danger');
        } else {
          this.resetSelectedOrderIds();
          Bert.alert(confirmation, 'success');
        }
      });
    }
  }

  render() {
    return (
      <div>
        <Row>
          <ButtonToolbar >

            <UpdateStatusButtons
              title={'Update Status'}
              statuses={constants.OrderStatus}
              onSelectCallBack={this.handleStatusUpdate}
              ignoreStatuses={{ Saved: constants.OrderStatus.Saved }}
            />
            <UpdateStatusButtons
              title={'Change Delivery Date'}
              statuses={constants.DaysFromTodayForward}
              onSelectCallBack={this.handleDeliveryDateUpdate}
              ignoreStatuses={{}}
            />
            {!this.props.isWholeSale && (<Button
              bsStyle="default"
              bsSize="small"
              onClick={this.handleGenerateBills}
            >
              Generate Bills
            </Button>)}

            {!this.props.isWholeSale && (<Button
              bsStyle="default"
              bsSize="small"
              onClick={this.handleGenerateOPL}
            >
              Generate OPL
            </Button>)}

            {!this.props.isWholeSale && (<Button
              bsStyle="default"
              bsSize="small"
              onClick={this.handleGenerateOPLNew}
            >
              Generate OPL New
            </Button>)}

            {!!this.props.isWholeSale && (<Button
              bsStyle="success"
              bsSize="small"
              onClick={this.handleGeneratePackingPOs}
            >
              Export Packing POs
            </Button>)}

            {!!this.props.isWholeSale && (<Button
              bsStyle="success"
              bsSize="small"
              onClick={this.handleGeneratePOsAsCSV}
            >
              Export POs
            </Button>)}

            {!this.props.isWholeSale && (<Button
              bsStyle="default"
              bsSize="small"
              href="/reconcileInventory"
            >
              Daily Inventory Update
            </Button>)}

          </ButtonToolbar>
        </Row>
        <Row>
          <OrderTable
            dataList={this.state.sortedDataList}
            dynamicWidth={this.props.containerWidth}
            dynamicHeight={this.props.containerHeight}
            onRowClickCallBack={this.handleRowClick}
            onChecked={this.handleCheckBoxClick}
            colSortDirs={this.state.colSortDirs}
            onSortChangeCallBack={this.onSortChange}
          />
        </Row>
      </div>
    );
  }
}

ManageAllOrders.propTypes = {
  orders: PropTypes.array,
  colSortDirs: PropTypes.object,
  containerWidth: PropTypes.number.isRequired,
  containerHeight: PropTypes.number.isRequired,
  history: PropTypes.object.isRequired,
  changeSortOptions: PropTypes.func.isRequired,
  isWholeSale: PropTypes.bool.isRequired,
};

export default Dimensions()(ManageAllOrders);
