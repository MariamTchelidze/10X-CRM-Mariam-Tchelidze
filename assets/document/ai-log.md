# AI Log 🤖

## Entry 1 - PRD, Markup Plan, And First JavaScript Scope 🧭

1️⃣ Prompt Used:

> I am building CRM platform, with PRD file, requested by the course that I am learning for mastering vanilla JS HTML & Css/scss.
> I have started building the website, I have already built log in and sign up pages fully and plus started dashboard.
> I am using Scss for styling, will share the PRD file and my code, so you can go through it and fulfill the project.
> My the most important request is, you to not create all ready JavaScript at first, just finish working on fully responsive markup, with the color pallet
> I will send you and rewrite mixins also with modern standarts.\*\*

- **Tool / Help Used:** Codex reviewed the PRD direction and existing CRM structure, then helped organize HTML, SCSS, and JavaScript responsibilities.
- **Used / Changed / Rejected:** I used the modular structure and page-specific classes such as `loginPage`, `signupPage`, `dashboardPage`, `clientsPage`, `profilePage`, and `forgotPasswordPage`.
- I rejected generating every JavaScript feature at once.
- **Why:** This matched the learning goal: first complete responsive markup.
- **Critical Thinking:** I kept the project beginner-friendly and explainable instead of accepting a large AI-generated JavaScript system immediately.

## Entry 2 - JavaScript Structure Review 🧩

2️⃣ Prompt Used:

I made changes in JS folders and files, imported all the js files in app.js added this: (but appropriately)

> const forgotPasswordPage = document.querySelector(".forgotPasswordPage");
>
> initForgotPassword();
>
> function initForgotPassword() {
> if (!forgotPasswordPage) return;
>
> }
> to each page's js file and in html edited <script> tag
>
> and inserted function of forgot password in function initForgotPassword() {
> if (!forgotPasswordPage) return;
>
> }
> This. Please review the code, but without editing anything, tell me if what I did is correct? If not what is the mistakes and let me solve it by myself

- **Tool / Help Used:** Codex reviewed the JavaScript initialization pattern without editing the code.
- **Used / Changed / Rejected:** I kept page guards for page-specific files and used shared imports through `app.js`.
- **Why:** A shared script can load on every page, but each page module should run only when its page exists.
- **Critical Thinking:** I asked for review before automatic fixes so I could understand whether the architecture was correct.

## Entry 3 - Clients API And Dynamic Data 📡

3️⃣ Prompt Used:

> as we are using API for having client's information, should we have empty client card in our HTML? can you check it without editing anything, take into consideration that if I want any changes in code I will write: "start coding"
> So, now let's go through the HTML file and see, if there is any cards and elements that needs clearing content in HTML, because those information coming from API

- **Tool / Help Used:** Codex inspected `clients.html` and the clients JavaScript flow.
- **Used / Changed / Rejected:** I removed real hardcoded client cards and kept templates/dynamic render targets.
- **Why:** Client records should come from API/backend state, not fixed HTML.
- **Critical Thinking:** This made the clients page easier to explain: API request, state, filtering, sorting, rendering, and persistence.

## Entry 4 - Authentication Debugging 🔐

4️⃣ Prompt Used:

> I have tried to sign in the CRM system, after filling login information it didn't work, can you please go through the code and let me know what is happening? Important notice: don't change anything in code just let me know where is the bug existing?

- **Tool / Help Used:** Codex reviewed the auth, validation, session, and storage flow.
- **Used / Changed / Rejected:** I first used explanation-only debugging, then later approved fixes when the cause was clear.
- **Why:** Authentication is a Core requirement, so I needed to understand the bug, not only receive a patch.
- **Critical Thinking:** This helped me connect signup data, login validation, session storage, and protected route behavior.

## Entry 5 - Dashboard Workspace Sections 📊

5️⃣ Prompt Used:

> Now let's work on "Reports", "Sales", "Activities", "Favorites" section on dashboard, no hardcoded html, we need to make them fully dynamically changeable pages
> what's your POV, don't start coding yet

- **Tool / Help Used:** Codex planned and implemented dynamic dashboard workspace sections for reports, sales, activity, and favourites.
- **Used / Changed / Rejected:** I used JavaScript-rendered dashboard sections instead of keeping static placeholder content in HTML.
- I rejected hardcoded dashboard data for production-style behavior.
- **Why:** Dashboard sections are part of the CRM workspace and must show state-driven information that can change after user actions.
- **Critical Thinking:** I treated the dashboard as a central CRM control area, not only a visual landing page.

## Entry 6 - Client Details, Notes, And Reminders 👥

6️⃣ Prompt Used:

