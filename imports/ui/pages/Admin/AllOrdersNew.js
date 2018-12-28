/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role, jsx-a11y/anchor-is-valid */

import React from 'react';
import PropTypes from 'prop-types';
import autoBind from 'react-autobind';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'meteor/react-meteor-data';
import { Bert } from 'meteor/themeteorchef:bert';
import Pagination from "react-js-pagination";
import { Row, Col } from 'react-bootstrap';
import constants from '../../../modules/constants';
import ManageAllOrders from '../../components/ProductsAdmin/ManageAllOrders';
import { SortTypes } from '../../components/Common/ShopTableCells';
import OrdersCollection from '../../../api/Orders/Orders';

const FIRSTPAGE = 1;
const NUMBEROFROWS = 100;
const reactVar = new ReactiveVar(
    {
      sortBy: { createdAt: constants.Sort.DESCENDING },
      currentPage: FIRSTPAGE,
      limit: NUMBEROFROWS,
    },
);

class AllOrders extends React.Component {
  constructor(props) {
    super(props);
    this.colSortDirs = { date: SortTypes.DESC };
    this.state ={
        total:-1,
    }
    autoBind(this);
  }

  handlePageChange(pageNumber){
    let {sortBy, limit} = reactVar.get();
    reactVar.set({
        sortBy,
        limit,
        currentPage:  pageNumber
      });
  }

  componentDidUpdate(previousProps) {
    if (this.props.currentPage !== previousProps.currentPage || this.state.total === -1){
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

    let {limit} = reactVar.get();
    reactVar.set({
        currentPage: FIRSTPAGE,
        limit,
        sortBy,
      });
  }


  render() {
    const { loading, orders, history } = this.props;
    let {currentPage,limit} = reactVar.get();
    return (
      //!loading ? (
      <div className="AllOrders">
         <Row>
          <Col xs={12}>
            <h3 className="page-header">All Orders</h3>
            <ManageAllOrders
              history={history}
              orders={orders}
              changeSortOptions={this.changeSortOptions}
              colSortDirs={this.colSortDirs}
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
    //): <Loading />
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
    const {currentPage, limit, sortBy} = reactVar.get();
    
    const skip = (currentPage * limit) - limit;
    const subscriptionsReady = [
        Meteor.subscribe('orders.list', {
          sort: sortBy,
          limit: limit,
          skip: skip,
        },
      )].every(subscription => subscription.ready());
    
      const cursor = OrdersCollection.find({},{sort: sortBy} );
    
      return {
        loading: !subscriptionsReady,
        orders: cursor && cursor.fetch(),
        currentPage: currentPage,
      };

  })(AllOrders);
  