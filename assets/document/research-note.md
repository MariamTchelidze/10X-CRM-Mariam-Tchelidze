# Research Note 📝

## Topic 🧭

How frontend storage, Fetch API requests, and backend persistence work together in the 10X CRM project.

## Key Learning 🧠

At the beginning of the project, localStorage was used as the main persistence layer because the PRD focused on vanilla JavaScript, browser APIs, DOM rendering, and client-side state. This made the data flow easy to see and explain.

After the backend upgrade, the project uses Express and MongoDB for the more production-style data flow. Authentication, clients, tasks, notifications, activity, messenger history, phone settings, and account deletion now go through protected API endpoints.

## Current Project Flow 🔁

- `storage.js` keeps localStorage helper logic reusable.
- `data.js` is the frontend API layer.
- The backend validates and stores protected CRM data.
- MongoDB keeps long-term records.
- JWT tokens connect the logged-in frontend user to protected backend routes.
- DummyJSON remains useful as an import/demo API for starter client data, which helps satisfy the PRD's external API requirement.