> Okay, let's work on the client informational modal:
>
> 1. make sure the content will not leave the cards
> 2. make sure i will be able to add notes and it will update notes card too, if I add one note Notes becomes 1 if add second it will become 2
> 3. notes should be displayed in modal: after I will add the not: it should be displayed below the reminder block: the visual should show: author: who wrote the note, it should be connected the task (if such is existing) and it should have status of ( reviewed, approved, declined, processed)
>    I want you to plan this full process, for example task attaching part isn't clear, I want that the note should be task-attachable, but I am not sure how it is possible. or Also, notes can be just a notes and not action required thing, So from you before starting working on it, I need full overview of my plan and your suggestion

- **Tool / Help Used:** Codex helped plan and build the client details modal, client notes, note counters, reminders, note statuses, and task attachment logic.
- **Used / Changed / Rejected:** I used dynamic client data, modal rendering, and client-specific notes instead of static client information.
- I rejected making every note mandatory-action because some notes can be informational only.
- **Why:** Client management is a PRD Core/Full area, and the CRM must support real client workflows such as adding, reviewing, editing, and following up.
- **Critical Thinking:** I separated client records, client notes, reminders, and related tasks so each part has a clear purpose and can be explained during the exam.

## Entry 7 - Bonus Feature Planning: 10X SensAI 🤖

7️⃣ Prompt Used:

> OK, what chat bot needs:
> It should have a brief access in CRM, it should be able to run between pages collect the contents and things, should have automated message suggestions so user can directly choose what they need, and also user should be able to ask him a question
>
> How are we going to build animated sensAI?

- **Tool / Help Used:** Codex helped plan the 10X SensAI assistant as a bonus CRM helper feature, with suggested prompts, a modal interface, and future AI integration direction.
- **Used / Changed / Rejected:** I used the prepared assistant UI and kept the feature explainable as a future AI integration.
- I rejected making it too complex for the exam scope.
- **Why:** The PRD focuses on CRM functionality, while SensAI is a bonus feature that improves the project presentation without replacing Core requirements.
- **Critical Thinking:** I separated required CRM logic from experimental AI features so I could explain what is finished now and what is prepared for future development.

## Entry 8 - MongoDB Backend Plan 🗄️

8️⃣ Prompt Used:

> OKay we should build a backend too I decided finally to add it introduce me a plan with Mongo DB + one backend technology for phone

- **Tool / Help Used:** Codex created a backend plan using Node.js, Express, MongoDB, Mongoose, JWT authentication, and protected API routes.
- **Used / Changed / Rejected:** I used MongoDB for real data storage and kept localStorage mainly for UI preferences and browser-side helpers.
- I rejected keeping the project frontend-only after deciding to make it closer to a real production CRM.
- **Why:** MongoDB supports persistent users, clients, tasks, notifications, activity, and messenger data.
- **Critical Thinking:** This changed the project from a static frontend demo into a full-stack learning project while still keeping the code modular and explainable.

## Entry 9 - Twilio Phone Service Planning 📞

9️⃣ Prompt Used:

> we have this task left: Add phone service/Twilio later.
> before starting it, I want to find out details. will the phone calls work without requesting outsider apps?
> Also can we point "Company's phone number" , that will be showed to any clients phone where we will call?
> if that's possible I want to create that logic too, so the user(owner) will be able to fill the "Company's phone number" and it will be common phone number for all the users that will have access on phone calls.
> only Owner will be able to manage the company's phone number.
> what's your POV? let me know first don't start working on code

- **Tool / Help Used:** Codex explained how CRM phone calls require a backend provider such as Twilio, because browser JavaScript cannot make real carrier calls by itself.
- **Used / Changed / Rejected:** I used a backend-ready phone service structure and environment variables for provider credentials.
- I rejected relying only on `tel:` links for the final architecture because they open an external device app instead of calling through the CRM.
- **Why:** The phone feature is a bonus production-style feature and needs backend security for account credentials.
- **Critical Thinking:** I learned the difference between frontend dialing UI, backend call creation, and third-party provider limitations.

## Entry 10 - Production Deployment Process 🚀

10️⃣ Prompt Used:

> OK, now we need to talk about deployment on Vercel, teach me in details

- **Tool / Help Used:** Codex guided the deployment process for the frontend on Vercel and later helped connect the backend service through Render.
- **Used / Changed / Rejected:** I used Vercel for the static frontend and Render for the Express backend API.
- I rejected keeping `localhost` API URLs in production.
- **Why:** A deployed CRM needs public frontend hosting and a public backend API URL.
- **Critical Thinking:** This helped me understand frontend deployment, backend deployment, environment variables, CORS, API base URLs, and production testing.
