import React from 'react';
import PropTypes from 'prop-types';
import OrderMain from '../../../components/Orders/OrderMain/OrderMain';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import DocumentsCollection from '../../../../api/Documents/Documents';
import Loading from '../../../components/Loading/Loading';

const PlaceNewOrder = ({ loading, prevOrderDetails, match, history }) => (!loading ? (
  <div className="Documents">
    <div className="page-header clearfix">
      <h4 className="pull-left">Welcome</h4>
    </div>
  </div>
) : <Loading />);

PlaceNewOrder.propTypes = {
  loading: PropTypes.bool.isRequired,
  prevOrderDetails: PropTypes.arrayOf(PropTypes.object).isRequired,
  match: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default createContainer(() => {
  const subscription = Meteor.subscribe('SuggestedOrderDetailsCollection');
  return {
    loading: !subscription.ready(),
    prevOrderDetails: ProductRecommendationsCollection.find().fetch(),
  };
}, PlaceNewOrder);
