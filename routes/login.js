const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/login", (req, res) => {
  res.render("login", { title: "Log In" });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}));

router.get("/logout", (req, res) => {
  req.logout();
  if (req.session) {
    req.session.destroy((err) => {
      if(err) {
        return next(err);
      }
      else {
        res.clearCookie("connect.sid");
        res.redirect("/");
      }
    });
  }
})

module.exports = router;
