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

  db.query(`SELECT * FROM lists WHERE owner_id = ?`, [user_id], (error, results, fields) => {
    if (results.length === 0) {
      res.render("lists", { title: "My Lists", username: username });
    }
    else {
      // Redirect the user to the first list in userLists
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

  // Do a query for the specific list
  db.query(`SELECT * FROM lists WHERE owner_id = ? AND name = ?`, [user_id, list], (error, results, fields) => {
    if (error) throw error;

    if (results.length > 0) {
      const userList = results[0];
      // Set the currentList var to equal correct list name
      const currentList = userList.name;
      // Set a session variable for the list's id
      req.session.currentListId = userList.id;

      // Get all lists from this user
      db.query(`SELECT * FROM lists WHERE owner_id = ?`, [user_id], (error, results, fields) => {
        const userLists = results;

        // Query the database for all tasks linked to this list
        db.query(`SELECT * FROM tasks WHERE list_id = ?`, [userList.id], (error, results, fields) => {
          let listTasks = results;
          // Render the correct list details
          res.render("lists", { title: `My Lists - ${currentList}`, username: username, userLists: userLists, currentList: currentList, listTasks: listTasks});
        });
      });
    }
    else {
      // Query the database for all lists related to this user
      db.query(`SELECT * FROM lists WHERE owner_id = ?`, [user_id], (error, results, fields) => {
        const userLists = results;
        // Tell the user that the specified list was not found
        res.render("lists", { title: "My Lists - Not Found", username: username, userLists: userLists, currentList: "None", listTasks: []});
      });
    }
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
  db.query("INSERT INTO tasks (value, list_id, status) VALUES (?, ?, ?)", [result, currentListId, false], (error, results, fields) => {
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
  db.query(`SELECT * FROM lists WHERE name = ? AND owner_id = ?`, [result, user_id], (error, results, fields) => {
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

// Handle POST when a list name gets edited
router.post("/lists/edit", authenticationMiddleware(), (req, res, next) => {
  let newListName = req.body.name;
  let newListId = req.body.id;

  if (newListName.length > 0) {
    db.query(`UPDATE lists SET name = ? WHERE id = ?`, [newListName, newListId], (error, results, fields) => {
      if (error) throw error;
      res.sendStatus(200);
    });
  }
});

// Handles POST to mark task as complete
router.post("/lists/complete", authenticationMiddleware(), (req, res, next) => {
  let tasksToModify = req.body;

  if (tasksToModify.complete) {
    for (let taskId of tasksToModify.ids) {
      db.query(`UPDATE tasks SET status = ? WHERE id = ?`, [0, taskId], (error, results, fields) => {
        if (error) throw error;
      });
      console.log("Marked incomplete task with ID:", taskId);
    }
    res.sendStatus(200);
  }
  else {
    for (let taskId of tasksToModify.ids) {
      db.query(`UPDATE tasks SET status = ? WHERE id = ?`, [1, taskId], (error, results, fields) => {
        if (error) throw error;
      });
      console.log("Marked complete task with ID:", taskId);
    }
    res.sendStatus(200);
  };

});

// Handles POST to delete tasks from a list
router.post("/lists/delete", authenticationMiddleware(), (req, res, next) => {
  let tasksToDelete = req.body;

  if (tasksToDelete.length > 0) {
    // Iterate through the array of tasks and delete them individually
    for (let task of tasksToDelete) {
      db.query(`DELETE FROM tasks WHERE id = ?`, [task], (error, results, fields) => {
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
