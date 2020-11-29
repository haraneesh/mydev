import { Jobs } from 'meteor/msavin:sjobs';
import ProductLists from './ProductLists';

Jobs.register({
  updateProductList({ productListsId, productList }) {
    console.log(`start${new Date()}`);
    ProductLists.upsert({ _id: productListsId }, { $set: productList });
    console.log(`end${new Date()}`);
  },
});
