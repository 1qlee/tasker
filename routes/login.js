const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", { title: "Log In" });
});

router.get("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/");
})

router.post("/login", (req, res) => {
  const username = req.body.username;

  res.cookie('username', username);
  res.redirect("/mylist");
});

module.exports = router;
