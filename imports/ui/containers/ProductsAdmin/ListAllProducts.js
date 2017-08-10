import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Products from '../../../api/Products/Products';
import ListAllProducts from '../../components/ProductsAdmin/ListAllProducts';
import { Loading } from '../../components/Loading/Loading';


const composer = (params, onData) => {
  const subscription = Meteor.subscribe('products.list');
  if (subscription.ready()) {
    const products = Products.find().fetch();
    onData(null, { products, productListId: params.productListId, history: params.history });
  }
};

export default composeWithTracker(composer, Loading)(ListAllProducts);
