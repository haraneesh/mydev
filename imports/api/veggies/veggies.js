import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Factory } from 'meteor/dburles:factory';

const Veggies = new Mongo.Collection('Veggies');
export default Veggies;


Veggies.allow({
  insert: () => false,
  update: () => false,
  remove: () => false,
});

Veggies.deny({
  insert: () => true,
  update: () => true,
  remove: () => true,
});

Veggies.schema = new SimpleSchema({
  name: {
    type: String,
    label: 'The title of the document.',
  },
  description: {
    type: String,
    label: 'The body of the document.',
  },
});

Veggies.attachSchema(Veggies.schema);

Factory.define('veggie', Veggies, {
  title: () => 'Factory Title',
  body: () => 'Factory Body',
});
