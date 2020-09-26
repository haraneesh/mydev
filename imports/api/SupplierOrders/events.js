/* eslint-disable func-names */
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import SupplierOrders from './SupplierOrders';
import Suppliers from '../Suppliers/Suppliers';
import UserEvents from '../UserEvents/UserEvents';
import { Emitter, Events } from '../Events/events';
import handleMethodException from '../../modules/handle-method-exception';
import constants from '../../modules/constants';
import Security from '../../modules/both/security';

function InsertEvent({ eventType, userId, doc }) {
  UserEvents.insert(
    {
      eventType,
      owner: userId,
      doc,
    },
  );
}

function getProductsBySupplier(productsOrdered) {
  return productsOrdered.reduce((supplierHash, product) => {
    const sourceSupplierId = (product.sourceSuppliers
        && product.sourceSuppliers[0]
        && product.sourceSuppliers[0]._id)
      ? product.sourceSuppliers[0]._id : null;

    if (!sourceSupplierId) { return supplierHash; }

    const supplier = Suppliers.findOne({ _id: sourceSupplierId });
    if (supplier && supplier._id) {
      if (!supplierHash[sourceSupplierId]) {
        supplierHash[sourceSupplierId] = [];
      }
      supplierHash[sourceSupplierId].push(product);
    }

    return supplierHash;
  }, {});
}

// Emitter.on(Events.SHOPKEEPER_ORDER_INSERTED, ({ userId, order }) => {});

Emitter.on(Events.SHOPKEEPER_ORDER_UPDATED, ({ userId, order }) => {
  SupplierOrders.remove({ sourceOrderId: order._id });

  if (Security.checkBoolUserIsShopOwner(order.customer_details._id)) {
    InsertEvent({
      eventType: Events.SHOPKEEPER_ORDER_UPDATED,
      userId,
      doc: order,
    });

    switch (true) {
      case (order.order_status === constants.OrderStatus.Pending.name): {
        SupplierOrders.remove({ sourceOrderId: order._id });
        break;
      }
      default: {
        const productsBySuppliers = getProductsBySupplier(order.products);
        const suppliersIds = Object.keys(productsBySuppliers);

        suppliersIds.forEach((supplierId) => {
          const suppOrder = {
            supplierId,
            sourceOrderId: order._id,
            products: productsBySuppliers[supplierId],
            customer_details: order.customer_details,
            order_status: order.order_status,
            productOrderListId: order.productOrderListId,
          };

          SupplierOrders.upsert(
            { sourceOrderId: order._id, supplierId },
            { $set: suppOrder },
          );
        });
        break;
      }
    }
  }
});

Emitter.on(Events.SHOPKEEPER_ORDER_REMOVED, ({ userId, order }) => {
  InsertEvent({
    eventType: Events.SHOPKEEPER_ORDER_UPDATED,
    userId,
    doc: order,
  });
  SupplierOrders.remove({ sourceOrderId: order._id }, { multi: true });
});
