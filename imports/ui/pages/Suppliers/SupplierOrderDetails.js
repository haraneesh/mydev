import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import SupplierOrderDetailsView from '../../components/SupplierOrderDetailsView/SupplierOrderDetailsView';
import SuppOrdersCollection from '../../../api/SupplierOrders/SupplierOrders';
import Loading from '../../components/Loading/Loading';

const SupplierOrderDetails = ({
  loading, suppOrder,
}) => (!loading ? (
  <div className="SupplierOrderDetail">
    <div className="page-header clearfix">
      <h4>{suppOrder.customer_details.name}</h4>
      <SupplierOrderDetailsView supplierOrder={suppOrder} />
    </div>
  </div>
) : <Loading />);

SupplierOrderDetails.propTypes = {
  loading: PropTypes.bool.isRequired,
  loggedInUser: PropTypes.string.isRequired,
  suppOrder: PropTypes.array.isRequired,
};

export default withTracker(({ match }) => {
  const subscription = Meteor.subscribe('supplierOrderDetails.view', {
    id: match.params.id,
  });

  const suppOrder = SuppOrdersCollection.findOne({ _id: match.params.id });

  return {
    loading: !subscription.ready(),
    suppOrder,
  };
})(SupplierOrderDetails);
