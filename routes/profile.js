const express = require("express");
const router = express.Router();
const db = require("./database");
const expressValidator = require("express-validator");

// Redirect profile url to lists
router.get("/", authenticationMiddleware(), (req, res) => {
  res.redirect("/profile/lists");
});

// Redirect lists url to the first list
router.get("/lists", authenticationMiddleware(), (req, res) => {
  // User variables
  const { username } = req.user;
  const { user_id } = req.user;

  db.query(`SELECT * FROM lists WHERE owner_id = ${user_id}`, (error, results, fields) => {
    if (results.length === 0) {
      res.render("lists", { title: "My Lists", username: username });
    }
    else {
      res.redirect(`/profile/lists/${results[0].name}`);
    }
  });
});

// Render url defined specific list
router.get("/lists/:list", authenticationMiddleware(), (req, res) => {

  // User variables
  const { username } = req.user;
  const { user_id } = req.user;
  const { list } = req.params;

  // Query the database for the specific list
  db.query(`SELECT * FROM lists WHERE owner_id = ${user_id}`, (error, results, fields) => {
    if (error) throw error;
    let userLists = results;

    // If the list exists in the database, then render the page
    userLists.forEach((userList) => {
      if (userList.name === list) {
        // Set the currentList var to equal correct list name
        let currentList = userList.name;
        // Set a session variable for the list's id
        req.session.currentListId = userList.id;

        // Query the database for all tasks linked to this list
        db.query(`SELECT * FROM tasks WHERE list_id = ${userList.id}`, (error, results, fields) => {
          let listTasks = results;

          return res.render("lists", { title: `My Lists - ${currentList}`, username: username, userLists: userLists, currentList: currentList, listTasks: listTasks});
        });
      }
    });
  });
});

// Handle POST when task gets added by user
router.post("/lists", authenticationMiddleware(), (req, res) => {

  // User variables
  const { user_id } = req.user;
  const { currentListId } = req.session;
  // Parsed FormData variable
  const result = JSON.parse(Object.keys(req.body)[0]).taskItemInput;

  // Insert task into the database
  db.query("INSERT INTO tasks (value, list_id, status) VALUES (?, ?, ?)", [result, currentListId, true], (error, results, fields) => {
    if (error) throw error;
    console.log("Inserted task into table with ID:", currentListId);

    db.query("SELECT id from tasks WHERE id = LAST_INSERT_ID()", (error, results, fields) => {
      if (error) throw error;
      const id = results;
      res.status(200).send(id);
    })
  });
});

// Handle POST when a new list gets added
router.post("/lists/new", authenticationMiddleware(), (req, res, next) => {
  // User variables
  const { user_id } = req.user;
  // Parsed FormData variable
  const result = JSON.parse(Object.keys(req.body)[0]).newListInput;

  // Insert list into the database but make sure there isn't already a list with the same name
  db.query(`SELECT * FROM lists WHERE name = "${result}" AND owner_id = ${user_id}`, (error, results, fields) => {
    if (results.length > 0) {
      res.sendStatus(400);
    }
    else {
      db.query("INSERT INTO lists (name, owner_id) VALUES (?, ?)", [result, user_id], (error, results, fields) => {
        if (error) throw error;
        console.log("Inserted new list:", result);
        res.sendStatus(200);
      });
    }
  })
});

// Handles POST to delete tasks from a list
router.post("/lists/delete", authenticationMiddleware(), (req, res, next) => {
  let tasksToDelete = req.body;

  if (tasksToDelete.length > 0) {
    // Go through the entire array of tasks and delete them individually
    for (let task of tasksToDelete) {
      db.query(`DELETE FROM tasks WHERE id = ${task}`, (error, results, fields) => {
        if (error) throw error;
      })
      console.log("Deleted task with ID:", task);
    }
    res.sendStatus(200);
  }

});

// Middleware function to restrict access to pages
function authenticationMiddleware () {
	return (req, res, next) => {
	    if (req.isAuthenticated()) return next();
	    res.redirect('/login');
	}
}

module.exports = router;
