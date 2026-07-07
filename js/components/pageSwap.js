"use strict";

const pageLinks = document.querySelectorAll(".auth-footer__link");

pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();

    const destination = link.href;

    document.body.classList.add("is-page-leaving");

    requestAnimationFrame(() => {
      setTimeout(() => {
        window.location.href = destination;
      }, 220);
    });
  });
});
