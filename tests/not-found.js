/* eslint-env mocha */
/* eslint-disable func-names, prefer-arrow-callback */

describe('404 Error', function () {
  it('should render a 404 for a non-existent route @watch', function () {
    browser.url('http://localhost:3000/dididothat')
      .waitForExist('.alert', 1000);
    expect(browser.getText('.alert-info')).to.equal('You are yet to place an order.');

    expect(browser.getUrl()).to.equal('http://localhost:3000/');

  });
});
