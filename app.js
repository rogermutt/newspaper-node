const express = require("express");
const app = express();

const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy  = require('passport-local').Strategy;
const session = require('express-session');

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({extended: false});
const articles = require('/Users/Roger/newspaper-node/models/articles');
const adminUsers = require('/Users/Roger/newspaper-node/models/adminUsers');
const port = 3030;
const flash = require('connect-flash');

app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost/newspaper-node");

mongoose.connection.once("open", function() {
//  console.log("DB connected");
}).on("error", function(error) {
  console.log("Article DB error: " + error);
});

app.use(express.static('public'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({ secret: 'HfgfT5&6rfsdf', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// routes
require('./config/passport-setup')(passport);
require('./config/routes.js')(app, passport);

const server = app.listen(port, function(){
 console.log("Running on " + port);
});

module.exports = server;
