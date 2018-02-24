import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
import ProductLists from '../../../api/ProductLists/ProductLists';
import ProductsOrderList from '../../components/Orders/ProductsOrderList';
import { Loading } from '../../components/Loading/Loading';
// import ProductsOrderMain from '../../components/Orders/ProductsOrderMain/ProductsOrderMain';

const composer = ({ dateValue, history }, onData) => {
  const subscription = Meteor.subscribe('productOrderList.view', dateValue);

  if (subscription.ready()) {
    const productList = ProductLists.findOne();
    const products = (productList) ? productList.products : [];
    const productListId = (productList) ? productList._id : '';
    onData(null, { dateValue, products, productListId, history });
  }
};

export default composeWithTracker(composer, Loading)(ProductsOrderList);
