# 10X CRM 🧭

## About 📌

10X CRM is a vanilla JavaScript CRM platform built for the 10X course exam project. The app helps a user register, log in, manage client leads, review CRM dashboard information, and work with CRM data through a Node.js, Express, and MongoDB backend.

The frontend remains vanilla HTML, SCSS, and JavaScript so the main browser concepts are visible and easy to explain: DOM rendering, form validation, fetch requests, event listeners, local UI state, and responsive behavior. The backend adds production-style authentication, protected API routes, and MongoDB persistence.

---

## Features ✨

- **Sign up** with validation for full name, email, duplicate email, password, and confirm password.
- **Log in** with registered users and create a `crm_session` in localStorage.
- **Auth guard** for protected pages: Dashboard, Clients, and Profile.
- **Logout** flow that removes only the active session.
- **Dark and light theme** support with persisted theme preference.
- **Clients page** connected to the CRM backend API for loading, creating, editing, and deleting client records.
- **Client rendering** with search, status filters, sorting, add client, delete client, loading, retry, and localStorage persistence.
- **Responsive CRM layout** with sidebar navigation and mobile drawer behavior.
- **Toast notifications** for success and error feedback.
- **Extra learning features:** task board, notifications, reports visuals, files preview, settings, and communication widgets.

---

## Tech Stack 🛠️

- HTML5
- SCSS / CSS3
- Vanilla JavaScript
- Browser localStorage and sessionStorage for UI preferences and active session data
- Fetch API
- Node.js / Express backend
- MongoDB Atlas with Mongoose
- JWT authentication
- Git

---

## Project Structure 🗂️

- **`index.html`** - login page.
- **`signup.html`** - account creation page.
- **`forgot-password.html`** - password recovery UI.
- **`dashboard.html`** - protected CRM workspace and dashboard sections.
- **`clients.html`** - protected clients database page.
- **`profile.html`** - protected user profile page.
- **`js/auth/`** - signup, login, logout, validation, and auth guard logic.
- **`js/clients/`** - clients rendering, form validation, filtering, sorting, and CRUD flow.
- **`js/data/data.js`** - frontend API request helpers and backend data mapping.
- **`js/core/`** - shared constants and storage helpers.
- **`js/ui/`** - theme, modal, toast, live header, sidebar, settings, and shared UI behavior.
- **`backend/`** - Express API, MongoDB models, controllers, routes, middleware, and production deployment config.
- **`styles/`** - SCSS architecture for abstracts, base, components, layout, pages, and themes.
- **`assets/document/`** - exam documentation files:
  - <mark>`ai-log.md`</mark> - AI assistance log and project decision notes.
  - <mark>`glossary.md`</mark> - CRM and JavaScript terminology for exam preparation.
  - <mark>`research.md`</mark> - research summary for localStorage, Fetch API, and frontend persistence.

---

## How to Run 🚀

1. Open the project folder.
2. Start the backend from the `backend` folder with `npm start`.
3. Run the frontend with a local server, for example VS Code Live Server.
4. Open `index.html` in the browser through that local server.
5. Create a new account on the Sign Up page.
6. Log in with the created account.
7. Visit Dashboard, Clients, and Profile to test protected routes and persisted data.

---

## LocalStorage Keys 💾

The project follows the PRD localStorage keys:

- **`crm_users`** - registered users for the frontend learning flow.
- **`crm_session`** - current logged-in user session.
- **`crm_clients`** - client data loaded from API and changed by the app.
- **`crm_theme`** - selected theme.

Extra keys may be used for additional features, such as profile avatar, tasks, settings, notifications, and communication history.

---

## Backend API 🔗

Local backend URL:

- `http://localhost:5000/api`

Production backend URL planned for Render:

- `https://one0x-crm-mariam-tchelidze-1.onrender.com/api`

Main API groups:

- **`/api/auth`**
- **`/api/clients`**
- **`/api/tasks`**
- **`/api/notifications`**
- **`/api/activity`**
- **`/api/messages`**
- **`/api/settings`**

Frontend API selection is handled in `js/core/constants.js`: local frontend pages use `localhost:5000`, while the deployed Vercel frontend uses the production Render backend URL.

---

## Backend Deployment ☁️

The backend includes a `render.yaml` file for Render deployment.

Recommended Render service name:

- `10-x-crm-mariam-tchelidze-backend`

Required production environment variables:

- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `JWT_EXPIRES_IN`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `ALLOWED_CALL_NUMBER`

When the custom Vercel domain is connected, set `CLIENT_URL` in Render to include both frontend origins:

- **`https://10-x-crm-mariam-tchelidze.vercel.app,https://10xsensai.xyz`**

⚠ **Never commit the real `.env` file. Use `backend/.env.example` as the safe template.**

---

## Live Demo 🌐

🌐[Custom domain:][https://10xsensai.xyz]

---

## Test Account 🧪

Because this project now uses backend authentication, the evaluator can create a fresh account from `signup.html` and then log in from `index.html`.

Suggested test values:

- **Full Name:** `Test User`
- **Email:** `test@example.com`
- **Password:** `test1234`

## Credits 🙌

Built by Mariam Tchelidze for the 10X CRM exam project.

AI assistance was used for planning, code review, UI/UX discussion, debugging guidance, and documentation organization. Final understanding, project decisions, and exam explanation are my responsibility.
