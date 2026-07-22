# AI Log

This log follows the PRD documentation requirement: exact prompt used, tool/help used, what was used/changed/rejected, why, and critical thinking. The prompt text is written as it was sent in the chat, including original spelling and wording, so it shows the real learning and review process.

## Entry 1 - PRD, Markup Plan, And First JavaScript Scope

- Exact Prompt Used:

> I am building  CRM platform, with PRD file, requested by the course  that I am  learning for mastering vanilla JS HTML & Css/scss
> I have started building  the website, I have already built  log in and sign up pages fully and plus started  dashboard.
> I am using Scss  for styling, will share  the PRD file and my code, so you can go through it  and  fulfill the project. 
> My the most important request is, you to not  create  all ready JavaScript at first, just finish working on fully responsive markup, with the color pallet I will send you and rewrite mixins also with modern standarts.
>
> for the first step, make sure that you will read the PRD, and build  ready markup fully, take into consideration that you will plan, classes and  id-es correctly so we can build the javascript  easier for it.
> for the first steps. add only : 
> Javascript - animation for sign-up sign-in pages (they should swap sides) 
> Javascript - theme controller functionality + color changes
> Javascript - eye open/close on password field

- Tool / Help Used: Codex reviewed the PRD direction and existing CRM structure, then helped organize HTML, SCSS, and JavaScript responsibilities.
- Used / Changed / Rejected: I used the modular structure and page-specific classes such as `loginPage`, `signupPage`, `dashboardPage`, `clientsPage`, `profilePage`, and `forgotPasswordPage`. I rejected generating every JavaScript feature at once.
- Why: This matched the learning goal: first complete responsive markup and only add the required JavaScript.
- Critical Thinking: I kept the project beginner-friendly and explainable instead of accepting a large AI-generated JavaScript system immediately.

## Entry 2 - JavaScript Structure Review

- Exact Prompt Used:

> I made changes in JS  folders and files, imported all the js files in app.js  added  this: (but appropriately)
> const forgotPasswordPage = document.querySelector(".forgotPasswordPage");
>
> initForgotPassword();
>
> function initForgotPassword() {
>   if (!forgotPasswordPage) return;
>
> }
> to each page's js file and in html edited <script> tag
>
> and inserted function of forgot password in function initForgotPassword() {
>   if (!forgotPasswordPage) return;
>
> } This please review the code, but without editing anything, tell me  if  what I did is correct, if not what is the mistakes and let me  solve it by myself 

- Tool / Help Used: Codex reviewed the JavaScript initialization pattern without editing the code.
- Used / Changed / Rejected: I kept page guards for page-specific files and used shared imports through `app.js`.
- Why: A shared script can load on every page, but each page module should run only when its page exists.
- Critical Thinking: I asked for review before automatic fixes so I could understand whether the architecture was correct.

## Entry 3 - Clients API And Dynamic Data

- Exact Prompt Used:

> as we are using  API for having client's information, should we have empty client card in our HTML? can you check it without editing anything, take into consideration that if I want any changes in code I will write: "start coding" 
> So, now let's go throught the HTML file and see, if there is any cards and elements that needs clearing content in HTML, because those information coming from API

- Tool / Help Used: Codex inspected `clients.html` and the clients JavaScript flow.
- Used / Changed / Rejected: I removed real hardcoded client cards and kept templates/dynamic render targets.
- Why: Client records should come from API/backend state, not fixed HTML.
- Critical Thinking: This made the clients page easier to explain: API request, state, filtering, sorting, rendering, and persistence.

## Entry 4 - PRD Audit And Requirements Tracking

- Exact Prompt Used:

> OK. let's  gothrought the  PRD document I will attach now, instead of the PRD I have in md files: 
> and let's make a table for CORE requirements, what I have in match and what isn't
> after CORE create new Table, for Full requirements, what's match partly/full what isn;t 

- Tool / Help Used: Codex compared the PRD requirements with the project files and produced organized checklist/report documents.
- Used / Changed / Rejected: I used the report to separate Core, Full, and bonus features.
- Why: This helped keep the exam work aligned with grading requirements instead of only adding visual features.
- Critical Thinking: The audit made it clear which features were required and which ones were extras.

## Entry 5 - Authentication Debugging

- Exact Prompt Used:

> I have tried  to sign in the CRM system, after filling   login information it didn't work, can you please go through the code and  let me know what is happening? Important notice: don't change  anything in code just let me know  where is the bug existing?

