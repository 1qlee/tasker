const express = require("express");
const router = express.Router();
const db = require("./database");
const passport = require("passport");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const expressValidator = require("express-validator");

router.get("/signup", (req, res) => {
  res.render("signup", { title: "Sign Up" });
});

router.post("/signup", (req, res) => {
  req.checkBody('username', 'Username field cannot be empty.').notEmpty();
  req.checkBody('username', 'Username must be between 4-15 characters long.').len(4, 15);
  req.checkBody('email', 'The email you entered is invalid, please try again.').isEmail();
  req.checkBody('email', 'Email address must be between 4-100 characters long, please try again.').len(4, 100);

  const errors = req.validationErrors();

  if (errors) {
    console.log(`errors: ${JSON.stringify(errors)}`);

    return res.render("signup", {
      title: "Log In Error(s)!",
      errors: errors
    });
  }
  else {
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const user = {email: email, username: username};

    bcrypt.hash(password, saltRounds, (err, hash) => {
      db.query("INSERT INTO accounts (email, username, password) VALUES (?, ?, ?)", [email, username, hash],
      (error, results, fields) => {
        if (error) throw error;

        db.query("SELECT * FROM accounts WHERE id = LAST_INSERT_ID()", (error, results, fields) => {
          if (error) throw error;

          const user = results[0];

          db.query("INSERT INTO lists (name, owner_id) VALUES (?, ?)", ["Untitled List", user.id], (error, results, fields) => {
            if (error) { return next(err);};
            res.redirect("/");
          });
        });
      });
    });
  }
});

// store user id in a session
passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});

// read user id from a session
passport.deserializeUser(function(user_id, done) {
  done(null, user_id);
});

module.exports = router;
