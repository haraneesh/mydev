import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { Panel, Row, Col } from 'react-bootstrap';
import { withTracker } from 'meteor/react-meteor-data';
import OrderMain from '../../../components/Orders/OrderMain/OrderMain';
import RecommendationsCollection from '../../../../api/Recommendations/Recommendations';
import ProductsCollection from '../../../../api/Products/Products';
import Loading from '../../../components/Loading/Loading';

const PlaceNewOrder = ({ loading, name, recommendations, products, history }) => (!loading ? (
  <div className="OrderHomePage">
      <h3 className="page-header">
        { ( false ) ? 'Update Your Order' : ' Place Your Order' }
      </h3>
    <Panel>
      <Row>
        <Col xs={12}>
          <h4 className="text-center"> Welcome {name} </h4>
          <OrderMain recommendations = {recommendations} productsForOrder={products}/>
        </Col>
      </Row>
    </Panel>
  </div>
) : <Loading />);

PlaceNewOrder.propTypes = {
  loading: PropTypes.bool.isRequired,
  recommendations: PropTypes.arrayOf(PropTypes.object).isRequired,
  name: PropTypes.string.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker((args) => {
  const recSubscription = Meteor.subscribe('recommendations.view');

  const prdSubscription = Meteor.subscribe('productOrderList.view', args.date);

  const recommendations = RecommendationsCollection.find().fetch();
  const products = ProductsCollection.find().fetch();

  return {
    loading: !recSubscription.ready() || !prdSubscription.ready(),
    recommendations,
    products,
    name: args.name,
    history: args.history,
    orderId: args.match.id,
  };
})(PlaceNewOrder);
