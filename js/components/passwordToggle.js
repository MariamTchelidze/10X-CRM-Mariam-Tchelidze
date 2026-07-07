const passwordFields = document.querySelectorAll(".password-field");

passwordFields.forEach((field) => {
  const input = field.querySelector("input");
  const toggle = field.querySelector(".password-field__toggle");
  const icon = field.querySelector(".password-field__icon");

  if (!input || !toggle || !icon) return;

  toggle.addEventListener("click", () => {
    const isHidden = input.type === "password";

    input.type = isHidden ? "text" : "password";

    icon.src = isHidden ? "./assets/icons/eye-open.svg" : "./assets/icons/eye-closed.svg";

    toggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  });
});
