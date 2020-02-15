// upgrade to 2.0.0 - to support recipes
// add measures to ingredients
//import { Mongo } from 'meteor/mongo';
//import { Meteor } from 'meteor/meteor';
// import Ingredients from '../Ingredients/Ingredients';
//import Products from '../Products/Products';
//import ZohoSyncUps from '../ZohoSyncUps/ZohoSyncUps';
//import { Orders } from '../Orders/Orders';
//import { Roles } from 'meteor/alanning:roles';
//import constants from '../../modules/constants';

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
Meteor.users.update({ wallet: { $exists: false } }, {
  $set: {
    wallet: {
      unused_retainer_payments_InPaise: 0,
      unused_credits_receivable_amount_InPaise: 0,
      outstanding_receivable_amount_InPaise: 0,
      lastZohoSync: new Date('1/1/2000')
    }
  }
},
  { multi: true });

const cusers = Meteor.users.find({}).fetch();

cusers.forEach((u) => {
  if (u.isAdmin) {
    Roles.setUserRoles(u._id, [constants.Roles.admin.name]);
  } else {
    Roles.setUserRoles(u._id, [constants.Roles.customer.name]);
  }
});
*/

/*Orders.update({ expectedDeliveryDate: { $exists: false } }, {
  $set: {
    expectedDeliveryDate: new Date(2017, 1, 1),
  },
}, { multi: true });*/

//Products.update({ wSaleBaseUnitPrice: { $exists: false } }, { $set: { wSaleBaseUnitPrice: 0 } }, { multi: true });
//Products.update({ sourceSuppliers: { $exists: false } }, { $set: { sourceSuppliers: [] } }, { multi: true });
// Products.update({ image_path: '/blank_image.png' }, { $set: { image_path: 'blank_image.png' } }, { multi: true });
//Products.update({ image_path: '/blank_image.png' }, { $set: { image_path: '' } }, { multi: true });
//Products.update({ image_path: 'blank_image.png' }, { $set: { image_path: '' } }, { multi: true });


// ZohoSyncUps.update({ syncedForUser: { $exists: false } }, { $set: { syncedForUser: 'All' } });
