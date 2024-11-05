import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

const users = [
  {
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

async function createUsers(users) {
  for (const user of users) {
    const { username, email, password, profile, roles } = user;

    const userExists = await Meteor.users.findOneAsync({ username });

    if (!userExists) {
      const userId = await Accounts.createUserAsync({
        username,
        email,
        password,
        profile,
      });
      await Roles.addUsersToRoles(userId, roles);
    }
  }
}

createUsers(users);
