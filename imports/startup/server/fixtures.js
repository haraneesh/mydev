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
    deliveryAddress: 'Office Address  Admin Account',
  },
  roles: ['admin'],
},
/* Temporary Users */
{
  username: '7555881466',
  email: 'h1@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Ajit', last: 'S' },
    whMobilePhone: '7555881466',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},

{
  username: '9855561654',
  email: 'h2@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '9855561654',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
];

users.forEach(({
  username, email, password, profile, roles,
}) => {
  const userExists = Meteor.users.findOne({ username });

  if (!userExists) {
    const userId = Accounts.createUser({
      username, email, password, profile,
    });
    Roles.addUsersToRoles(userId, roles);
  }
});
