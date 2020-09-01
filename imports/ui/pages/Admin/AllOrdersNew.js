/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role, jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import Pagination from 'react-js-pagination';
import { Row, Col } from 'react-bootstrap';
import constants from '../../../modules/constants';
import ManageAllOrders from '../../components/ProductsAdmin/ManageAllOrders';
import { SortTypes } from '../../components/Common/ShopTableCells';
import { Orders } from '../../../api/Orders/Orders';

const FIRSTPAGE = 1;
const NUMBEROFROWS = 100;
const reactVar = new ReactiveVar(
  {
    isWholeSale: false,
    sortBy: { createdAt: constants.Sort.DESCENDING },
    currentPage: FIRSTPAGE,
    limit: NUMBEROFROWS,
  },
);

class AllOrders extends React.Component {
  constructor(props) {
    super(props);
    this.colSortDirs = { date: SortTypes.DESC };
    this.state = {
      total: -1,
    };
    autoBind(this);
  }

  handlePageChange(pageNumber) {
    const prevValue = reactVar.get();
    reactVar.set({
      ...prevValue,
      currentPage: pageNumber,
    });
  }

  componentDidUpdate(previousProps) {
    if (this.props.currentPage !== previousProps.currentPage || this.state.total === -1) {
      this.fetchOrderCount();
    }
  }

  fetchOrderCount(search) {
    Meteor.call('admin.fetchOrderCount', (error, response) => {
      if (error) {
        Bert.alert(error.reason, 'danger');
      } else {
        this.setState({ ...response });
      }
    });
  }

  changeSortOptions(columnKey, sortDir) {
    const sortDirection = (sortDir === SortTypes.DESC) ? constants.Sort.DESCENDING : constants.Sort.ASCENDING;
    let sortBy;

    switch (columnKey) {
      case 'whMobileNum':
        sortBy = { 'customer_details.mobilePhone': sortDirection };
        break;
      case 'name':
        sortBy = { 'customer_details.name': sortDirection };
        break;
      case 'amount':
        sortBy = { total_bill_amount: sortDirection };
        break;
      case 'status':
        sortBy = { order_status: sortDirection };
        break;
      default:
        sortBy = { createdAt: sortDirection };
        break;
    }

    this.colSortDirs = {
      [columnKey]: sortDir,
    };

    const prevValue = reactVar.get();
    reactVar.set({
      ...prevValue,
      currentPage: FIRSTPAGE,
      sortBy,
    });
  }

  onRadioClick(e) {
    const prevValue = reactVar.get();
    if (e.target.value === 'whSale') {
      reactVar.set({
        ...prevValue,
        currentPage: FIRSTPAGE,
        isWholeSale: true,
      });
    } else {
      reactVar.set({
        ...prevValue,
        currentPage: FIRSTPAGE,
        isWholeSale: false,
      });
    }
  }

  selectView() {
    const { isWholeSale } = reactVar.get();
    return (
      <div className="panel panel-body form-group form-inline" style={{ textAlign: 'center' }}>
        <label className="radio-inline form-inline" htmlFor="retail" style={{ borderWidth: '0px' }}>
          <input type="radio" id="retail" name="orderView" value="retail" onClick={this.onRadioClick} checked={(!isWholeSale) ? 'checked' : ''} />
          Retail Orders
        </label>
        <label className="radio-inline form-control" htmlFor="whSale" style={{ borderWidth: '0px' }}>
          <input type="radio" id="whSale" name="orderView" value="whSale" onClick={this.onRadioClick} checked={(isWholeSale) ? 'checked' : ''} />
          WholeSale Orders
        </label>
      </div>
    );
  }

  render() {
    const { orders, history } = this.props;
    const { currentPage, limit, isWholeSale } = reactVar.get();
    return (

      <div className="AllOrders">
        <Row>
          <Col xs={12}>
            <h3 className="page-header">All Orders</h3>

            {this.selectView()}

            <ManageAllOrders
              history={history}
              orders={orders}
              changeSortOptions={this.changeSortOptions}
              colSortDirs={this.colSortDirs}
              isWholeSale={isWholeSale}
            />
          </Col>
        </Row>
        <Pagination
          activePage={currentPage}
          itemsCountPerPage={limit}
          totalItemsCount={this.state.total}
          pageRangeDisplayed={10}
          onChange={this.handlePageChange}
        />

      </div>
    );
  }
}

AllOrders.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  currentPage: PropTypes.number.isRequired,
};

export default withTracker((args) => {
  const {
    currentPage, limit, sortBy, isWholeSale,
  } = reactVar.get();

  const skip = (currentPage * limit) - limit;
  const subscriptionsReady = [
    Meteor.subscribe('orders.list', {
      isWholeSale,
      sort: sortBy,
      limit,
      skip,
    })].every((subscription) => subscription.ready());

  const cursor = Orders.find({}, { sort: sortBy });

  return {
    orders: cursor && cursor.fetch(),
    currentPage,
  };
})(AllOrders);
