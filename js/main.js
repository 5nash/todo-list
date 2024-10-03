"use strict";

const newNote = document.querySelector("#btn__add-task");
const formNewNote = document.querySelector(".note__new__wrapper");
const cancelNewNote = document.querySelector("#cancel");
const inputNote = document.querySelector("#note");
const formNote = document.querySelector("#note__new__form");
const todoList = document.querySelector(".todo__list");

const filterButton = document.querySelector("#filter");
const dropDownList = document.querySelector(".dropdown__list");
const dropDownItem = document.querySelectorAll(".dropdown__item");
const filterInput = document.querySelector("#filter-input");

let tasks = [];
let themeData = {darkTheme: false, filter: "all"};

if (localStorage.getItem("tasks")) {
  tasks = JSON.parse(localStorage.getItem("tasks"));
}
if (localStorage.getItem("themeData")) {
  themeData = JSON.parse(localStorage.getItem("themeData"));
}

// Подгружаем из Local Storage задачи с учетом фильтра

if (themeData.filter !== "all") {
  applyFilter();
} else {
  tasks.forEach((task) => {
    renderNoteHTML(task, tasks);
  });
  renderEmptyItemHTML(tasks);
}

applyTheme();

// Показ/скрытие модального окна с формой

newNote.addEventListener("click", takeFormNote);
cancelNewNote.addEventListener("click", removeFormNote);

function takeFormNote() {
  formNewNote.style.display = "flex";
}

function removeFormNote() {
  formNewNote.style.display = "none";
  inputNote.value = "";
}

// Создание новой задачи

formNote.addEventListener("submit", addNewNote);

function addNewNote(e) {
  e.preventDefault();

  const textNote = inputNote.value.toLowerCase();

  const newTask = {
    id: Date.now(),
    text: textNote,
    done: false,
  };

  tasks.push(newTask);

  saveToLS();

  renderNoteHTML(newTask, tasks);

  inputNote.value = "";
  inputNote.focus();

  renderEmptyItemHTML(tasks);
}

function renderNoteHTML(task, taskList) {
  const doneClass = task.done ? "completeTask" : "";
  const doneChecked = task.done ? "checked" : "";

  const noteHTML = `
          <li id="${task.id}" class="todo__item">
            ${task == taskList[0] ? "" : '<div class="hr__item"></div>'}
            <div class="todo__item__wrapper">
              <label class = "${doneClass}">
                <input class="real-checkbox" type="checkbox" ${doneChecked} />
                <span class="custom-checkbox"></span>
                ${task.text}
              </label>
              <div class="todo__item__panel">
                <button type="button" data-action="edit" id="edit-item" class="todo__item__panel__btn"></button>
                <button type="button" data-action="delete" id="trash-item" class="todo__item__panel__btn"></button>
              </div>
            </div>
          </li>`;

  todoList.insertAdjacentHTML("beforeend", noteHTML);
}

// Удаление задачи

todoList.addEventListener("click", deleteTask);

function deleteTask(e) {
  if (e.target.dataset.action !== "delete") return;
  const parentNote = e.target.closest(".todo__item");

  const idNote = Number(parentNote.id);
  const indexNote = tasks.findIndex((task) => idNote === task.id);
  tasks.splice(indexNote, 1);

  saveToLS();

  parentNote.remove();

  renderEmptyItemHTML(tasks);

  // Проверка на линию у первого элемента

  try {
    const hrItem = document.querySelector(".hr__item");
    const hrItem0 = todoList.children[0].children[0];

    if (hrItem == hrItem0) {
      hrItem.remove();
    }
  } catch {}
}

// Зачеркивание выполненных задач

todoList.addEventListener("click", completeTask);

function completeTask(e) {
  if (e.target.type !== "checkbox") return;

  const parentNote = e.target.closest(".todo__item");
  const textItem = e.target.closest(".todo__item__wrapper").children[0];

  const idNote = Number(parentNote.id);
  const taskNote = tasks.find((task) => idNote === task.id);
  taskNote.done = !taskNote.done;

  saveToLS();

  if (e.target.checked) {
    textItem.classList.add("completeTask");
  } else {
    textItem.classList.remove("completeTask");
  }
}

// Редактирование существующих задач

todoList.addEventListener("click", editTask);

