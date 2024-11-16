// eslint-disable-next-line max-classes-per-file
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import React from 'react';
import autoBind from 'react-autobind/lib/autoBind';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import Dropdown from 'react-bootstrap/Dropdown';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import { toast } from 'react-toastify';
import handleMethodException from '/imports/modules/handle-method-exception';
import {
  getOrders,
  getProductQuantityForOrderAwaitingFullFillment,
  getProductQuantityForOrderAwaitingFullFillmentNEW,
  updateExpectedDeliveryDate,
  updateOrderStatus,
} from '../../../api/Orders/methods';
import constants from '../../../modules/constants';
import generateOPL from '../../../reports/client/GenerateOPL';
import generateOPLByProductType from '../../../reports/client/GenerateOPLByProductType';
import generateOrderBills from '../../../reports/client/GenerateOrderBills';
import exportPOsAsCSV from '../../../reports/client/GenerateWholeSalePOs';
import exportPackingPOsAsCSV from '../../../reports/client/GenerateWholeSalePackingPOs';
import {
  AmountCell,
  DataListStore,
  DateCell,
  OrderStatusCell,
  PorterStatusCell,
  RowSelectedCell,
  SortHeaderCell,
  SortTypes,
  TextCell,
} from '../Common/ShopTableCells';
import Icon from '../Icon/Icon';
import PorterApp from './PorterApp';

const UpdateStatusButtons = ({
  title,
  statuses,
  onSelectCallBack,
  ignoreStatuses,
}) => {
  const rows = [];
  _.each(statuses, (value, key) => {
    if (!ignoreStatuses[key]) {
      rows.push(
        <Dropdown.Item
          href="#"
          onClick={() => {
            onSelectCallBack(key);
          }}
        >
          {`to ${value.display_value}`}
        </Dropdown.Item>,
      );
    }
  });
  return (
    <Dropdown as={ButtonGroup} className="m-2">
      <Dropdown.Toggle size="sm" id="updateButtons">
        {title}
      </Dropdown.Toggle>
      <Dropdown.Menu>{rows}</Dropdown.Menu>
    </Dropdown>
  );
};

const writeRows = ({
  dataList,
  onChecked,
  onRowClickCallBack,
  onPorterStatusClickCallBack,
  onPorterAppAction,
}) => {
  const rowList = [];
  rowList.push(<div />);
  for (let index = 0; index < dataList.getSize(); index += 1) {
    rowList.push(
      <tr>
        {
          <RowSelectedCell
            rowIndex={index}
            data={dataList}
            onChecked={onChecked}
            columnKey="selected"
          />
        }
        {
          <OrderStatusCell
            rowIndex={index}
            data={dataList}
            columnKey="status"
          />
        }
        {<TextCell rowIndex={index} data={dataList} columnKey="name" />}
        {<TextCell rowIndex={index} data={dataList} columnKey="whMobileNum" />}
        {<DateCell rowIndex={index} data={dataList} columnKey="date" />}
        {<AmountCell rowIndex={index} data={dataList} columnKey="amount" />}
        {
          <PorterStatusCell
            rowIndex={index}
            data={dataList}
            onClick={onPorterStatusClickCallBack}
            columnKey="porterOrderStatus"
          />
        }
        {
          <td>
            <Button
              size="sm"
              variant="link"
              onClick={(e) => {
                onRowClickCallBack(e, index);
              }}
              className="w-100 btn-block"
            >
              <Icon icon="more_vert" type="mt" />
            </Button>
          </td>
        }
      </tr>,
    );
  }
  return rowList;
};

