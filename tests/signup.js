/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

describe('Sign Up', function () {

  beforeEach(function () {

    browser.execute(function(){
     if (Meteor.user()) {
      //Meteor.logout();
       Meteor.logout();
     //   console.log("Logout complete")
      }
    });

    server.execute(function () {
      const { Meteor } = require('meteor/meteor');
      const user = Meteor.users.findOne({ 'username': '9998888888' });
      if (user) {
        Meteor.users.remove(user._id);
      }
    });
   
  });

  it('should create a new user and login with redirect to index @watch', function () {

   //server.call('logout');
   //browser.waitForExist('.Login', 15000);

   
    /*browser.click("#basic-nav-dropdown");  
    browser.waitForExist('#app-logout',15000);
    browser.click("#app-logout");*/
    //browser.waitForExist('.Login',15000);


    browser.url('http://localhost:3000/signup')
          .setValue('[name="deliveryAddress"]', 'Some Place')
           .setValue('[name="firstName"]', 'Carl')
           .setValue('[name="lastName"]', 'Winslow')
           .setValue('[name="emailAddress"]', 'carl.winslow@abc.com')
           .setValue('[name="password"]', 'bigguy1989')
           .setValue('[name="whMobilePhone"]', '9998888888') 
           .submitForm('form');
    browser.waitForExist('.alert',15000);
    expect(browser.getUrl()).to.equal('http://localhost:3000/');
  });
});
