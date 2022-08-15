// upgrade to 2.0.0 - to support recipes
// add measures to ingredients
// import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import Ingredients from '../Ingredients/Ingredients';
import Products from '../Products/Products';
import constants from '../../modules/constants';
import ZohoSyncUps from '../ZohoSyncUps/ZohoSyncUps';
// import { Orders } from '../Orders/Orders';
// import Messages from '../Messages/Messages';
// import constants from '../../modules/constants';

/*
const IngWeights = new Mongo.Collection('IngWeights');

if (IngWeights.findOne()) {
  // If IngWeights table exists then update the ingredients with these measures
  const ingredients = Ingredients.find({}, { _id: 1, NDB_No: 1 }); // cursor
  ingredients.forEach((ing) => {
    const weights = IngWeights.find({ NDB_No: ing.NDB_No }, { _id: 0 }).fetch();
    weights.push(
      {
        Seq: weights.length + 1,
        Amount: 100,
        Msre_Desc: 'g',
        Gm_Wgt: 1,
      });
    Ingredients.update({ _id: ing._id }, { $set: { Weights: weights } });
  });

  IngWeights._dropCollection();
}
*/

// update products to have displayOrder
// Products.update({}, { $set: { displayOrder: 0 } }, { multi: true });

/*

702207000050765962	VEV000425
702207000137410932	MRB000753
702207000136418021	MRB000402
702207000059654001	VEV000490
702207000050777039	VEV000423
702207000050770073	VEV000421
702207000051114001	VEV000435
702207000050771031	VEV000422
702207000050764569	VEV000424

Products.update({ sku: 'VLO000570' }, { $set: { zh_item_id: '702207000099462029' } });
Products.update({ sku: 'VLG000019' }, { $set: { zh_item_id: '702207000000087121' } });
Products.update({ sku: 'MRB000402' }, { $set: { zh_item_id: '702207000136418021' } });
Products.update({ sku: 'GCR000767' }, { $set: { zh_item_id: '702207000141238235' } });

/*
Products.update({ sku: 'VEV000425' }, { $set: { zh_item_id: '702207000050765962' } });
Products.update({ sku: 'MRB000753' }, { $set: { zh_item_id: '702207000137410932' } });
Products.update({ sku: 'VEV000490' }, { $set: { zh_item_id: '702207000059654001' } });
Products.update({ sku: 'MRB000402' }, { $set: { zh_item_id: '702207000136418021' } });
Products.update({ sku: 'VEV000423' }, { $set: { zh_item_id: '702207000050777039' } });
Products.update({ sku: 'VEV000421' }, { $set: { zh_item_id: '702207000050770073' } });
Products.update({ sku: 'VEV000435' }, { $set: { zh_item_id: '702207000051114001' } });
Products.update({ sku: 'VEV000422' }, { $set: { zh_item_id: '702207000050771031' } });
Products.update({ sku: 'VEV000424' }, { $set: { zh_item_id: '702207000050764569' } });

Meteor.users.update({ productReturnables: { $exists: false } }, {
  $set: {
    productReturnables: {},
  },
},
{ multi: true });
*/

/*
Meteor.users.update({ productReturns: { $exists: true } }, {
  $rename: { productReturns: 'productReturnables' },
},
{ multi: true });
*/

/* const cusers = Meteor.users.find({}).fetch();

cusers.forEach((u) => {
  if (u.emails[0].verified === 'false') {
    const user = u;
    const email = [];
    email.push({ address: u.emails[0].address, verified: false });
    delete user.email;
    user.emails = email;
    Meteor.users.update({ _id: u._id }, { $set: user });
  }
}); */

/*
const cusers = Meteor.users.find({}).fetch();

cusers.forEach((u) => {
  if (u.isAdmin) {
    Roles.setUserRoles(u._id, [constants.Roles.admin.name]);
  } else {
    Roles.setUserRoles(u._id, [constants.Roles.customer.name]);
  }
});
*/

/* Orders.update({ expectedDeliveryDate: { $exists: false } }, {
  $set: {
    expectedDeliveryDate: new Date(2017, 1, 1),
  },
}, { multi: true }); */

// Messages.update({ likeMemberId: { $exists: false } }, { $set: { likeMemberId: [] } }, { multi: true });
// Messages.update({ messageType: 'Suggestion' }, { $set: { messageType: 'Message' } }, { multi: true });

// Products.update({ wSaleBaseUnitPrice: { $exists: false } }, { $set: { wSaleBaseUnitPrice: 0 } }, { multi: true });
// Products.update({ sourceSuppliers: { $exists: false } }, { $set: { sourceSuppliers: [] } }, { multi: true });
// Products.update({ image_path: '/blank_image.png' }, { $set: { image_path: 'blank_image.png' } }, { multi: true });
// Products.update({ image_path: '/blank_image.png' }, { $set: { image_path: '' } }, { multi: true });
// Products.update({}, { $set: { frequentlyOrdered: false } }, { multi: true });
// Products.update({}, { $set: { maxUnitsAvailableToOrder: 9999 } }, { multi: true });

// Products.update({}, { $unset: { sourceSupplier: "" } }, { multi: true });

// ZohoSyncUps.update({ syncedForUser: { $exists: false } }, { $set: { syncedForUser: 'All' } });

const syncDate = new Date();
syncDate.setDate(syncDate.getDate() - 32);
const zohoSyncUp = {
  syncDateTime: syncDate,
  noErrorSyncDate: syncDate,
  errorRecords: [],
  successRecords: [],
  syncEntity: 'invoices-last-modified-time-from-zoho',
  syncedForUser: 'All',
};
ZohoSyncUps.upsert({ syncEntity: 'invoices-last-modified-time-from-zoho' }, { $set: zohoSyncUp });

syncDate.setDate(syncDate.getDate() - 32);
const zohoSyncUp2 = {
  syncDateTime: syncDate,
  noErrorSyncDate: syncDate,
  errorRecords: [],
  successRecords: [],
  syncEntity: 'invoice-details-from-zoho',
  syncedForUser: 'All',
};
ZohoSyncUps.upsert({ syncEntity: 'invoice-details-from-zoho' }, { $set: zohoSyncUp2 });

/*
Orders.find({}).fetch().forEach(order => {
  const role = Roles.getRolesForUser(order.customer_details._id)[0];
  Orders.update({ _id: order._id }, { $set: { 'customer_details.role': role } });
}); */

// upgrade to Roles 3.0

// Roles._forwardMigrate();
// Roles._forwardMigrate2();

/* db.users.find({"settings.packingPreference":{$exists:false}}); */
Meteor.users.update(
  { 'settings.packingPreference': { $exists: false } },
  {
    $set: {
      'settings.packingPreference': constants.PackingPreferences.noPreference.name,
    },
  },
  { multi: true },
);

Meteor.users.update(
  { 'settings.productUpdatePreference': { $exists: false } },
  {
    $set: {
      'settings.productUpdatePreference': constants.ProductUpdatePreferences.sendMeProductPhotosOnWhatsApp.name,
    },
  },
  { multi: true },
);
