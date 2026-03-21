import { Jobs } from 'meteor/msavin:sjobs';
import ProductLists from './ProductLists';

Jobs.register({
  async updateProductList({ productListsId, productList }) {
    console.log(`start${new Date()}`);
    await ProductLists.upsertAsync({ _id: productListsId }, { $set: productList });
    console.log(`end${new Date()}`);
  },
});
