import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { withTracker } from 'meteor/react-meteor-data';
import { Row, Col } from 'react-bootstrap';
import Loading from '../../components/Loading/Loading';
import { getScrollPercent } from '../../../modules/infiniteScroll';
import constants from '../../../modules/constants';
import { Orders } from '../../../api/Orders/Orders';
import ManageAllOrders from '../../components/ProductsAdmin/ManageAllOrders';
import { SortTypes } from '../../components/Common/ShopTableCells';

// import ManageAllOrders from '../../containers/Admin/ManageAllOrders';

const reactVar = new ReactiveVar(
  {
    limit: constants.InfiniteScroll.DefaultLimitOrders,
    sortBy: { createdAt: constants.Sort.DESCENDING },
  },
);

class AllOrders extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.LimitIncrement = constants.InfiniteScroll.LimitIncrementOrders;
    this.colSortDirs = { date: SortTypes.DESC };
    this.handleScroll = this.handleScroll.bind(this);
    this.changeSortOptions = this.changeSortOptions.bind(this);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  shouldComponentUpdate(nextProps) {
    const { loading, count } = nextProps;
    if (loading || count === 0) {
      return false;
    }
    return count > 0;
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
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

    // alert(columnName + ' ' + sortOrder);
    // const sortingOrder = (sortOrder) ? constants.Sort.DESCENDING : constants.Sort.ASCENDING;
    this.colSortDirs = {
      [columnKey]: sortDir,
    };

    reactVar.set({
      limit: constants.InfiniteScroll.DefaultLimitOrders,
      sortBy,
    });
  }

  handleScroll(e) {
    if (e) e.preventDefault();
    const reactVarTemp = reactVar.get();
    if (getScrollPercent() > 50 && this.props.count >= reactVarTemp.limit) {
      reactVar.set({
        limit: reactVarTemp.limit + this.LimitIncrement,
        sortBy: reactVarTemp.sortBy,
      });
    }
  }

  render() {
    const { loading, orders, history } = this.props;
    return (
      !loading ? (
        <Row>
          <Col xs={12}>
            <h2 className="page-header">All Orders</h2>
            <ManageAllOrders
              history={history}
              orders={orders}
              changeSortOptions={this.changeSortOptions}
              colSortDirs={this.colSortDirs}
            />
          </Col>
        </Row>
      ) : <Loading />);
  }
}

AllOrders.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool.isRequired,
  history: PropTypes.object.isRequired,
  count: PropTypes.number.isRequired,
};

export default withTracker(() => {
  const reactVarTemp = reactVar.get();

  const subscriptionsReady = [
    Meteor.subscribe('orders.list', {
      sort: reactVarTemp.sortBy,
      limit: reactVarTemp.limit,
    },
    )].every(subscription => subscription.ready());

  const cursor = Orders.find({}, {
    sort: reactVarTemp.sortBy,
    limit: reactVarTemp.limit,
  });

  return {
    loading: !subscriptionsReady,
    orders: cursor && cursor.fetch(),
    count: cursor && cursor.count(),
  };
}) (AllOrders);