- Tool / Help Used: Codex reviewed the auth, validation, session, and storage flow.
- Used / Changed / Rejected: I first used explanation-only debugging, then later approved fixes when the cause was clear.
- Why: Authentication is a Core requirement, so I needed to understand the bug, not only receive a patch.
- Critical Thinking: This helped me connect signup data, login validation, session storage, and protected route behavior.

## Entry 6 - Task Board Planning And Implementation

- Exact Prompt Used:

> I plan to build  a drag & drop task bar in profile.html  like the user who will visit the profile page will be able to see their tasks, what is in progress still and which task is overdue, or need to be done.
> before writing the code  let's discuss about the idea and  the location for the build, maybe it's better to build  task-board on the sidebar? and  have this drag& drop board as a new section in  dashboard.html? 
> any  good ideas about this is acceptable 

- Exact Follow-up Prompt Used:

> in to do tasks only, we will need  plus  button with add task  so if the  card is   empty user can create task  set due date, priority (high medium low) description sub tasks and  title also  the  client whose task is it, and in case of need the user should be able to assign task  to anyone from their  team, choose colors.
> rate the idea before  starting coding and  ask me for permission to start coding  after your review 

- Tool / Help Used: Codex planned and implemented a task board as a dashboard workflow section.
- Used / Changed / Rejected: I used dashboard placement, task columns, add task modal, priorities, overdue automation, and task details. Later I simplified some bonus logic for exam safety, then restored parts again.
- Why: Tasks are workflow data and fit better in Dashboard than Profile.
- Critical Thinking: I separated PRD-required client/auth logic from bonus task-board logic so I can explain the scope honestly.

## Entry 7 - Animation Review And UX Iteration

- Exact Prompt Used:

> I want to add the animation for following feature:
> when a customer logs in and clicks on "sign in" I don't want a regular opening, but smooth animational transfer from login-page to the dashboard and  same for log out click, what would your POV about this and what kind of animation would you advice? don't start coding before my approval.

- Exact Problem Report Used:

> 1. the page swap animation leaves page blank so many time that I can even take a screenshot if the empty page.
> 2. the clickable elements on log in, signup, forgot password pages, makes page to bounce and it's looks ugly
> 3. log in click, doesn't smoothly goes to dashboard, the login fades out but user can see it  when dashboard is already loaded
> 4. 4. all animated clicks, makes pages to bounce

- Tool / Help Used: Codex reviewed the auth page animation and adjusted transition behavior.
- Used / Changed / Rejected: I rejected the animation versions that caused blank screens, page bounce, or visual jumps.
- Why: Animation should improve UX, not make navigation feel unstable.
- Critical Thinking: This shows that I tested the AI output visually and requested corrections based on real behavior.

## Entry 8 - Frontend Production Cleanup

- Exact Prompt Used:

> Okay, now carefully check the whole project with PRD + Roadmap, and  let me know:
> 1. what can be simplified again -for PRD FULL match
> 2.  what functions, types, styles  classes have we used from roadmap - for this prepare html document,  for each topic write used/not used where is used

- Exact Follow-up Prompt Used:

> OKay, now let's clear the code after simplify, maybe there are anything left? like styles or scripts?

- Tool / Help Used: Codex reviewed project files, simplified exam-heavy bonus functionality, cleaned unused logic, and updated learning reports.
- Used / Changed / Rejected: I simplified some bonus features temporarily while keeping PRD Full requirements understandable.
- Why: The project needed to remain strong but still learnable before the exam.
- Critical Thinking: I balanced feature richness with the risk of not being able to explain complex code live.

## Entry 9 - Backend Planning With MongoDB

- Exact Prompt Used:

> OKay we should build a backend too  I decided  finally to  add it  introduce me a plan with Mongo DB  + one backend technology for phone 

- Exact Follow-up Prompt Used:

> OK, I delted the  folder, I think we should start with building folder-file structure first and then start coding, now we have  a great  set of files so you can easily find out what kind of  folder-files will be needed right?

- Tool / Help Used: Codex planned the backend, then created the Express/MongoDB folder structure and later helped build auth, clients, tasks, notifications, activity, messenger, settings, and phone API routes.
- Used / Changed / Rejected: I moved from frontend-only localStorage data toward backend persistence with MongoDB and JWT.
- Why: This makes the CRM more production-ready and answers the lecturer's question about adding backend.
- Critical Thinking: I chose MongoDB because it matches the learning goal and fits CRM documents such as users, clients, tasks, notifications, and messages.

