const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({
  extended: false
});
const moment = require('moment');
const time = moment();
const articles = require("/Users/Roger/newspaper-node/models/articles.js");
const User = require("/Users/Roger/newspaper-node/models/adminUsers.js");

module.exports = function(app, passport) {

  const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated())
      return next();

    res.sendStatus(401);
  };

  app.get("/home", (req, res) => {

    articles.find((err, articles) => {
      if (err) return console.error(err);

      res.render("home", {
        "existArt": articles,
        "user": req.user
      });
    });
  });

  app.get("/register", (req, res) => {
    res.render("register", {
      user: req.user,
      message: req.flash('signupMessage')
    });
  });

  app.get("/login", (req, res) => {
    res.render("login", {
      user: req.user,
      message: req.flash('loginMessage')
    });
  });

  app.get("/adminDashboard", isLoggedIn, (req, res) => {
    articles.find((err, articles) => {
      if (err) return console.error(err);
      res.render("adminDashboard", {
        "existArt": articles,
        "user": req.user
      });
    });
  });

  app.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/home");
  });

  app.get("/newarticle", isLoggedIn, (req, res) => {
    res.render("newarticle", { user: req.user,
      messages: req.flash('newTitle')
    });
  });

  app.get('/profile', isLoggedIn, (req, res) => {

    let DB_commentsPosted = new Promise( resolve => {
      articles.find({}).where('comments.author').equals(req.user.username).select('comments').exec((err, comments) => {
        if (err) console.log(err);

          resolve(comments.length);
      });
    }).then( numComments => {
      res.render("profile", {
        user: req.user, comments: numComments, alreadyExist: null
      });

    }).catch( err => console.log(err) );

  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.render("home", {
      user: req.user
    });
  });

  app.post('/login', passport.authenticate('login', {
    successRedirect: '/home',
    failureRedirect: '/login'
  }));

  app.post('/register', passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/register'
  }));

  app.post('/adminDashboard', (req, res) => {
    articles.deleteOne({
      _id: req.body.id
    }, (err, res) => {
      if (err) console.log("Error: ", err);

    });
    res.redirect("adminDashboard");
  });

  app.post('/newarticle', urlencodedParser, (req, res) => {

    const newArt = new articles({
      title: req.body.title,
      type: req.body.article_type,
      timestamp: time.format('YYYY-MM-DD'),
      content: req.body.content
    });

    newArt.save().then((article_Created) => {
      req.flash('newTitle', article_Created.title)
      res.redirect("newarticle");
    });
  });

  app.post('/profile', (req, res) => {
    let newName = req.body.username;
    let existingName = req.body.existingName;

    User.findOne( { username: newName }, (err, userExists) => {
      if (err) console.log("Error: ", err);

      if (userExists === null) { // The new username is NOT in the DB

        const findAndUpdateUser = new Promise( resolve => {

          User.findOneAndUpdate( { username: existingName }, { $set: { username: newName } },
            (err, res) => {
              if (err) console.log("Error: ", err);
              console.log("user changed", res);
              resolve();
            });

        }).then(()=>{

          articles.find({}).where('comments.author').equals(existingName).exec((err, articlesArray) => {
            if (err) console.log(err);

            if (articlesArray.length == 0)
            res.redirect("home");

            articlesArray.map(article => article._id).map(id => {
              articles.updateOne({
                  "_id": id,
                  "comments.author": existingName
                }, {
                  "$set": {
                    "comments.$.author": newName
                  }
                },
                function(err, art) {
                  if (err) console.log("Error: ", err);

                  res.redirect("home");
                });
            });
          });

        }).catch( err => console.log("findAndUpdateUser ",err) );

      } else {

        console.log("user already exists");

        let howManyComments = new Promise( resolve => {
          articles.find({}).where('comments.author').equals(req.user.username).select('comments').exec((err, comments) => {
            if (err) console.log(err);

              resolve(comments.length);
          });
        }).then( numComments => {
          res.render("profile", {
            user: req.user, comments: numComments, alreadyExist: "This user already exists."
          });

        }).catch( err => console.log("DB_commentsPosted ",err) );

      } // else

    }); // findOne

});

  app.post('/delete-account', urlencodedParser, (req, res) => {

  User.findOneAndDelete({username: req.body.username}, (err, userFound) => {
    if (err) console.log(err);
      userFound.remove();
  });

  articles.find({}).where('comments.author').equals(req.body.username).select('comments').exec((err, articlesArray) => {
    if (err) console.log(err);

      articlesArray.map(article => article._id)
        .forEach(id => {
            articles.findOneAndUpdate(
              { "_id": id }, {
                "$pull": {
                  "comments": { "author": req.body.username }
                  }
            }, (err, res) => {
              if (err) console.log(err);
            });
        });
  });

    res.redirect("home");
});

  app.post('/newcomment', urlencodedParser, (req, res) => {
    articles.findOneAndUpdate(
      { _id: req.body.articleID },
      { $push: { comments: {"text": req.body.commentContent, "author": req.body.author} } },
      (err, res) => {
        if (err) console.log("Error: ", err);

    }); res.redirect("home");
  });

}; // exports
