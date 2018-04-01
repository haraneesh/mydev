import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Products from '../../api/Products/Products';
import SuppliersCollection from '../../api/Suppliers/Suppliers';

import { ProductsList } from '../components/Products/ProductsList';
import { Loading } from '../components/Loading/Loading';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('products');
  if (subscription.ready()) {
    const products = Products.find().fetch();

    const subscriptionToSuppliers = Meteor.subscribe('suppliers');
    if (subscriptionToSuppliers.ready()) {
      const suppliers = SuppliersCollection.find().fetch();
      onData(null, { products, suppliers, history: params.history });
    }
  }
};

export default composeWithTracker(composer, Loading)(ProductsList);
