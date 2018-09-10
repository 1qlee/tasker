// NPM modules
const express = require("express");
const http = require("http");
const app = express();

// Parsing tools
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressValidator = require("express-validator");

// Authentication tools
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const MySQLStore = require("express-mysql-session")(session);
const bcrypt = require("bcrypt");

// Allows you to read form data
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

// Express validator for reading data sent to our server
app.use(expressValidator());

// Allows you to read cookies
app.use(cookieParser());

// Create a session store in database
let options = {
  host: "localhost",
  user: "root",
  password: "",
  database: "todolist"
};

let sessionStore = new MySQLStore(options);

// Express sessions for user login
app.use(session({
  secret: "EUzY6BohAt",
  resave: false,
  store: sessionStore,
  saveUninitialized: false
}));

// Intialize passportjs
app.use(passport.initialize());
app.use(passport.session());

// Create global var for IF authenticated user
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.isAuthenticated();
  next();
})

passport.use(new LocalStrategy(
  (username, password, done) => {
    const db = require('./routes/database');

    db.query("SELECT id, username, password FROM accounts WHERE username = ?", [username], (err, results, fields) => {
      if (err) {done(err)};

      if (results.length === 0) {
        done(null, false);
      }
      else {
        const user = results[0];
        const hash = user.password.toString();

        bcrypt.compare(password, hash, (err, response) => {
          if (response === true) {
            delete user.password;
            return done(null, { username: user.username, user_id: user.id });
          }
          else {
            return done(null, false);
          }
        });
      }
    });
  }
));

// Set /public to be our static files folder
app.use(express.static(__dirname + '/public'));

// Set view engine to pug
app.set("view engine", "pug");

// Set up routes
const signupRoute = require("./routes/signup");
const indexRoute = require("./routes/index");
const profileRoute = require("./routes/profile");
const loginRoute = require("./routes/login");

app.use(signupRoute);
app.use(indexRoute);
app.use(loginRoute);
app.use("/profile", profileRoute);

app.listen(3000, () => {
  console.log("Server started on port 3000.");
});
