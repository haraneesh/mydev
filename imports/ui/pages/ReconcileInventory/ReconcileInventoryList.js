import React from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';
import Loading from '../../components/Loading/Loading';
import constants from '../../../modules/constants';
import ReconcileInventory from '../../../api/ReconcileInventory/ReconcileInventory';
import ReconcileInventoryListMain from '../../components/ReconcileInventory/ReconcileInventoryListMain';

const reactVar = new ReactiveVar(
  {
    limit: constants.InfiniteScroll.DefaultLimitOrders,
    sortBy: { createdAt: constants.Sort.DESCENDING },
    skip: 0,
  },
);

const prevPage = () => {
  const reactVarTemp = reactVar.get();
  if (reactVarTemp.skip <= 0) {
    reactVarTemp.skip = 0;
  } else {
    reactVarTemp.skip -= 1;
  }
  reactVar.set(reactVarTemp);
};

const nextPage = () => {
  const reactVarTemp = reactVar.get();
  reactVarTemp.skip += 1;
  reactVar.set(reactVarTemp);
};

const ReconcileInventoryList = ({
  loading, reconciledList, count, page,
}) => (!loading ? (
  <div className="ReconcileInventory">
    <div className="py-4 clearfix">
      <h3 className="pull-left">Inventory Reconciled Reports</h3>
    </div>
    <Row className="bg-body m-2 p-2 entry">
      <ReconcileInventoryListMain reconciledList={reconciledList} />
    </Row>
    <Row className="p-2">
      { page > 0 && (
      <Button size="sm" onClick={prevPage}>
        &larr; Previous Page
      </Button>
      )}
      { count > 0 && (
      <Button size="sm" onClick={nextPage}>
        Next Page &rarr;
      </Button>
      )}
    </Row>
  </div>
) : <Loading />);

ReconcileInventoryList.propTypes = {
  loading: PropTypes.bool.isRequired,
  reconciledList: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const reactVarTemp = reactVar.get();
  const subscription = Meteor.subscribe('reconcileInventory.list', {
    sort: reactVarTemp.sortBy,
    limit: reactVarTemp.limit,
    skip: reactVarTemp.skip,
  });

  const cursor = ReconcileInventory.find({}, {
    sort: reactVarTemp.sortBy,
    limit: reactVarTemp.limit,
    skip: reactVarTemp.skip,
  });

  return {
    loading: !subscription.ready(),
    reconciledList: cursor && cursor.fetch(),
    count: cursor.count(),
    page: reactVarTemp.skip,
  };
})(ReconcileInventoryList);
