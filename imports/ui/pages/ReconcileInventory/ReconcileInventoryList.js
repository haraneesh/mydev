import React from 'react';
import PropTypes from 'prop-types';
import { Panel, Pager } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';
import Loading from '../../components/Loading/Loading';
import { getDayWithoutTime } from '../../../modules/helpers';
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

const nextPage = () => {
    alert('here');
    const reactVarTemp = reactVar.get();
    reactVarTemp.skip = reactVarTemp.skip + 1; 
    reactVar.set(reactVarTemp);
}

const ReconcileInventoryList = ({ loading, reconciledList, count, page }) => (!loading ? (
  <div className="ReconcileInventory">
    <div className="page-header clearfix">
      <h3 className="pull-left">Inventory Reconciled Reports</h3>
    </div>
    <Panel className="entry">
     <ReconcileInventoryListMain reconciledList={reconciledList} />
    </Panel>
    <Pager>
    { page > 0 && ( <Pager.Item previous href="#">
        &larr; Previous Page
        </Pager.Item>)
    }
    { count > 0  && (<Pager.Item next href="#" onClick={nextPage}>
        Next Page &rarr;
        </Pager.Item>)
    }
</Pager>;
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
  const subscription = Meteor.subscribe('reconcileInventory.list',{
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