// eslint-disable-next-line max-classes-per-file
import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Dropdown from 'react-bootstrap/Dropdown';
import autoBind from 'react-autobind/lib/autoBind';
import { Table, Column } from 'fixed-data-table-2';
import Dimensions from 'react-dimensions';
import { toast } from 'react-toastify';
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

  <Dropdown>
    <Dropdown.Toggle variant="success" id="dropdown-basic">
      Dropdown Button
    </Dropdown.Toggle>

    <Dropdown.Menu>
      <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
      <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
      <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>;

const UpdateStatusButtons = ({
  title, statuses, onSelectCallBack, ignoreStatuses,
}) => {
  const rows = [];
  _.each(statuses, (value, key) => {
    if (!ignoreStatuses[key]) {
      rows.push(
        <Dropdown.Item href="#" onClick={onSelectCallBack}>
          {`to ${value.display_value}`}
        </Dropdown.Item>,
      );
    }
  });
  return (
    <Dropdown className="btn btn-sm">
      <Dropdown.Toggle size="sm" id="split-button-basic-status">
        {title}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {rows}
      </Dropdown.Menu>
    </Dropdown>
  );
};

const OrderTable = ({
  dataList, dynamicWidth, onChecked, colSortDirs, onRowClickCallBack, onSortChangeCallBack,
}) => (
  <Table
    rowHeight={50}
    headerHeight={50}
    rowsCount={dataList.getSize()}
    width={dynamicWidth}
    onRowClick={onRowClickCallBack}
    height={0}
  >
    <Column
      columnKey="selected"
      // header = { <Cell>Selected</Cell> }
      header={(
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.selected}
        >
          Selected
        </SortHeaderCell>
      )}
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
      header={(
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.status}
        >
          Status
        </SortHeaderCell>
      )}
    />
    <Column
      columnKey="name"
      header={(
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.name}
        >
          Name
        </SortHeaderCell>
      )}
      cell={<TextCell data={dataList} />}
      width={100}
      flexGrow={3}
    />
    <Column
      columnKey="whMobileNum"
      header={(
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.whMobileNum}
        >
          Mobile Number
        </SortHeaderCell>
      )}
      cell={<TextCell data={dataList} />}
      width={100}
      flexGrow={2}
    />
    <Column
      columnKey="date"
      header={(
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.date}
        >
          Delivery Date
        </SortHeaderCell>
      )}
      cell={<DateCell data={dataList} />}
      width={100}
      flexGrow={3}
    />
    <Column
      columnKey="amount"
      header={(
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.amount}
        >
          Bill Amount
        </SortHeaderCell>
      )}
      cell={<AmountCell data={dataList} />}
      width={100}
      flexGrow={2}
    />
    <Column
      columnKey="date"
      header={(
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.date}
        >
          Delivery Date
        </SortHeaderCell>
      )}
      cell={<DateCell data={dataList} />}
      width={100}
      flexGrow={3}
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
      let valueA;
      let valueB;

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
    orders.map(({
      _id, order_status, expectedDeliveryDate, total_bill_amount, customer_details,
    }) => {
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
        toast.error(error.reason);
      } else {
        generateOPL(aggr, this.props.isWholeSale);
        toast.info(this.reportPopupAllowMsg);
      }
    });
  }

  handleGenerateOPLNew() {
    getProductQuantityForOrderAwaitingFullFillmentNEW.call({ isWholeSale: this.props.isWholeSale }, (error, aggr) => {
      if (error) {
        toast.error(error.reason);
      } else {
        generateOPLByProductType(aggr, this.props.isWholeSale);
        toast.info(this.reportPopupAllowMsg);
      }
    });
  }

  handleGenerateBills() {
    const orderIds = [...this.selectedOrderIds];
    getOrders.call({ orderIds }, (error, orders) => {
      if (error) {
        toast.error(error.reason);
      } else {
        generateOrderBills(orders);
        toast.info(this.reportPopupAllowMsg);
      }
    });
  }

  handleGeneratePOsAsCSV() {
    const selectedWholeSaleOrderIds = [...this.selectedOrderIds];
    Meteor.call('admin.fetchDetailsForPO', { orderIds: selectedWholeSaleOrderIds, includeBuyer: false }, (error, poDetails) => {
      if (error) {
        toast.error(error.reason);
      } else {
        exportPOsAsCSV(poDetails);
        toast.success('PO Details Downloaded');
      }
    });
  }

  handleGeneratePackingPOs() {
    const selectedWholeSaleOrderIds = [...this.selectedOrderIds];

    Meteor.call('admin.fetchDetailsForPO', { orderIds: selectedWholeSaleOrderIds, includeBuyer: true }, (error, poDetails) => {
      if (error) {
        toast.error(error.reason);
      } else {
        exportPackingPOsAsCSV(poDetails);
        toast.success('PO Details Downloaded');
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
      toast.error(`Please select order(s) to update the delivery date to ${constants.DaysFromTodayForward[eventKey].display_value}`);
    } else {
      const orderIds = [...this.selectedOrderIds];
      const incrementDeliveryDateBy = constants.DaysFromTodayForward[eventKey].increment;
      updateExpectedDeliveryDate.call({ orderIds, incrementDeliveryDateBy }, (error) => {
        const confirmation = `Delivery date of selected order(s) have been updated to ${
          constants.DaysFromTodayForward[eventKey].display_value
        } successfully!`;
        if (error) {
          toast.error(error.reason);
        } else {
          this.resetSelectedOrderIds();
          toast.success(confirmation);
        }
      });
    }
  }

  handleStatusUpdate(eventKey) {
    if (this.selectedOrderIds.length <= 0) {
      toast.error(`Please select order(s) to update the status to ${constants.OrderStatus[eventKey].display_value}`);
    } else {
      const orderIds = [...this.selectedOrderIds];
      const updateToStatus = constants.OrderStatus[eventKey].name;
      updateOrderStatus.call({ orderIds, updateToStatus }, (error) => {
        const confirmation = `Status of selected order(s) have been updated to ${
          constants.OrderStatus[eventKey].display_value
        } successfully!`;
        if (error) {
          toast.error(error.reason);
        } else {
          this.resetSelectedOrderIds();
          toast.success(confirmation);
        }
      });
    }
  }

  render() {
    return (
      <div>
        <Row>
          <Col>
            <UpdateStatusButtons
              title="Update Status"
              statuses={constants.OrderStatus}
              onSelectCallBack={this.handleStatusUpdate}
              ignoreStatuses={{ Saved: constants.OrderStatus.Saved }}
            />
            <UpdateStatusButtons
              title="Change Delivery Date"
              statuses={constants.DaysFromTodayForward}
              onSelectCallBack={this.handleDeliveryDateUpdate}
              ignoreStatuses={{}}
            />
            {!this.props.isWholeSale && (
            <Button
              size="sm"
              onClick={this.handleGenerateBills}
            >
              Generate Bills
            </Button>
            )}

            {!this.props.isWholeSale && (
            <Button
              size="sm"
              className="ms-2"
              onClick={this.handleGenerateOPL}
            >
              Generate OPL
            </Button>
            )}

            {!this.props.isWholeSale && (
            <Button
              size="sm"
              className="ms-2"
              onClick={this.handleGenerateOPLNew}
            >
              Generate OPL New
            </Button>
            )}

            {!!this.props.isWholeSale && (
            <Button
              variant="success"
              size="sm"
              className="ms-2"
              onClick={this.handleGeneratePackingPOs}
            >
              Export Packing POs
            </Button>
            )}

            {!!this.props.isWholeSale && (
            <Button
              variant="success"
              size="sm"
              className="ms-2"
              onClick={this.handleGeneratePOsAsCSV}
            >
              Export POs
            </Button>
            )}

            {!this.props.isWholeSale && (
            <Button
              size="sm"
              className="ms-2"
              href="/reconcileInventory"
            >
              Daily Inventory Update
            </Button>
            )}
            <Button
              size="sm"
              className="ms-2"
              onClick={this.handlePorterConnect}
            >
              Show Porter App
            </Button>
          </Col>
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
