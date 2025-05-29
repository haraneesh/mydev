import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { createNewUser } from '/imports/api/Users/methods';

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
    role: 'admin',
  },
  {
    username: '6666666666',
    email: 'h1111@yahoo.com',
    password: 'password12',
    profile: {
      name: {
        first: 'Super',
        last: 'Admin',
      },
      salutation: 'Mrs',
      whMobilePhone: '6666666666',
      deliveryAddress: 'Super Admin',
      eatingHealthyMeaning: '',
      deliveryPincode: '600087',
      deliveryAddressLatitude: '87978.89',
      deliveryAddressLongitude: '87978.89',
    },
    role: 'superAdmin',
  },
];

async function createUsers(users) {
  for (const user of users) {
    const { username, email, password, profile, roles } = user;

    const userExists = await Meteor.users.findOneAsync({ username });

    if (!userExists) {
      await Roles.createRoleAsync(user.role, { unlessExists: true });
      await createNewUser(user);
      /*
      const userId = await Accounts.createUserAsync({
        username,
        email,
        password,
        profile,
      });
      await Roles.addUsersToRoles(userId, roles); */
    }
  }
}

createUsers(users);
