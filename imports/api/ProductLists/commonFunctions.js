import ProductLists from './ProductLists';

export function getActiveProductList() {
  const dateValue = new Date();

  return ProductLists.find(
    {
      $and: [
        { activeStartDateTime: { $lte: dateValue } },
        { activeEndDateTime: { $gte: dateValue } },
      ],
    },
  );
}
