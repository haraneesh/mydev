/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role, jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'meteor/react-meteor-data';
import { toast } from 'react-toastify';
import Pagination from 'react-js-pagination';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
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

  componentDidUpdate(previousProps) {
    if (this.props.currentPage !== previousProps.currentPage || this.state.total === -1) {
      this.fetchOrderCount();
    }
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
      case 'porterStatus':
        sortBy = { porterStatus: sortDirection };
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

  fetchOrderCount() {
    const { isWholeSale } = reactVar.get();

    Meteor.call('admin.fetchOrderCount',
      { isWholeSale },
      (error, response) => {
        if (error) {
          toast.error(error.reason);
        } else {
          this.setState({ ...response });
        }
      });
  }

  handlePageChange(pageNumber) {
    const prevValue = reactVar.get();
    reactVar.set({
      ...prevValue,
      currentPage: pageNumber,
    });
  }

  selectView() {
    const { isWholeSale } = reactVar.get();
    return (
      <div className="m-2 p-3 alert bg-body text-center">
        <div className="form-check form-check-inline">
          <input type="radio" id="retail" className="form-check-input" name="orderView" value="retail" onClick={this.onRadioClick} checked={(!isWholeSale) ? 'checked' : ''} />
          <label className="radio-inline form-check-inline form-check-label" htmlFor="retail" style={{ borderWidth: '0px' }}>
            Retail Orders
          </label>
        </div>

        <div className="form-check form-check-inline">
          <input type="radio" id="whSale" className="form-check-input" name="orderView" value="whSale" onClick={this.onRadioClick} checked={(isWholeSale) ? 'checked' : ''} />
          <label className="radio-inline form-check-inline form-check-label" htmlFor="whSale" style={{ borderWidth: '0px' }}>
            WholeSale Orders
          </label>
        </div>
      </div>
    );
  }

  render() {
    const { orders, history } = this.props;
    const { currentPage, limit, isWholeSale } = reactVar.get();
    return (

      <div className="AllOrders pb-4">
        <Row>
          <Col xs={12}>
            <h2 className="py-4 text-center">All Orders</h2>

            {this.selectView()}

            <ManageAllOrders
              history={history}
              orders={orders}
              changeSortOptions={this.changeSortOptions}
              colSortDirs={this.colSortDirs}
              isWholeSale={isWholeSale}
              pageChange={this.handlePageChange}
            />
          </Col>
        </Row>

        <Pagination
          itemClass="page-item"
          linkClass="page-link"
          activePage={currentPage}
          itemsCountPerPage={limit}
          totalItemsCount={this.state.total}
          pageRangeDisplayed={5}
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
