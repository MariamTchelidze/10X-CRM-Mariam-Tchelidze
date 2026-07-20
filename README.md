# 10X CRM

## About

10X CRM is a vanilla JavaScript CRM platform built for the 10X course exam project. The app helps a sales user register, log in, manage client leads, review CRM dashboard information, and keep project data inside the browser.

The project is intentionally built without a backend so the main JavaScript concepts are visible and easy to explain: DOM rendering, form validation, localStorage state, fetch requests, event listeners, and responsive UI behavior.

## Features

- Sign up with validation for full name, email, duplicate email, password, and confirm password.
- Log in with registered users and create a `crm_session` in localStorage.
- Auth guard for protected pages: Dashboard, Clients, and Profile.
- Logout flow that removes only the active session.
- Dark and light theme support with persisted theme preference.
- Clients page that loads users from DummyJSON API on first visit.
- Client rendering with search, status filters, sorting, add client, delete client, loading, retry, and localStorage persistence.
- Responsive CRM layout with sidebar navigation and mobile drawer behavior.
- Toast notifications for success and error feedback.
- Extra learning features: task board, notifications, reports visuals, files preview, settings, and communication widgets.

## Tech Stack

- HTML5
- SCSS / CSS3
- Vanilla JavaScript
- Browser localStorage and sessionStorage
- Fetch API
- DummyJSON API
- Git

## Project Structure

- `index.html` - login page.
- `signup.html` - account creation page.
- `forgot-password.html` - password recovery UI.
- `dashboard.html` - protected CRM workspace and dashboard sections.
- `clients.html` - protected clients database page.
- `profile.html` - protected user profile page.
- `js/auth/` - signup, login, logout, validation, and auth guard logic.
- `js/clients/` - clients rendering, form validation, filtering, sorting, and CRUD flow.
- `js/data/data.js` - API requests and DummyJSON client mapping.
- `js/core/` - shared constants and storage helpers.
- `js/ui/` - theme, modal, toast, live header, sidebar, settings, and shared UI behavior.
- `styles/` - SCSS architecture for abstracts, base, components, layout, pages, and themes.
- `assets/document/` - exam documentation files:
  - `ai-log.md` - AI assistance log and project decision notes.
  - `glossary.md` - CRM and JavaScript terminology for exam preparation.
  - `research.md` - research summary for localStorage, Fetch API, and frontend persistence.

## How to Run

1. Open the project folder.
2. Run the project with a local server, for example VS Code Live Server.
3. Open `index.html` in the browser through that local server.
4. Create a new account on the Sign Up page.
5. Log in with the created account.
6. Visit Dashboard, Clients, and Profile to test protected routes and persisted data.

## LocalStorage Keys

The project follows the PRD localStorage keys:

- `crm_users` - registered users for the frontend learning flow.
- `crm_session` - current logged-in user session.
- `crm_clients` - client data loaded from API and changed by the app.
- `crm_theme` - selected theme.

Extra keys may be used for additional features, such as profile avatar, tasks, settings, notifications, and communication history.

## API

The Clients page uses DummyJSON:

- `GET https://dummyjson.com/users?limit=30`
- `POST https://dummyjson.com/users/add`
- `DELETE https://dummyjson.com/users/{id}`

DummyJSON does not permanently save newly created local clients. If a locally added client receives a temporary API id, delete behavior still updates local CRM state so the frontend flow stays consistent.

## Live Demo

Live demo link: https://10-x-crm-mariam-tchelidze.vercel.app/index.html

## Test Account

Because this is a localStorage-based educational project, the evaluator can create a fresh account from `signup.html` and then log in from `index.html`.

Suggested test values:

- Full Name: `Test User`
- Email: `test@example.com`
- Password: `test1234`

## Exam Notes

This project stores passwords in localStorage only because the PRD is a frontend-only learning project without a backend. In a real production CRM, passwords must be stored on a server as secure hashes, never as plain text in the browser.

## Credits

Built by Mariam Tchelidze for the 10X CRM exam project.

AI assistance was used for planning, code review, UI/UX discussion, debugging guidance, and documentation organization. Final understanding, project decisions, and exam explanation are my responsibility.
