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
{
  username: '8555881322',
  email: 'h3@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '8555881322',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '7555921850',
  email: 'h4@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '7555921850',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '9755504732',
  email: 'h5@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '9755504732',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '7555443962',
  email: 'h6@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '7555443962',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '9355553435',
  email: 'h7@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '9355553435',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '7555718418',
  email: 'h8@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '7555718418',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '7555354959',
  email: 'h9@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '7555354959',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '8555793106',
  email: 'h10@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '8555793106',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '8555788419',
  email: 'h11@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '8555788419',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '8555794314',
  email: 'h12@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '8555794314',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '9155553364',
  email: 'h13@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '9155553364',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '7555286636',
  email: 'h14@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '7555286636',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '9955502568',
  email: 'h15@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '9955502568',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '7555673946',
  email: 'h16@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '7555673946',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '7555406736',
  email: 'h17@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '7555406736',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '7555858677',
  email: 'h18@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '7555858677',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '8555623490',
  email: 'h19@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '8555623490',
    deliveryAddress: 'Office Address',
  },
  roles: ['customer'],
},
{
  username: '7555335244',
  email: 'h20@yahoo.com',
  password: 'password',
  profile: {
    name: { first: 'Balambal', last: 'G' },
    whMobilePhone: '7555335244',
    deliveryAddress: 'Office Address',
  },
  settings: {
    productUpdatePreference: 'sendMeProductPhotosOnWhatsApp',
    packingPreference: 'noPreference',
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
