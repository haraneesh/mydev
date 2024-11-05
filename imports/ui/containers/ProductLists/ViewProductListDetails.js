import React from 'react';
import { useTracker, useSubscribe } from 'meteor/react-meteor-data'; 
import DisplayProductLists from '../../components/ProductLists/ProductLists';
import ProductLists from '../../../api/ProductLists/ProductLists';
import Loading from '../../components/Loading/Loading';
import ViewProductListDetails from '../../components/ProductLists/ViewProductListDetails';


const compose = ({ match, history }) => {
  const isLoading = useSubscribe('productList.view', match.params._id);

  const productList = useTracker(() => ProductLists.findOne());

  if (isLoading()) {
    return (<Loading />);
  }

  return (<ViewProductListDetails productList={productList} history={history}/>);
 
};

export default compose;