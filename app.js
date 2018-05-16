// NPM modules
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();

// Allows you to read form data
app.use(bodyParser.urlencoded({ extended: false}));
// Allows you to read cookies
app.use(cookieParser());

// Set /public to be our static files folder
app.use("/public", express.static("public"));

// Set view engine to pug
app.set("view engine", "pug");

// Set up routes
const loginRoute = require("./routes/login");
const indexRoute = require("./routes/index");
const mylistRoute = require("./routes/mylist");
const databaseRoute = require("./routes/database");

app.use(loginRoute);
app.use(indexRoute);
app.use(mylistRoute);

app.listen(3000, () => {
  console.log("Server started on port 3000.");
});
