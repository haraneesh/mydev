import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import rateLimit from '../../modules/rate-limit.js';
import { Accounts } from 'meteor/accounts-base'

export const updateUser = new ValidatedMethod({
  name: 'users.update',
  validate: new SimpleSchema({
    username: { type: String, optional:true},
    email:{ type:String, optional:true},
    "profile.name.last": { type: String, optional:true},
    "profile.name.first": { type: String, optional:true },
    "profile.whMobilePhone": { type: String, optional:true },
    "profile.deliveryAddress": { type:String, optional:true },
    //password: { type: String, optional:true }
  }).validator(),
  run(user) {
    //Set password
    /*if(user.password){
        Accounts.setPassword(Meteor.userId(),user.password);
    }*/
    //Update rest of user profile
    if (user.email){
      let email = new Array()
      email.push({address:user.email, verified:'false'})
      delete user.email
      user["emails"]= email
    }
    return Meteor.users.update({ _id: Meteor.userId()}, { $set: user });
  },
});

/*export const removeDocument = new ValidatedMethod({
  name: 'recipes.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    Documents.remove(_id);
  },
});
*/
rateLimit({
  methods: [
    updateUser,
  ],
  limit: 5,
  timeRange: 1000,
});
