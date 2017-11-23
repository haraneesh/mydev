import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';

const users = [{
  username: '9999999999',
  email: 'haraneesh@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Haraneesh', last: 'R' },
    whMobilePhone: '9999999999',
    deliveryAddress: 'Office Address - Admin Account',
  },
  roles: ['admin'],
}];

users.forEach(({ username, email, password, profile, roles }) => {
  const userExists = Meteor.users.findOne({ username: username });

  if (!userExists) {
    const userId = Accounts.createUser({ username, email, password, profile });
    Roles.addUsersToRoles(userId, roles);
  }
});
