import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Suppliers from '../../Suppliers/Suppliers';
import SupplierOrders from '../SupplierOrders';
import Security from '../../../modules/both/security';
import constants from '../../../modules/constants';

Meteor.publish('supplierOrders.list', function supplierOrders(options) {
  check(options, { limit: Number, bringCompleted: Boolean });
  Security.checkUserIsSupplier(this.userId);
  const loggedInSupplier = Suppliers.findOne({ userId: this.userId });
  const loggedInSupplierId = (loggedInSupplier) ? loggedInSupplier._id : null;

  let query;
  if (!options.bringCompleted) {
    query = {
      supplierId: loggedInSupplierId,
      order_status: { $not: { $eq: constants.OrderStatus.Completed.name } },
    };
  } else {
    query = {
      supplierId: loggedInSupplierId,
      order_status: constants.OrderStatus.Completed.name,
    };
  }

  return SupplierOrders.find(query,
    {
      fields: { productOrderListId: 0, updatedAt: 0 },
      sort: { createdAt: constants.Sort.DESCENDING },
      limit: options.limit,
    });
});

Meteor.publish('supplierOrderDetails.view', function supplierOrderDetails(options) {
  check(options, { id: String });
  Security.checkUserIsSupplier(this.userId);
  return SupplierOrders.find({ _id: options.id },
    {
      fields: { productOrderListId: 0, updatedAt: 0 },
    });
});
