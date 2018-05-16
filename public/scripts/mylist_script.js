document.addEventListener("DOMContentLoaded", () => {
  const addItemButton = document.getElementById("addItemButton");
  const addItemInput = document.getElementById("addItemInput");
  const toDoList = document.getElementById("list");

  addItemButton.addEventListener("click", (event) => {
    event.preventDefault();

    addItem(addItemButton, addItemInput, toDoList);
  });

});

const addItem = (button, input, list) => {
  let value = input.value;
  let newItem = document.createElement("li");
  let newItemText = document.createTextNode(value);

  newItem.appendChild(newItemText);
  list.appendChild(newItem);

  localStorage.setItem(0, value);

  console.log(`Added a new item: ${value}.`);
}
