import { Meteor } from 'meteor/meteor';
import ProductLists from './ProductLists';

export async function getActiveProductList() {
  const dateValue = new Date();

  const query = {
    $and: [
      { activeStartDateTime: { $lte: dateValue } },
      { activeEndDateTime: { $gte: dateValue } },
    ],
  };

  const productList = await ProductLists.find(query).fetchAsync();

  return ProductLists.find(query);
}
