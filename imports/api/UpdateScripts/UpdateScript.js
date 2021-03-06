// upgrade to 2.0.0 - to support recipes
// add measures to ingredients
// import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import Ingredients from '../Ingredients/Ingredients';
import Products from '../Products/Products';
// import ZohoSyncUps from '../ZohoSyncUps/ZohoSyncUps';
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
/* Products.update( { _id: "wafHsp5bztCZPFqfW" },{ $set : {"zh_item_id" : "702207000005722588"} });
Products.update( { _id: "PPrkeLbQNp2XXr2gp" },{ $set : {"zh_item_id" : "702207000006663301"} });
Products.update( { _id: "X6hXmnjZLcYskSRwi" },{ $set : {"zh_item_id" : "702207000007989005"} });
Products.update( { _id: "x9AnG9zNXosQLFuc9" },{ $set : {"zh_item_id" : "702207000007992005"} });
Products.update( { _id: "HKpzgEHxP2huBJnyw" },{ $set : {"zh_item_id" : "702207000007988005"} }); */

/*
Meteor.users.update({ settings: { $exists: false } }, {
  $set: {
    settings: {
      dieteryPreference: {
        value: '',
      },
    },
  },
},
{ multi: true }); */

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

/*
Orders.find({}).fetch().forEach(order => {
  const role = Roles.getRolesForUser(order.customer_details._id)[0];
  Orders.update({ _id: order._id }, { $set: { 'customer_details.role': role } });
}); */
