import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import RecommendationsCollection from '../../../../api/Recommendations/Recommendations';
import ProductLists from '../../../../api/ProductLists/ProductLists';
import Loading from '../../../components/Loading/Loading';
import ProductsOrderMain from '../../../components/Orders/ProductsOrderMain/ProductsOrderMain';


const PlaceNewOrder =
 ({ loading, dateValue, name, products, productListId, history }) => (!loading ? (<div className="OrderHomePage">

   <ProductsOrderMain
     products={products}
     history={history}
     productListId={productListId}
     name={name}
     dateValue={dateValue}
   />

 </div>) : <Loading />);

PlaceNewOrder.propTypes = {
  loading: PropTypes.bool.isRequired,
  products: PropTypes.arrayOf(PropTypes.object).isRequired,
  productListId: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  dateValue: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withTracker((args) => {
  // const recSubscription = Meteor.subscribe('recommendations.view');

  const prdSubscription = Meteor.subscribe('productOrderList.view', args.date);

  // const recommendations = RecommendationsCollection.find().fetch();

  const productList = ProductLists.findOne();
  const products = (productList) ? productList.products : [];
  const productListId = (productList) ? productList._id : '';


  return {
    // loading: !recSubscription.ready() || !prdSubscription.ready(),
    // recommendations,
    loading: !prdSubscription.ready(),
    productListId,
    products,
    name: args.name,
    history: args.history,
    orderId: args.match.id,
    dateValue: args.date,
  };
})(PlaceNewOrder);
