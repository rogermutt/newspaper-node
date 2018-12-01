const expect = require('chai').expect;
const request = require('supertest');
const puppeteer = require('puppeteer');
const User = require("/Users/Roger/newspaper-node/models/adminUsers.js");

const register_Username = "registrant";
const register_Password = "registrant";

const URL_to_Access = 'http://localhost:8080/register';

describe('Registration Testing', function() {

  let browser, page, server;
  this.timeout(100000);

  before(async function() {

    delete require.cache[require.resolve('../app')];
    server = require('../app');

    browser = await puppeteer.launch();
    page = await browser.newPage();

    await page.goto(URL_to_Access);
    await page.type('.reg-username', register_Username);
    await page.type('.reg-pwd', register_Password);

    const submitBtn = await page.$('.button-primary');
    await submitBtn.click();
    await page.waitForNavigation();

  });

  after(function(done) {
    browser.close();
    server.close(done);
  });

  it('Register and delete account', async function () {

    const checkInDBExists = await User.findOne({ username: register_Username }, function (err, user) {
      if (err) console.log("Error: ", err);
      console.log("User " + user.username + " exists");
      return user.username;
    });

    const profileSection = await page.$('#profile-btn');
    profileSection.click();
    await page.waitForNavigation();

    const deleteProfile = await page.$('.delete-profile');
    deleteProfile.click();
    await page.waitForNavigation();

    const checkInDBIsNull = await User.findOne({ username: register_Username }, function (err, user) {
      if (err) console.log("Error: ", err);
      return user;
    });

    expect(checkInDBIsNull).to.be.null;

  });

});
