const express = require("express");
const router = express.Router();

router.get("/mylist", (req, res) => {
  const username = req.cookies.username;

  if (username) {
    res.render("mylist", { username });
  }
  else {
    res.redirect("/");
  }

});

module.exports = router;
