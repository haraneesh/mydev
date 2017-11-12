// upgrade to 2.0.0 - to support recipes
// add measures to ingredients
import { Mongo } from 'meteor/mongo';
import Ingredients from '../Ingredients/Ingredients';

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
