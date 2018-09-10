const express = require("express");
const mysql = require("mysql");

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "todolist"
})

connection.connect((err) => {
  if (err) {
    return console.log("Database has not been connected.", err);
  }
  console.log("Connected to database.");
});

module.exports = connection;
