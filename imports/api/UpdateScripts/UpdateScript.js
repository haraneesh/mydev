// upgrade to 2.0.0 - to support recipes
// add measures to ingredients
import { Mongo } from 'meteor/mongo';
//import Ingredients from '../Ingredients/Ingredients';
import Products from '../Products/Products';

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

// update products to have displayOrder
// Products.update({}, { $set: { displayOrder: 0 } }, { multi: true });
Products.update( { _id: "wafHsp5bztCZPFqfW" },{ $set : {"zh_item_id" : "702207000005722588"} });
Products.update( { _id: "PPrkeLbQNp2XXr2gp" },{ $set : {"zh_item_id" : "702207000006663301"} });
Products.update( { _id: "X6hXmnjZLcYskSRwi" },{ $set : {"zh_item_id" : "702207000007989005"} });
Products.update( { _id: "x9AnG9zNXosQLFuc9" },{ $set : {"zh_item_id" : "702207000007992005"} });
Products.update( { _id: "HKpzgEHxP2huBJnyw" },{ $set : {"zh_item_id" : "702207000007988005"} });