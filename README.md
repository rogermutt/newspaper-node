# Newspaper Node 

Basic newspaper/blog platform to perform standard CRUD operations plus a set of automated tests to ensure all the platform functionalities are running as expected. 
User login and authentitication is handled by Passport (local strategy). 
No styling applied. 

![screen shot 2018-12-01 at 6 00 06 pm](https://user-images.githubusercontent.com/23165579/49325436-73b5e480-f596-11e8-8748-c8c9de97c111.png)


### Prerequisites

MongoDB 
Chromium (This will be installed when running npm install - See below) 
NodeJS

### Installing

1. git clone https://github.com/rogermutt/newspaper-node.git
2. npm install (Note: This will install Chromium in your machine (which is quite heavy). Chromium in this project is a dependancy for Pupeteer which is for the automated tests.
3. Run mongod
4. Run node app.js
5. Head to http://localhost:3030/home
6. Up and running 

## Running the tests

Steps to run the automated tests:

1. Run mongod
2. Run node app.js
3. Go to http://localhost:3030/register
4. Create a new user with the following details:

username: autotester
password: autotester

Reason: The automated tests use the above details to log in and perform all its operations.

### Break down into end to end tests

The automated tests are  built with: 
Chai and Mocha 
Puppeteer - To control headless Chrome

There are 3 types of testing:

### Article Testing 

1. Create standard articl
2. Delete standard article 

### Login Testing 

1. Post comment
2. Change username to a new one (and ensure name in comments section is updated)
3. Change username back to original (by defualt commented out). 

### Registration Testing 

1. Register and delete account

All tests can be found in the "tests" folder. 
Additionally you can see the headless browser running but changing one line in each test script as follows:

Replace this:
  browser = await puppeteer.launch();

with this:
  browser = await puppeteer.launch({ headless: false});

The currnet t

## Areas to improve

Many! But first and foremost I would like to:
1. Refactor the code 
2. Apply some styling - with Boostrap, Bulma or Materialize 
3. Amend two deprecation warnings:
a) DeprecationWarning: collection.ensureIndex is deprecated. Use createIndexes instead
b) DeprecationWarning: collection.findAndModify is deprecated. Use findOneAndUpdate, findOneAndReplace or findOneAndDelete instead.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