## Entry 10 - Deployment, Backend Environment, And Render/Vercel

- Exact Prompt Used:

> OK, what's the next step them, after keeping the url ?

- Exact Follow-up Prompt Used:

> ok, start preparing  code for production  I don't want   manual edits in the backend  part as I am not awared of this topic 

- Tool / Help Used: Codex helped configure production API URLs, CORS, Render backend settings, Vercel frontend deployment guidance, and environment variable setup.
- Used / Changed / Rejected: I deployed the frontend to Vercel and backend to Render, keeping the Render URL as the API service URL.
- Why: Vercel hosts the static frontend, while Render runs the Express backend.
- Critical Thinking: I learned that the Render backend URL is not the public website; it is the background API used by the Vercel site.

## Entry 11 - Twilio Phone Integration

- Exact Prompt Used:

> ok for testing, how can I make a real call for now?  to test it?

- Exact Follow-up Prompt Used:

> OK, fron front-end side: 
> 1. I should be able to  dial number by using numbers from keyboard
> 2. I should  be able  to use  copy-paste
> 3. I should be able  to delete each last number from my keyboard - backspace 

- Tool / Help Used: Codex explained Twilio requirements and helped connect the frontend phone UI to a backend phone endpoint.
- Used / Changed / Rejected: I kept a configured allowed number for safe testing and learned that real calling depends on valid Twilio credentials, verified numbers, and backend environment variables.
- Why: Browser-only JavaScript cannot make direct carrier calls without an outside phone provider.
- Critical Thinking: This helped me understand the difference between `tel:` links and true backend/provider-based calling.

## Entry 12 - Translation Simplification

- Exact Prompt Used:

> the one thing I think is to cancel all the translations, just leave a toggle button and if user will click on :"KA" or  "Georgian " in themes, it will have toast " the feauture is  UI ready, will be integrated later. if user will click on "EN, "English" no toast needed

- Tool / Help Used: Codex simplified the translation controller.
- Used / Changed / Rejected: I rejected full Georgian translation for now and kept the language UI as a future-ready placeholder.
- Why: Translation was not the priority compared with PRD features, backend, and exam explanation.
- Critical Thinking: This reduced complexity while preserving a clear future feature path.

## Entry 13 - Responsive QA And Mobile Fixes

- Exact Prompt Used:

> Clients page has awful responsive for mobile, please work on it  make it  smooth, choose  the  system and layout you want, actually go through all the pages and  make  responsive from 375px and more  smooth and beautiful 
> in section make it:  logo - Communications, logo tasks, on the same line. settings page height  is too big on 375 px

- Exact Follow-up Prompt Used:

> Responsive layout: 
> on dashboard header live clock leaves the container and we have  flow  messy: 
> on clients page: search and sort icons, leave  the  place 
> on clients-card, we must keep: info, edit, delete icons in one line  and not vertically
> clients header: Add clients button is  big size so it covers live clock
> on each mobile headers we can just write: Dashboard, clients, and display none the orange headers
> on favorites header live clock leaves the container and we have  flow  messy: 
> tasks section: on opening the site it's  in dropdown state by default icon and text for tasks and communications must be on same line and not vertically set

- Tool / Help Used: Codex inspected SCSS and HTML, adjusted mobile header, clients card, sidebar dropdown, settings modal, and regenerated compiled CSS.
- Used / Changed / Rejected: I used responsive SCSS fixes and removed the default `open` attribute from task dropdowns.
- Why: Mobile usability is important for a polished CRM demo and production-style presentation.
- Critical Thinking: I used screenshots to report exact layout problems instead of saying only that the page looked bad.

## Entry 14 - Current Project Status Check

- Exact Prompt Used:

> Okay, so check PRD and project one more time, in AI-log.md when writing prompt, you must write it exactly as I have written it in chat

- Tool / Help Used: Codex reviewed the current project documentation and rewrote this AI log so the prompt text is exact chat text.
- Used / Changed / Rejected: I changed the AI log from paraphrased prompts to exact prompt blocks.
- Why: Exact prompts make the documentation more transparent and match the requested PRD-style AI usage evidence.
- Critical Thinking: This makes it easier to defend the project honestly: it shows where AI helped, what I approved, and what decisions I made.
