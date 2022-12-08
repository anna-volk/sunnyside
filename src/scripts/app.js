// MOBILE NAVIGATION
const burgerBtn = document.getElementById("burger-btn");
const navList = document.getElementById("nav-list");
const body = document.querySelector("body");
const navLinks = document.querySelectorAll(".nav-link");

burgerBtn.addEventListener("click", () => {
  navList.classList.toggle("active");
  console.log("btn clicked");
  body.classList.toggle("body-locked");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navList.classList.remove("active");
    body.classList.remove("body-locked");
  });
});

// CLOSE MOB NAV - CLICK OUTSIDE
window.addEventListener("click", (e) => {
  if (!e.target.closest(".nav-list") && !e.target.closest("#burger-btn")) {
    navList.classList.remove("active");
    body.classList.remove("body-locked");
  }
});
