document.addEventListener("DOMContentLoaded", () => {
  const task = document.getElementsByClassName("task");
  const taskForm = document.getElementById("task-form");
  const taskInput = document.getElementById("task-input");
  const newListForm = document.getElementById("new-list-form");
  const newListInput = document.getElementById("new-list-input");
  const newListButton = document.getElementById("new-list-button");
  const toolbarButtons = document.getElementsByClassName("toolbar-button");
  const listLinks = document.getElementsByClassName("menu-link");

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

  // for (listLink of listLinks) {
  //   listLink.addEventListener("contextmenu", (event) => {
  //     event.preventDefault();
  //     console.log(event.clientX, this);
  //   });
  // };

});

// Helper function that parses FormData to be readable by backend
const convertFormData = (formData) => {
  let jsonObject = {};

  for (const [key, value] of formData.entries()) {
    jsonObject[key] = value;
  }

  return JSON.stringify(jsonObject);
}

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
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
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
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
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

// Parent toolbar function for all task operations
const toolbarMethod = (button) => {

  // The different methods
  const deleteTasks = () => {
    // Assign all checkboxes to a var
    const checkboxArray = document.getElementById("list").getElementsByClassName("check");
    let checkboxArrayDelete = [];

    // Push the id value of all checked checkboxes into an array (REFACTOR with above)
    for (let checkbox of checkboxArray) {
      if (checkbox.checked) {
        const id = checkbox.getAttribute("id").substring(9);
        checkboxArrayDelete.push(id);
      }
    }

    let xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // Delete the respective tasks from the DOM
          for (let checkbox of checkboxArrayDelete) {
            document.getElementById(`checkbox-${checkbox}`).parentNode.parentNode.remove();
          }
        }
        else {
          console.log("Failed");
        }
      }
    }

    xhr.open("POST", "/profile/lists/delete");
    xhr.setRequestHeader("Content-type", "application/json")
    xhr.send(JSON.stringify(checkboxArrayDelete));
  }

  // Find out which button was clicked
  switch (button) {
    case "select":
      console.log("Select");
      break;
    case "complete":
      console.log("Complete");
      break;
    case "delete":
      deleteTasks();
      break;
    default:
      console.log("Error");
  }
}
