"use strict";

const cursor = document.querySelector(".customCursor__wrapper");
const cursor0 = document.querySelector(".customCursor");
const cursorV = document.querySelector(".customCursorV");
const cursorH = document.querySelector(".customCursorH");

document.addEventListener("mousemove", (e) => {
  cursor.style.top = e.pageY + "px";
  cursor.style.left = e.pageX + "px";

  cursor.style.display = "flex";

  cursor.classList.remove("customCursorPointer");

  const listItems = [
    document.querySelectorAll("input"),
    document.querySelectorAll("button"),
    document.querySelectorAll("label"),
    document.querySelectorAll(".dropdown__item"),
    document.querySelectorAll("a"),
  ];

  listItems.forEach((item) => {
    item.forEach((i) => {
      i === e.target ? cursor.classList.add("customCursorPointer") : null;
    });
  });
});

document.addEventListener("mouseout", (e) => {
  cursor.style.display = "none";
});
