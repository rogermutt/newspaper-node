const expect = require('chai').expect;
const request = require('supertest');
const puppeteer = require('puppeteer');
const User = require("/Users/Roger/newspaper-node/models/adminUsers.js");
const articles = require("/Users/Roger/newspaper-node/models/articles.js");

const loginUsername = "autotester";
const loginUserpassword = "autotester";

const URL_to_Access = 'http://localhost:8080/login';
const commmentPost = "Automated testing comment";
const newUserName = "TEMP";

describe('Login Testing', function() {

    let browser, page, server;
    this.timeout(100000);

    beforeEach(async function() {

        delete require.cache[require.resolve('../app')];
        server = await require('../app');

        browser = await puppeteer.launch();
        page = await browser.newPage();

        await page.goto(URL_to_Access);

    });

    afterEach(function(done) {
      browser.close();
      server.close(done);
    });


  it('Post comment', async function () {

    /* Login Block Below */
    await page.type('.username', loginUsername);
    await page.type('.password', loginUserpassword);

    const submitBtn = await page.$('.button-primary');
    await submitBtn.click();
    await page.waitForNavigation();
    /* Login Block Above */

    await page.type('.commentSection', commmentPost);
    await page.keyboard.press('Enter');
    await page.waitForNavigation();

    await articles.find({}).where('comments.author').equals(loginUsername).select('comments').exec((err, DB_output) => {
      if (err) console.log(err);
      // Find out why find({}) does not return batch
      expect(DB_output[0].comments.length).to.equal(1);

    });

  });

  it('Change username to a new one (Name in comments updated)', async function () {

    /* Login Block Below */
    await page.type('.username', loginUsername);
    await page.type('.password', loginUserpassword);

    const submitBtn = await page.waitForSelector('.button-primary');
    await submitBtn.click();
    await page.waitForNavigation();
    /* Login Block Above */

    const profileSection = await page.$('#profile-btn');
    profileSection.click();
    await page.waitForNavigation();

    const userNameSection = await page.$('#existing-username');
    userNameSection.click();

    await page.waitForNavigation();
    await page.type('.input-new-username', newUserName);
    await page.waitForSelector('.input-new-username')
    await page.keyboard.press('Enter');
    await page.waitForNavigation();

    const checkInDB = await User.findOne({ username: newUserName }, function (err, user) {
      if (err) console.log("Error: ", err);
      return user.username;
    });

    expect(checkInDB.username).to.equal(newUserName);

  });

  // it('Change username back to original', async function () {
  //
  //   /* Login Block Below */
  //   await page.type('.username', newUserName);
  //   await page.type('.password', loginUserpassword);
  //
  //   const submitBtn = await page.waitForSelector('.button-primary');
  //   await submitBtn.click();
  //   await page.waitForNavigation();
  //   /* Login Block Above */
  //
  //   const profileSection = await page.$('#profile-btn');
  //   profileSection.click();
  //   await page.waitForNavigation();
  //
  //   const userNameSection = await page.$('#existing-username');
  //   userNameSection.click();
  //
  //   await page.waitForNavigation();
  //   await page.type('.input-new-username', loginUsername);
  //   await page.waitForSelector('.input-new-username')
  //   await page.keyboard.press('Enter');
  //   await page.waitForNavigation();
  //
  //   const checkInDB = await User.findOne({ username: loginUsername }, function (err, user) {
  //     if (err) console.log("Error: ", err);
  //     return user.username;
  //   });
  //
  //   expect(checkInDB.username).to.equal(loginUsername);
  //
  // });

});
