/* eslint-disable no-param-reassign */
import Products from './Products';
import Suppliers from '../Suppliers/Suppliers';

function removeDeletedSourceSuppliers(suppliers) {
  const newSuppliers = [];

  suppliers.forEach((s) => {
    if (s && s._id) {
      const supp = Suppliers.findOne({ _id: s._id });
      if (supp && supp._id) {
        newSuppliers.push(s);
      }
    }
  });
  return newSuppliers;
}

Products.before.update((userId, doc, fieldNames, modifier, options) => {
  if (modifier.$set.sourceSuppliers) {
    modifier.$set.sourceSuppliers = removeDeletedSourceSuppliers(modifier.$set.sourceSuppliers);
  }
});

Products.before.upsert((userId, selector, modifier, options) => {
  if (modifier.$set.sourceSuppliers) {
    modifier.$set.sourceSuppliers = removeDeletedSourceSuppliers(modifier.$set.sourceSuppliers);
  }
});
