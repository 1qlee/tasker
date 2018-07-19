import { convertFormData } from "./profile_helpers.js";

// Add task to the database
const DB = (form, task) => {
  const xhr = new XMLHttpRequest();
  const formData = new FormData(form);
  // Function that parses the FormData object
  const result = convertFormData(formData);

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const responseObject = JSON.parse(xhr.responseText);
        const id = responseObject[0].id;

        DOM(task, id);
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
const DOM = (input, id) => {
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
  checkboxInput.setAttribute("type", "checkbox");
  checkboxInput.setAttribute("id", `checkbox-${id}`);
  checkboxLabel.setAttribute("for", `checkbox-${id}`);
  checkbox.appendChild(checkboxInput);
  checkbox.appendChild(checkboxLabel);
  newTask.insertBefore(checkbox, newTask.firstChild);

  input.value = "";

  console.log(`Added a new task: ${value}.`);
}

export { DB, DOM };