const OrderTable = ({
  dataList,
  onChecked,
  colSortDirs,
  onRowClickCallBack,
  onSortChangeCallBack,
  onPorterStatusClickCallBack,
  onPorterAppAction,
}) => (
  <Table striped bordered hover responsive>
    <thead>
      <tr>
        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.selected}
          cellName="#"
          columnKey="selected"
        />

        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.status}
          cellName="Status"
          columnKey="status"
        />

        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.name}
          cellName="Name"
          columnKey="name"
        />

        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.whMobileNum}
          cellName="Mobile Number"
          columnKey="whMobileNum"
        />

        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.date}
          cellName="Delivery Date"
          columnKey="date"
        />

        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.amount}
          cellName="Bill Amount"
          columnKey="amount"
        />

        <SortHeaderCell
          onSortChange={onSortChangeCallBack}
          sortDir={colSortDirs.amount}
          cellName="Porter Order"
          columnKey="porterOrderStatus"
        />

        <th />
      </tr>
    </thead>
    <tbody>
      {writeRows({
        dataList,
        onChecked,
        onRowClickCallBack,
        onPorterStatusClickCallBack,
        onPorterAppAction,
      })}
    </tbody>
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
    return this._data.getObjectAt(this._indexMap[index]);
  }
}

class ManageAllOrders extends React.Component {
  constructor(props) {
    super(props);

    this.reportPopupAllowMsg =
      'Requested report has generated successfully. If you do not see it, please ensure that you have disabled pop up blocker for this website.';

    this._dataList = this.getTableDataList(this.props.orders);

    this._defaultSortIndexes = [];
    const size = this._dataList.getSize();
    for (let index = 0; index < size; index++) {
      this._defaultSortIndexes.push(index);
    }

    this.state = {
      sortedDataList: new DataListWrapper(
        this._defaultSortIndexes,
        this._dataList,
      ),
      colSortDirs: this.props.colSortDirs || {},
      porterApp: {
        porterOrder: null,
        portAppShow: false,
      },
    };

    autoBind(this);
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

  onPorterStatusClickCallBack(order) {
    const mobileNumber = order.whMobileNum.toString();
    Meteor.call('users.find', { mobileNumber }, (error, user) => {
      if (error) {
        toast.error(error.reason);
      } else {
        this.setState({
          porterApp: {
            porterOrder: order,
            user,
            portAppShow: true,
          },
        });
      }
    });
  }

  onPorterAppAction(appAction) {
    if (appAction.action === 'cancel') {
      this.setState({
        porterApp: {
          porterOrder: null,
          portAppShow: false,
        },
      });
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
      sortedDataList: new DataListWrapper(
        this._defaultSortIndexes,
        this._dataList,
      ),
      colSortDirs: {
        [columnKey]: sortDir,
      },
    });
  }

  getTableDataList(orders) {
    const orderList = [];
    orders.map(
      ({
        _id,
        order_status,
        expectedDeliveryDate,
        total_bill_amount,
        customer_details,
        porterOrderStatus,
      }) => {
        orderList.push({
          id: _id,
          status: order_status,
          date: expectedDeliveryDate,
          amount: total_bill_amount,
          name: customer_details.name,
          whMobileNum: customer_details.mobilePhone,
          porterOrderStatus,
          selected: false,
        });
      },
    );
    return new DataListStore(orderList);
  }

  resetSelectedOrderIds() {
    /* Create a new property to save checked boxes */
    this.selectedOrderIds = new Set();
  }

  handleGenerateOPL() {
    getProductQuantityForOrderAwaitingFullFillment.call(
      { isWholeSale: this.props.isWholeSale },
      (error, aggr) => {
        if (error) {
          toast.error(error.reason);
        } else {
          generateOPL(aggr, this.props.isWholeSale);
          toast.info(this.reportPopupAllowMsg);
        }
      },
    );
  }

  handleGenerateOPLNew() {
    getProductQuantityForOrderAwaitingFullFillmentNEW.call(
      { isWholeSale: this.props.isWholeSale },
      (error, aggr) => {
        if (error) {
          toast.error(error.reason);
        } else {
          generateOPLByProductType(aggr, this.props.isWholeSale);
          toast.info(this.reportPopupAllowMsg);
        }
      },
    );
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
    Meteor.call(
      'admin.fetchDetailsForPO',
      { orderIds: selectedWholeSaleOrderIds, includeBuyer: false },
      (error, poDetails) => {
        if (error) {
          toast.error(error.reason);
        } else {
          exportPOsAsCSV(poDetails);
          toast.success('PO Details Downloaded');
        }
      },
    );
  }

