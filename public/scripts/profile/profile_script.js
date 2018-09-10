document.addEventListener("DOMContentLoaded", () => {
  const task = document.getElementsByClassName("task");
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const newListForm = document.getElementById("new-list-form");
  const newListInput = document.getElementById("new-list-input");
  const newListButton = document.getElementById("new-list-button");
  const toolbarButtons = document.getElementsByClassName("toolbar-button");
  const menuLinks = document.getElementsByClassName("menu-link");

  // Add an event listener to the task submit form
  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (taskInput.value.trim().length > 0) {
      addTaskDB(taskForm, taskInput);
    }
    else {
      console.log("Empty input");
    }
  });

  // Add an event listener to the new list submit form
  newListForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (newListInput.value.trim().length > 0) {
      addListDB(newListForm, newListInput);
      newListInput.classList.remove("is-active");
      newListButton.classList.remove("is-disabled");
    }
    else {
      console.log("Empty input");
    }
  });

  // Add an event listener to the new list button to expose new list input
  newListButton.addEventListener("click", (event) => {
    newListInput.classList.add("is-active");
    newListButton.classList.add("is-disabled");
    newListInput.focus();
  });

  // Add an event listener to all buttons in the toolbar
  for (let button of toolbarButtons) {
    button.addEventListener("click", (event) => {
      // Get name of the current button
      const currentButtonName = button.getAttribute("id");
      // Run the toolbar function with respective button name
      toolbarMethod(currentButtonName);
    });
  }

  // Add event listener for each list (menu-link) in the menu
  for (let menuLink of menuLinks) {
    // Listen for right-click event
    menuLink.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      // Give the active state to the clicked menu-link
      handleActiveMenuLink(menuLink);
      // Open the submenu at the click coordinates
      openSubmenu(menuLink, { left: event.clientX, top: event.clientY });
    });
  };

  // Add event listeners for each action in the submenu
  const submenuItems = document.querySelectorAll(".submenu-item");
  for (let submenuItem of submenuItems) {
    submenuItem.addEventListener("click", () => {
      // The list element that needs to be changed
      const listElement = document.querySelector(".menu-link.is-selected");
      // The id of the list that needs to be changed
      const listId = listElement.getAttribute("id").substring(5);
      // The action that needs to be taken
      const action = submenuItem.getAttribute("data-action");
      // Handle list name edit
      if (action === "edit") {
        editList(listElement, listId);
      }
      // Handle list deletion
      else if (action === "delete") {
        deleteList(listElement, listId);
      }
    });
  };

});

// Helper function that parses FormData to be readable by backend
const convertFormData = (formData) => {
  let jsonObject = {};

  for (const [key, value] of formData.entries()) {
    jsonObject[key] = value;
  }

  return JSON.stringify(jsonObject);
}

// -------------------------------------------------------------Submenu functions---------------------------------------------------------------//
// Handle visual cue for submenu click
const handleActiveMenuLink = (link) => {
  // Drop any existing is-selected class from menu-link
  let selectedMenuLink = document.getElementsByClassName("is-selected");
  // Loop through the array (should only be 1 element)
  for (let menuLink of selectedMenuLink) {
    menuLink.classList.remove("is-selected");
  }
  if (link) {
    return link.classList.add("is-selected");
  }
  else {
    return;
  }
}

const handleEditListInput = (input) => {
  // Handle blur event on the input
  const addBlurEvent = event => {
    event.target.classList.add("is-hidden");
    handleListRevert();
    handleActiveMenuLink();
    // Call function to remove the blur event
    removeBlurEvent();
  }
  // Function to remove the blur event listener
  const removeBlurEvent = () => {
    document.removeEventListener('blur', addBlurEvent);
  }
  // Re-add the blur event listener
  input.addEventListener("blur", addBlurEvent);
}

const handleListRevert = () => {
  // Get the currently hidden list
  let hiddenMenuLink = document.querySelector(".menu-link.is-hidden");
  // If one exists,
  if (hiddenMenuLink) {
    // Make it visible again
    hiddenMenuLink.classList.remove("is-hidden");
    // Remove its visible edit-list-input from DOM
    document.getElementById("edit-list-input").remove();
  }
}

