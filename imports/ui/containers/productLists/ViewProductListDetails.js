import { Meteor } from 'meteor/meteor'
import { composeWithTracker } from 'react-komposer'
import ProductLists from '../../../api/productLists/productLists'
import ViewProductListDetails from '../../components/productLists/ViewProductListDetails'
import Loading from '../../components/Loading'

const composer = ({ params }, onData) => {
  const subscription = Meteor.subscribe('productList.view', params._id);
 
  if (subscription.ready()) {
    const productList = ProductLists.findOne();
    onData(null, { productList });
  }
};

export default composeWithTracker(composer, Loading)(ViewProductListDetails);
