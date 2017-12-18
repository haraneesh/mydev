import { composeWithTracker } from 'react-komposer';
import { Meteor } from 'meteor/meteor';
// import Products from '../../../api/products/products'
import ProductLists from '../../../api/ProductLists/ProductLists';
import ProductsOrderList from '../../components/Orders/ProductsOrderList';
import { Loading } from '../../components/Loading/Loading';


const composer = ({ dateValue, history }, onData) => {
  // const subscription = Meteor.subscribe('products.list')
  // const dateValue = Date.now()
  // const dateValue = new Date("1/11/2017")
  const subscription = Meteor.subscribe('productOrderList.view', dateValue);

  if (subscription.ready()) {
    const productList = ProductLists.findOne();
    const products = (productList) ? productList.products : [];
    const productListId = (productList) ? productList._id : '';
    onData(null, { products, productListId, history });
  }
};

export default composeWithTracker(composer, Loading)(ProductsOrderList);
