import { Meteor } from 'meteor/meteor';
import { composeWithTracker } from 'react-komposer';
import Products from '../../../api/Products/Products';
import SuppliersCollection from '../../../api/Suppliers/Suppliers';
import ListAllProducts from '../../components/ProductsAdmin/ListAllProducts';
import { Loading } from '../../components/Loading/Loading';

const composer = (params, onData) => {
  const subscription = Meteor.subscribe('products.list');
  if (subscription.ready()) {
    const products = Products.find({}, { sort: { type: 1, name: 1 } }).fetch();
    const subscriptionToSuppliers = Meteor.subscribe('suppliers');
    if (subscriptionToSuppliers.ready()) {
      const suppliers = SuppliersCollection.find().fetch();
      // onData(null, { products, suppliers, history: params.history });
      onData(null, { products, suppliers, productListId: params.productListId, history: params.history });
    }
  }
};

export default composeWithTracker(composer, Loading)(ListAllProducts);
