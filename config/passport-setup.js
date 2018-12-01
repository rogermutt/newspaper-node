const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require("/Users/Roger/newspaper-node/models/adminUsers.js");
const bcrypt = require('bcrypt');

module.exports = function(passport) {

passport.serializeUser((user, done)=>{
      done(null, user.id);
});

passport.deserializeUser((id, done)=>{
  User.findById(id).then((user)=>{
      done(null, user);
  });
});

passport.use('signup', new LocalStrategy({
      passReqToCallback: true
    },
    function(req, username, password, done) {

      User.findOne({
        'username': username
      }, function(err, user) {

        if (err) { // In error return using the done method
          console.log('Error in SignUp: ' + err);
          return done(err);
        }

        if (user) {
          let randomNum = Math.floor(Math.random() * Math.floor(200)),
           printMessage = `This username is already taken. What about ${username}${randomNum} ?`;

          User.findOne({"username": username+randomNum},  (err, res) => {
            if (err) console.log("Error: ", err);

            if (res == null)
            return done(null, false, req.flash("signupMessage", printMessage)); // username+random is not in the DB hence is suggested to user

            randomNum = Math.floor(Math.random() * Math.floor(200)); // create another random number
            return done(null, false, req.flash("signupMessage", printMessage));
          });

        } else { // if username is not in DB create new user

          var newUser = new User();

          bcrypt.hash(password, 5, function(err, bcryptedPassword) {
            newUser.username = username;
            newUser.password = bcryptedPassword;

            newUser.save(function(err) {
              if (err) {
                console.log('Error in Saving user: ' + err);
                throw err;
              }
              return done(null, newUser);
            }); // close newUser
          }); // close bcrypt.hash

        }
      });
    }));

passport.use('login', new LocalStrategy({
      passReqToCallback : true
  },
  function(req, username, password, done) {

      User.findOne({ 'username' :  username }, function(err, user) {

          if (err)
              return done(err);

          if (!user)
              return done(null, false);

          if (!user.validPassword(password)) {
              let loginText = "Username or password incorrect."
              console.log(loginText);
              return done(null, false, req.flash("loginMessage", loginText));
            }

          return done(null, user);
      });

  }));

};
