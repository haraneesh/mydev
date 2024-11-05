import React from 'react';
import { useTracker, useSubscribe } from 'meteor/react-meteor-data'; 
import DisplayProductLists from '../../components/ProductLists/ProductLists';
import ProductLists from '../../../api/ProductLists/ProductLists';
import Loading from '../../components/Loading/Loading';
import constants from '../../../modules/constants';

const compose = (params) => {
  const isLoading = useSubscribe('productLists.list');

  const productLists = useTracker(() => ProductLists.find({},
    { sort: { activeStartDateTime: constants.Sort.DESCENDING } }).fetch()
);

  if (isLoading()) {
    return (<Loading />);
  }

  return (<DisplayProductLists productLists={productLists} history={params.history}/>);
 
};

export default compose;
