# AI Log

This log follows the PRD requirement: prompt -> tool/help used -> what I used, changed, or rejected -> why. It shows how AI was used as a learning and review assistant, not as a replacement for understanding the project.

## Entry 1 - PRD and Project Structure

- Prompt -> I shared the CRM PRD and asked Codex to read it before writing JavaScript. I asked to finish responsive markup first, plan class names and IDs correctly, rewrite SCSS mixins with modern standards, and only add the required small JavaScript features first.
- Tool / Help Used -> Codex reviewed the PRD and suggested a structure for auth pages, protected pages, reusable UI modules, storage helpers, clients logic, profile logic, and dashboard sections.
- Used / Changed / Rejected -> I used the modular folder idea (`auth`, `clients`, `core`, `data`, `dashboard`, `profile`, `ui`) and page-specific classes such as `loginPage`, `signupPage`, `clientsPage`, and `profilePage`.
- Why -> This matched the PRD instruction to keep shared logic in one place and made the code easier to explain during the exam.
- Critical Thinking -> I rejected generating all JavaScript at once because I wanted to learn the functions step by step and keep the first stage focused on markup and required UI behavior.

## Entry 2 - Authentication Pages and Validation

- Prompt -> I asked Codex to review my JavaScript structure after I imported page scripts into `app.js` and added guards such as `if (!forgotPasswordPage) return;`.
- Tool / Help Used -> Codex reviewed the auth files and explained why page-specific initialization is useful in a multi-page vanilla JavaScript project.
- Used / Changed / Rejected -> I kept the page-specific guards and used them only for JavaScript logic, not for styling.
- Why -> This avoids errors when one shared `app.js` is loaded on every page, but only the current page's logic should run.
- Critical Thinking -> I also asked for email validation to be stricter (`.com`, `.net`, `.org`) and password validation to accept only Latin characters. This is stricter than the base PRD, so I must explain it as a security/quality improvement, not a hidden PRD requirement.

## Entry 3 - Client API and Dynamic Rendering

- Prompt -> I asked whether hardcoded client cards should remain in HTML if client information comes from an API.
- Tool / Help Used -> Codex inspected the clients page and explained that API-driven content should be rendered from JavaScript state.
- Used / Changed / Rejected -> I changed the Clients page toward a dynamic render flow using DummyJSON API data, `crm_clients`, and reusable card rendering.
- Why -> This matches the PRD requirement that clients load from `https://dummyjson.com/users?limit=30`, transform into CRM client objects, render with JavaScript, and persist in localStorage.
- Critical Thinking -> I did not want fake static cards to remain as real data because that would make API, filters, and storage harder to explain.

## Entry 4 - UI Feedback and Rework

- Prompt -> I gave visual feedback several times: the logo/name was too small, profile image controls were not centered, delete text should become an icon, theme switch icons were too close, and some profile image states were not beautiful.
- Tool / Help Used -> Codex suggested and implemented UI refinements using existing icons, SCSS, tooltips, and theme-aware assets.
- Used / Changed / Rejected -> I used the improved icon-based controls and centered layouts, but I rejected earlier states that looked visually weak or unclear.
- Why -> A CRM should feel clean and professional, and the PRD expects a usable business-product interface.
- Critical Thinking -> This helped me practice UI review: not every working feature is finished if the spacing, icon meaning, or state feedback feels confusing.

## Entry 5 - Task Board and Extra Features

- Prompt -> I asked whether a drag-and-drop task board should live in the profile page, sidebar, or dashboard section. Later I requested add-task, priorities, overdue status, archive, recycle bin, checklist editing, comments, assignee changes, and notifications.
- Tool / Help Used -> Codex helped plan the feature as a dashboard section with localStorage state and task modals.
- Used / Changed / Rejected -> I used the dashboard-section approach because tasks are workflow data, not profile settings. I also requested several UI changes after seeing the first card/modal design.
- Why -> This is beyond Core requirements, but it makes the CRM feel closer to a real product and gives me more JavaScript practice.
- Critical Thinking -> I must separate this extra feature from the PRD Core explanation. It is useful polish, but Core grading still depends mostly on auth, clients, storage, docs, and protected pages.

## Entry 6 - Animation Review and Rework

- Prompt -> I asked for smooth login/signup/forgot-password page animations and later reported problems: blank screen stayed visible too long, clickable elements bounced, pages jumped, and the animation felt too fast.
- Tool / Help Used -> Codex reviewed and adjusted the page transition approach.
- Used / Changed / Rejected -> I rejected the first animation behavior because it created a bad user experience. I changed the direction: auth pages slide horizontally, login submits slide away, logout returns normally, and the animation speed was slowed down.
- Why -> This made the UX smoother without making navigation confusing.
- Critical Thinking -> This is a good example of not accepting AI output blindly. I tested it visually, noticed specific problems, described them clearly, and requested a better solution.

## Entry 7 - PRD Audit

- Prompt -> I asked Codex to read the attached PRD again and compare it with the current code.
- Tool / Help Used -> Codex extracted the PRD text, scanned the project files, and generated a browser-ready HTML report.
- Used / Changed / Rejected -> I used the audit to identify what was truly Core and what belonged to Full requirements.
- Why -> The report showed that Core was close, but documentation still needed to be completed and some Full features were only partially wired.
- Critical Thinking -> This helped me stop adding random features and return to PRD-scored work first.

## Entry 8 - Debugging and Code Review

- Prompt -> I asked Codex to investigate why login stopped working and to explain the bug without editing anything first.
- Tool / Help Used -> Codex scanned the JavaScript files and explained where the problem was likely coming from.
- Used / Changed / Rejected -> I used the review process to understand the flow between signup, `crm_users`, login, and `crm_session`.
- Why -> Auth is one of the most important Core flows, so I need to be able to explain it line by line.
- Critical Thinking -> Asking for explanation before code changes helped me learn the bug instead of only receiving a finished patch.

## Entry 9 - Backend Upgrade and Production Deployment

- Prompt -> I decided to add a backend with MongoDB and later asked for Twilio phone-call support, Vercel frontend deployment, and Render backend deployment guidance.
- Tool / Help Used -> Codex helped plan and build the Express structure, MongoDB connection, auth API, clients API, tasks API, notifications/activity APIs, messenger API, settings API, and Twilio call endpoint.
- Used / Changed / Rejected -> I upgraded the project from a frontend/localStorage-first CRM into a frontend plus backend CRM. I kept localStorage for UI preferences and session token handling, but moved secure account and CRM data flow to protected backend APIs.
- Why -> This makes the project more production-ready and gives me a stronger exam explanation: the PRD frontend concepts are still visible, while the backend demonstrates real-world architecture.
- Critical Thinking -> I should explain that Twilio requires real provider credentials and verified numbers. The app code can start calls through the backend, but the phone service depends on correct Render environment variables and Twilio account setup.