// Hide an element (the submenu) if user clicks outside of it
const handleClickOutside = (element) => {
  // This is how we know if the element is visible (aka active)
  const isVisible = element => !!element && !!( element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  // Look for a click outside the element
  const outsideClickListener = event => {
    if (!element.contains(event.target)) {
      if (isVisible(element)) {
          element.classList.remove("is-active");
          removeClickListener();
      };
    };
  };
  // Remove the event listener
  const removeClickListener = () => {
    document.removeEventListener('click', outsideClickListener);
    handleActiveMenuLink();
  };
  // Re-add event listener
  document.addEventListener('click', outsideClickListener);
};

// Handle submitting a new list name
const handleNewListName = (list, input, listId) => {

  const addEnterEvent = event => {
    // If the enter key was pressed
    if (event.keyCode === 13) {
      // Get the value of the new list name from input
      const newListName = input.value;
      const xhr = new XMLHttpRequest();

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            console.log('status 200');
            handleListRevert();
            updateListNameDOM(list, newListName);
          };
        };
      };

      xhr.open("POST", "/profile/lists/edit");
      xhr.setRequestHeader("Content-type", "application/json");
      xhr.send(JSON.stringify({name: newListName, id: listId}));
    };
  };
  // Function to remove the blur event listener
  const removeEnterEvent = () => {
    document.removeEventListener("keyup", addEnterEvent);
  };
  // Re-add the blur event listener
  input.addEventListener("keyup", addEnterEvent);
};

// Handle the visiblity of submenus in profile menu
const openSubmenu = (element, position) => {
  // Get menu DOM element
  let menu = document.getElementById("menu");
  // Return the submenu DOM element
  menu.appendChild(activateSubmenu(element, position));
};

// Properly position and show submenu DOM element
const activateSubmenu = (element, position) => {
  // Find and show the submenu element
  let submenu = document.getElementById("submenu");
  // Add class is-active if it isn't already there
  if (!submenu.classList.contains("is-active")) {
    submenu.classList.add("is-active");
  };
  // Position it accordingly to mouse click
  submenu.style.left = `${position.left}px`;
  submenu.style.top = `${position.top}px`;
  // Hide the submenu on any click outside of it
  handleClickOutside(submenu, true);

  return submenu;
};

// Edit list name
const editList = (list, listId) => {
  handleListRevert();
  // Hide the newly clicked list
  list.classList.add("is-hidden");
  // Create a new input DOM element
  let editListInput = document.createElement("input");
  editListInput.setAttribute("id", "edit-list-input");
  editListInput.setAttribute("placeholder", "Press enter to submit");
  editListInput.classList.add("input");
  // Append it to the list's parent node
  list.parentNode.appendChild(editListInput);
  // Hide the submenu
  document.getElementById("submenu").classList.remove("is-active");
  // Give focus to the newly created input
  editListInput.focus();

  // Return state to normal on a click outside of the input
  handleEditListInput(editListInput);
  handleNewListName(list, editListInput, listId);

}

const updateListNameDOM = (list, newListName) => {
  // Change the list name in the DOM
  list.innerHTML = newListName;
  // Update the list link's href
  list.setAttribute("href", `/profile/lists/${newListName}`);
  // Update the
  if (list.classList.contains("is-active")) {
    window.location.replace(`/profile/lists/${newListName}`);
  }
}

// Delete list
const deleteList = (list) => {
  console.log(list);
}

// -------------------------------------------------------------addTask functions---------------------------------------------------------------//
// Add task to the database
const addTaskDB = (form, task) => {
  const xhr = new XMLHttpRequest();
  const formData = new FormData(form);
  // Function that parses the FormData object
  const result = convertFormData(formData);

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const responseObject = JSON.parse(xhr.responseText);
        const id = responseObject[0].id;

        addTaskDOM(task, id);
      }
      else {
        console.log("Failed");
      }
    }
  }

  xhr.open("POST", "/profile/lists");
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(result);
}

// Add task to the DOM
const addTaskDOM = (input, id) => {
  let value = input.value;
  // Create task
  const list = document.getElementById("list");
  const newTask = document.createElement("li");
  const newTaskText = document.createTextNode(value);
  // Create task's checkbox
  const checkbox = document.createElement("div")
  const checkboxInput = document.createElement("input");
  const checkboxLabel = document.createElement("label");

  // Build the task element
  newTask.classList.add("task");
  newTask.appendChild(newTaskText);
  list.appendChild(newTask);

  // Build the checkbox element
  checkbox.classList.add("checkbox");
  checkboxInput.classList.add("check");
  checkboxInput.setAttribute("type", "checkbox");
  checkboxInput.setAttribute("id", `checkbox-${id}`);
  checkboxLabel.setAttribute("for", `checkbox-${id}`);
  checkbox.appendChild(checkboxInput);
  checkbox.appendChild(checkboxLabel);
  newTask.insertBefore(checkbox, newTask.firstChild);

  input.value = "";

  console.log(`Added a new task: ${value}.`);
}

// -------------------------------------------------------------addList functions---------------------------------------------------------------//
// Add list to the database
const addListDB = (form, list) => {
  let xhr = new XMLHttpRequest();
  let formData = new FormData(form);
  // Function that parses the FormData object
  let result = convertFormData(formData);

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        addListDOM(list);
      }
      else {
        console.log("Failed");
      }
    }
  }

  xhr.open("POST", "/profile/lists/new");
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.send(result);
}