  handleGeneratePackingPOs() {
    const selectedWholeSaleOrderIds = [...this.selectedOrderIds];
    Meteor.call(
      'admin.fetchDetailsForPO',
      { orderIds: selectedWholeSaleOrderIds, includeBuyer: true },
      (error, poDetails) => {
        if (error) {
          toast.error(error.reason);
        } else {
          exportPackingPOsAsCSV(poDetails);
          toast.success('PO Details Downloaded');
        }
      },
    );
  }

  handleRowClick(e, rowIndex) {
    e.preventDefault();
    // this.props.history.push("/order/" + this.state.sortedDataList[rowIndex].id)
    this.props.history.push(
      `/order/${this.state.sortedDataList.getObjectAt(rowIndex).id}`,
    );
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
    sortedDataList.getObjectAt(rowIndex).selected =
      !sortedDataList.getObjectAt(rowIndex).selected;
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
      toast.error(
        `Please select order(s) to update the delivery date to ${constants.DaysFromTodayForward[eventKey].display_value}`,
      );
    } else {
      const orderIds = [...this.selectedOrderIds];
      const incrementDeliveryDateBy =
        constants.DaysFromTodayForward[eventKey].increment;
      updateExpectedDeliveryDate.call(
        { orderIds, incrementDeliveryDateBy },
        (error) => {
          const confirmation = `Delivery date of selected order(s) have been updated to ${
            constants.DaysFromTodayForward[eventKey].display_value
          } successfully!`;
          if (error) {
            toast.error(error.reason);
          } else {
            this.resetSelectedOrderIds();
            toast.success(confirmation);
          }
        },
      );
    }
  }

  handleStatusUpdate(eventKey) {
    if (this.selectedOrderIds.length <= 0) {
      toast.error(
        `Please select order(s) to update the status to ${constants.OrderStatus[eventKey].display_value}`,
      );
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
        {!!this.state.porterApp.portAppShow && (
          <PorterApp
            order={this.state.porterApp.porterOrder}
            user={this.state.porterApp.user}
            passActionBack={this.onPorterAppAction}
          />
        )}
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
                className="m-2"
                onClick={this.handleGenerateBills}
              >
                Generate Bills
              </Button>
            )}

            {!this.props.isWholeSale && (
              <Button
                size="sm"
                className="m-2"
                onClick={this.handleGenerateOPL}
              >
                Generate OPL
              </Button>
            )}

            {!this.props.isWholeSale && (
              <Button
                size="sm"
                className="m-2"
                onClick={this.handleGenerateOPLNew}
              >
                Generate OPL New
              </Button>
            )}

            {!!this.props.isWholeSale && (
              <Button
                variant="success"
                size="sm"
                className="m-2"
                onClick={this.handleGeneratePackingPOs}
              >
                Export Packing POs
              </Button>
            )}

            {!!this.props.isWholeSale && (
              <Button
                variant="success"
                size="sm"
                className="m-2"
                onClick={this.handleGeneratePOsAsCSV}
              >
                Export POs
              </Button>
            )}

            {!this.props.isWholeSale && (
              <Button size="sm" className="m-2" href="/reconcileInventory">
                Daily Inventory Update
              </Button>
            )}
          </Col>
        </Row>
        <Row>
          <OrderTable
            dataList={this.state.sortedDataList}
            onRowClickCallBack={this.handleRowClick}
            onChecked={this.handleCheckBoxClick}
            colSortDirs={this.state.colSortDirs}
            onSortChangeCallBack={this.onSortChange}
            onPorterStatusClickCallBack={this.onPorterStatusClickCallBack}
            onPorterAppAction={this.onPorterAppAction}
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

export default ManageAllOrders;
// export default Dimensions()(ManageAllOrders);
