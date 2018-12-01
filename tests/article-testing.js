const expect = require('chai').expect;
const request = require('supertest');
const puppeteer = require('puppeteer');
const articles = require("/Users/Roger/newspaper-node/models/articles.js");

const loginUsername = "autotester";
const loginUserpassword = "autotester";
const URL_to_Access = 'http://localhost:8080/login';

const articleTitle = "TEST Aliquam nec lacinia lorem";
const articleText = "TEST Duis commodo eleifend magna, vel euismod erat aliquam in. Aliquam gravida. Phasellus ullamcorper lobortis molestie.";

describe('Articles Testing', function() {

  let browser, page, server;
  this.timeout(100000);

  beforeEach(async function() {

    delete require.cache[require.resolve('../app')];
    server = require('../app');

    browser = await puppeteer.launch();
    page = await browser.newPage();

    await page.goto(URL_to_Access);
    await page.type('.username', loginUsername);
    await page.type('.password', loginUserpassword);

    const submitBtn = await page.$('.button-primary');
    await submitBtn.click();
    await page.waitForNavigation();

  });

  afterEach(function(done) {
    browser.close();
    server.close(done);
  });

  it('Create standard article', async function() {

    const goToNewart = await page.$('#new-article');
    goToNewart.click();
    await page.waitForNavigation();

    // Submitting new article
    await page.type('.article-title', articleTitle);
    await page.type('.article-text', articleText);
    await page.select('select[name="article_type"]', 'standard');

    const submitArticle = await page.$('.button-primary');
    await submitArticle.click();
    await page.waitForNavigation();

    const checkInDB = await articles.findOne({ title: articleTitle }, function (err, art) {
      if (err) console.log("Error: ", err);
      return art.title;
    });

    expect(checkInDB.title).to.equal(articleTitle);

  });

  it('Delete standard article created', async function() {

    const goToAdmin = await page.$('.admin-dashboard');
    goToAdmin.click();
    await page.waitForNavigation();

    // Deleting latest article
    const deleteBtn = await page.$('.delete-article');
    deleteBtn.click();
    await page.waitForNavigation();

    const checkInDB = await articles.findOne({ title: articleTitle }, function (err, art) {
      if (err) console.log("Error: ", err);
      return art;
    });

    expect(checkInDB).to.be.null;

  });

});