// Add list to the DOM
const addListDOM = (list) => {
  let value = list.value;
  let menuList = document.getElementById("menu-list");
  let newList = document.createElement("li");
  let newListLink = document.createElement("a");
  let newListName = document.createTextNode(value);

  newListLink.classList.add("menu-link");
  newListLink.setAttribute("href", `/profile/lists/${value}`);
  newListLink.appendChild(newListName);
  newList.appendChild(newListLink);
  menuList.appendChild(newList);

  list.value = "";

  console.log(`Added a new list: ${value}.`);
}

// -------------------------------------------------------------Toolbar functions---------------------------------------------------------------//
// Parent toolbar function for all task operations
const toolbarMethod = (button) => {

  // Helper vars and functions
  const checkboxArray = document.getElementById("list").getElementsByClassName("check");

  // Push all selected checkbox ID's into an array
  const getCheckboxIds = (array) => {
    let checkboxIdArray = [];

    for (let element of array) {
      if (element.checked) {
        const id = element.getAttribute("id").substring(9);
        checkboxIdArray.push(id);
      }
    }

    return checkboxIdArray;
  };

  // ---------------------------------------------------------The different methods--------------------------------------------------------- //
  // Select all tasks
  const selectTasks = () => {
    // Assign all checkboxes to a variable
    const checkedBoxes = document.getElementById("list").querySelectorAll('input[type=checkbox]:checked');

    // If there are no checked checkboxes, check all checkboxes
    if (checkedBoxes.length == 0) {
      for (let checkbox of checkboxArray) {
        checkbox.checked = true;
      }
    }
    // Else set all currently checked checkboxes to unchecked
    else {
      for (let checkbox of checkedBoxes) {
        checkbox.checked = false;
      }
    }
  };

  // Mark selected tasks complete
  const completeTasks = () => {
    // Get an array with the ID's of all tasks to be marked complete
    let taskIdsToComplete = getCheckboxIds(checkboxArray);
    // Empty array that will hold our completed task DOM objects
    let completedTasks = [];
    // Emtpy array that will hold the ids of already completed tasks
    let completedTaskIds = [];

    // Loop through taskIdsToComplete and push completed tasks to completedTasks
    for (let checkboxId of taskIdsToComplete) {
      // Find the task div associated with the current checkboxId
      let currentTask = document.getElementById(`checkbox-${checkboxId}`).parentNode.parentNode;
      // Check if the task has the complete class
      if (currentTask.classList.contains("complete")) {
        // Push DOM element (task) to completedTasks
        completedTasks.push(currentTask);
        // Push checkboxId to completedTaskIds
        completedTaskIds.push(checkboxId);
      }
    };

    console.log(completedTasks, completedTasks.length);

    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // Mark the respective tasks complete in the DOM
          if (completedTasks.length == 0) {
            for (let checkboxId of taskIdsToComplete) {
              let currentTask = document.getElementById(`checkbox-${checkboxId}`).parentNode.parentNode;

              currentTask.classList.add("complete");
            }
          }
          else {
            for (let task of completedTasks) {
              task.classList.remove("complete");
            }
          }
        }
        else {
          console.log("Failed");
        }
      }
    }

    xhr.open("POST", "/profile/lists/complete");
    xhr.setRequestHeader("Content-type", "application/json");

    // Decide which tasks to send to server
    // Send a JSON with the completed task ids (to be marked incomplete)
    if (completedTaskIds.length > 0) {
      xhr.send(JSON.stringify({ complete: true, ids: completedTaskIds }));
    }
    // Else send a JSON with all task ids (to be completed)
    else {
      xhr.send(JSON.stringify({ complete: false, ids: taskIdsToComplete }));
    }
  };

  // Delete selected tasks
  const deleteTasks = () => {
    // Assign all checkboxes to a variable
    let taskIdsToDelete = getCheckboxIds(checkboxArray);

    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // Delete the respective tasks from the DOM
          for (let checkboxId of taskIdsToDelete) {

            // Find the task div associated with the current checkboxId
            let currentTask = document.getElementById(`checkbox-${checkboxId}`).parentNode.parentNode;

            // Fade out that task
            currentTask.classList.add("fade-out");

            // Then remove it from the DOM once animation is complete
            currentTask.addEventListener("animationend", () => {
              currentTask.remove();
            })
          }
        }
        else {
          console.log("Failed");
        }
      }
    }

    xhr.open("POST", "/profile/lists/delete");
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.send(JSON.stringify(taskIdsToDelete));
  };

  // Find out which button was clicked
  switch (button) {
    case "select":
      selectTasks();
      break;
    case "complete":
      completeTasks();
      break;
    case "delete":
      deleteTasks();
      break;
    default:
      console.log("Error");
  };
}