function editTask(e) {
  if (e.target.dataset.action === "edit") {
    const parentNote = e.target.closest(".todo__item");
    const parentText = e.target.closest(".todo__item__wrapper");
    const textNote = parentText.children[0];

    // Удаляем пустые строки и лишние пробелы
    const lines = textNote.textContent.split("\n");
    const cleanedLines = lines.map((line) => line.trim()).filter((line) => line.length > 0);
    const newTextNote = cleanedLines.join("\n");

    let noteFormEditedHTML = `
                <div class="note__new__wrapper" id="editNoteWrapper">
                  <form name="note__new" id="note__new__form">
                    <h3 class="todo__title">Edit Note</h3>
                    <input id="note__edit" class="input__todo" type="text" maxlength="40" placeholder="Search note..." />
                    <div class="btns__form__note">
                      <button type="button" id="cancel__edit" class="btn__settings btn__form">Cancel</button>
                      <button type="submit" id="apply__edit" class="btn__settings btn__form">Apply</button>
                    </div>
                  </form>
                </div>`;

    document.body.insertAdjacentHTML("beforeend", noteFormEditedHTML);

    const editFormNote = document.querySelector("#editNoteWrapper");

    editFormNote.style.display = "flex";

    const cancelEditNote = document.querySelector("#cancel__edit");
    const inputEditNote = document.querySelector("#note__edit");

    inputEditNote.value = `${newTextNote}`;

    // Изменение нового текста в HTML

    editFormNote.addEventListener("submit", (e) => {
      e.preventDefault();

      const idNote = Number(parentNote.id);
      const taskNote = tasks.find((task) => idNote === task.id);
      const doneChecked = taskNote.done ? "checked" : "";

      const newText = inputEditNote.value.toLowerCase();

      const editedNoteHTML = `
                  <input class="real-checkbox" type="checkbox" ${doneChecked}>
                  <span class="custom-checkbox"></span>
                  ${newText}`;

      taskNote.text = newText;

      saveToLS();

      textNote.innerHTML = editedNoteHTML;

      editFormNote.remove();
    });

    cancelEditNote.addEventListener("click", () => {
      editFormNote.remove();
    });
  }
}

function renderEmptyItemHTML(tasks) {
  if (tasks.length === 0) {
    const emptyHTML = `
            <li class="todo__item__empty">
              <img src="img/Detective-check-footprint.svg" alt="empty" />
              Empty...
            </li>`;

    todoList.insertAdjacentHTML("afterbegin", emptyHTML);
  }

  if (tasks.length > 0) {
    const emptyList = document.querySelector(".todo__item__empty");
    emptyList ? emptyList.remove() : null;
  }
}

function saveToLS() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Переключение светлой/темной темы

const themeSwicthers = document.querySelector("#theme");

themeSwicthers.addEventListener("click", () => {
  themeData.darkTheme = !themeData.darkTheme;

  saveThemeToLS();

  applyTheme();
});

function applyTheme() {
  let cssThemeUrl = themeData.darkTheme ? `css/dark-theme.css` : `css/light-theme.css`;

  let linkTheme = document.querySelector('[title="theme"]');
  linkTheme.setAttribute("href", cssThemeUrl);
}

function saveThemeToLS() {
  localStorage.setItem("themeData", JSON.stringify(themeData));
}

// Работа фильтра

filterButton.addEventListener("click", getDownList);

function getDownList(e) {
  e.stopPropagation;

  dropDownList.classList.toggle("dropdown__list__visible");
  this.classList.toggle("dropdown__button__active");
}

dropDownItem.forEach(function (listItem) {
  listItem.addEventListener("click", function () {
    filterButton.innerText = this.innerText;

    filterInput.value = this.dataset.value;
    const filterValue = filterInput.value;

    themeData.filter = filterValue;
    saveThemeToLS();

    applyFilter();
  });
});

// Закрытие блока фильтра при нажатии вне

document.addEventListener("click", function (e) {
  if (e.target !== filterButton) {
    dropDownList.classList.remove("dropdown__list__visible");
    filterButton.classList.remove("dropdown__button__active");
  }
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" || e.key === "Tab") {
    dropDownList.classList.remove("dropdown__list__visible");
    filterButton.classList.remove("dropdown__button__active");
  }
});

function applyFilter(tasksList) {
  filterButton.innerText = themeData.filter;

  const emptyItem = document.querySelector(".todo__item__empty");
  const itemsList = document.querySelectorAll(".todo__item");
  itemsList
    ? itemsList.forEach((task) => {
        task.remove();
      })
    : null;
  emptyItem ? emptyItem.remove() : null;

  const filterList = {
    complete: true,
    incomplete: false,
    all: null,
  };

  let tempTasks = tasks;

  if (tasksList) {
    tempTasks = tasksList;
  }

  const tasksFilters = tempTasks.filter(function (task) {
    if (task.done && filterList[themeData.filter]) return true;
    if (!task.done && !filterList[themeData.filter]) return true;
    if (filterList[themeData.filter] === null) return true;
  });

  tasksFilters.forEach((task) => {
    renderNoteHTML(task, tasksFilters);
  });

  if (tasksFilters.length === 0) renderEmptyItemHTML(tasksFilters);

  dropDownList.classList.remove("dropdown__list__visible");
}

// Фильтр-поиск

const buttonSearch = document.querySelector("#btn__search");

buttonSearch.addEventListener("click", applySearch);

function applySearch(e) {
  e.preventDefault();

  const search = document.querySelector("#search");

  const searchText = search.value.toLowerCase();

  if (searchText !== "") {
    const tasksSearch = [];
    tasks.forEach((task) => {
      const indexSearch = task.text.search(searchText);

      if (indexSearch !== -1) {
        tasksSearch.push(task);
      }
    });
    applyFilter(tasksSearch);
  } else {
    applyFilter();
  }
}
