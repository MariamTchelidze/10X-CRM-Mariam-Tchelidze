const passwordInput = document.querySelector(".js-password");
const passwordToggle = document.querySelector(".js-password-toggle");
const passwordIcon = document.querySelector(".js-password-icon");

passwordIcon.src = "./assets/icons/eye-closed.svg";

passwordToggle.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";

  passwordInput.type = isHidden ? "text" : "password";

  passwordIcon.src = isHidden ? "./assets/icons/eye-open.svg" : "./assets//icons/eye-closed.svg";

  passwordToggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
});
