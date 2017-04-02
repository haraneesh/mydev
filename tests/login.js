/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

describe('Log In', function () {
  beforeEach(function () {
    server.execute(function () {
      const { Meteor } = require('meteor/meteor');
      const user = Meteor.users.findOne({ 'username': '9998888888' });
      debugger;
      if (user) {
        Meteor.users.remove(user._id);
      }
    });
  });

  it('should allow us to login @watch', function () {
    server.execute(function () {
      const { Accounts } = require('meteor/accounts-base');
      debugger;
      Accounts.createUser({
        username:'9998888888',
        email: 'carl.winslow@abc.com',
        password: 'bigguy1989',
        profile: {
          name: { first: 'Carl', last: 'Winslow' },
          whMobilePhone:'9998888888',
          deliveryAddress:'Office Address - Admin Account',
        }
      });
    });

    browser.url('http://localhost:3000/login')
           .setValue('[name="whMobilePhone"]', '9998888888')
           .setValue('[name="password"]', 'bigguy1989')
           .submitForm('form');

    browser.waitForExist('.alert',1000);
    expect(browser.getUrl()).to.equal('http://localhost:3000/');

  });
});
