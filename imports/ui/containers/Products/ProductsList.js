import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Products from '../../api/Products/Products';
import { ProductsList } from '../components/Products/ProductsList';
import { Loading } from '../components/Loading/Loading';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('products');
  if (subscription.ready()) {
    const products = Products.find().fetch();
    onData(null, { products, history: params.history });
  }
};

export default composeWithTracker(composer, Loading)(ProductsList);
