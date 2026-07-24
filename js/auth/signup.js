"use strict";

/* --- Sign Up Form Logic --- */
const signupPage = document.querySelector(".signupPage");

initSignup(); //გვერდის ჩატვირთვისას ლოგიკა ინიციალიზდება

function initSignup() {
  if (!signupPage) return;

  /* --- Shared modules keep auth storage and validation consistent. --- */
  const constants = window.crmConstants;
  const storage = window.crmStorage;
  const validation = window.crmValidation;
  const data = window.crmData;
  const form = document.querySelector(".js-signup-form");

  /* --- Stop early if a required module or form is missing on this page. --- */
  if (!constants || !storage || !validation || !data || !form) return;
  /* თუ რომელიმე საჭირო მოდული ან ფორმა არ არსებობს, ფუნქცია მუშაობას წყვეტს. ეს თავიდან გვაცილებს ისეთ შეცდომებს, როგორიცაა:  Cannot read properties of undefined*/

  /* --- Form fields are collected once for validation and account creation. --- */
  const fullNameInput = form.querySelector("#signup-full-name");
  const companyInput = form.querySelector("#signup-company");
  const emailInput = form.querySelector("#signup-email");
  const passwordInput = form.querySelector("#signup-password");
  const confirmPasswordInput = form.querySelector("#signup-confirm-password");

  const setSubmitLoading = (isLoading) => {
    //ეს ფუნქცია მართავს Submit ღილაკის მდგომარეობას.
    const submitButton = form.querySelector("[type='submit']");

    if (!submitButton) return;

    if (isLoading) {
      if (!submitButton.dataset.originalText) submitButton.dataset.originalText = submitButton.textContent;
      submitButton.textContent = "Creating account...";
      submitButton.disabled = true; //ღილაკის გათიშვა ხელს უშლის მომხმარებელს, რამდენჯერმე დააჭიროს და რამდენიმე ერთნაირი მოთხოვნა გაგზავნოს.
      return;
    }
    // თუ isLoading არის false: აღდგება ძველი ტექსტი; ღილაკი ისევ აქტიური ხდება; დროებითი data-original-text იშლება

    submitButton.textContent = submitButton.dataset.originalText || "Sign Up";
    submitButton.disabled = false;
    delete submitButton.dataset.originalText;
  };

  form.addEventListener("submit", async (event) => {
    //async საჭიროა იმიტომ, რომ მოგვიანებით გამოიყენება await backend-ის პასუხის დასალოდებლად.
    event.preventDefault();

    validation.clearFormErrors(form); //ყოველი ახალი submit-ის წინ წინა ვალიდაციის შეტყობინებები იშლება.

    /* --- Submitted values are cleaned before validation and storage. --- */
    const fullName = fullNameInput.value.trim();
    const company = companyInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    let isValid = true;

    if (fullName.length < 3) {
      validation.setFieldError(fullNameInput, "Full name must be at least 3 characters");
      isValid = false;
    }

    if (!validation.emailIsValid(email)) {
      validation.setFieldError(emailInput, "Please enter a valid email address");
      isValid = false;
    }

    if (!validation.passwordIsValid(password)) {
      validation.setFieldError(
        passwordInput,
        "Password must be at least 8 characters and contain a Latin letter and a number",
      );
      isValid = false;
    }

    if (confirmPassword !== password) {
      validation.setFieldError(confirmPasswordInput, "Passwords do not match");
      isValid = false;
    }

    if (!isValid) return;

    // ამ კოდში try...catch...finally საჭიროა, რადგან ანგარიშის შექმნა backend-თან კომუნიკაციას მოითხოვს. ინტერნეტმოთხოვნა ყოველთვის წარმატებული ვერ იქნება.
    try {
      // კოდი, რომელმაც შეიძლება შეცდომა გამოიწვიოს
      setSubmitLoading(true);

      /* --- Backend signup stores the secure account in MongoDB, never localStorage password. --- */
      const result = await data.authRequest("/auth/signup", {
        //აგზავნის პოსტ (POST) მოთხოვნას სერვერზე /auth/signup მისამართზე, რეგისტრაციის ფორმიდან აღებული მონაცემებით
        fullName,
        company,
        email,
        password,
        confirmPassword,
      });
      const users = storage.read(constants.USERS_KEY, []); //კითხულობს უკვე არსებულ მომხმარებელთა სიას ადგილობრივი მეხსიერებიდან
      const user = result.user; //სერვერის პასუხიდან იღებს ახლადრეგისტრირებული მომხმარებლის ობიექტს.
      const nextUser = {
        //სერვერიდან დაბრუნებული სრული მონაცემებიდან ირჩევს მხოლოდ საჭირო ველებს და ქმნის ახალ ობიექტს (nextUser)
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        company: user.company,
        role: user.role,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
      const remainingUsers = users.filter((item) => item.email?.toLowerCase() !== user.email.toLowerCase()); //დუპლიკატის თავიდან არიდება

      storage.write(constants.USERS_KEY, [...remainingUsers, nextUser]); //ამატებს განახლებულ სიას ძველ მომხმარებრებს შორის ახალ მომხმარებელს
      window.crmToast?.show("Account created successfully! Please log in.", "success");

      window.setTimeout(() => {
        window.location.href = constants.PAGES.login;
      }, 900);

      // წარმატების შემთხვევაში შესასრულებელი კოდი
    } catch (error) {
      //catch მხოლოდ შეცდომის შემთხვევაში სრულდება.
      validation.setFieldError(emailInput, error.message || "Account could not be created");
    } finally {
      // finally ორივე შემთხვევაში სრულდება:
      setSubmitLoading(false);
    }
  });
}
