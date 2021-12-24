import React from 'react';
import PropTypes from 'prop-types';
import { Panel } from 'react-bootstrap';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Loading from '../../components/Loading/Loading';
import { getDayWithoutTime } from '../../../modules/helpers';
import ProductsCollection from '../../../api/Products/Products';
import ReconcileInventoryMain from '../../components/ReconcileInventory/ReconcileInventoryMain';

const ReconcileInventory = ({ loading, products }) => (!loading ? (
  <div className="ReconcileInventory">
    <div className="page-header clearfix">
      <h2 className="pull-left">Reconcile Products for {getDayWithoutTime()}</h2>
    </div>
    <Panel className="entry">
      <ReconcileInventoryMain products={products} />
    </Panel>
  </div>
) : <Loading />);

ReconcileInventory.propTypes = {
  loading: PropTypes.bool.isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe('products.listAvailableToOrder');
  return {
    loading: !subscription.ready(),
    products: ProductsCollection.find().fetch(),
  };
})(ReconcileInventory);
