# 10X CRM Glossary

This glossary explains the main technical and product terms used in the CRM project. I wrote it in beginner-friendly language so I can use it during exam preparation.

## 1. CRM

CRM means Customer Relationship Management. In this project, it is the platform where a user can manage clients, client statuses, notes, reminders, tasks, profile data, and sales progress.

## 2. Client

A client is a person or company stored in the CRM. Each client has data such as name, email, phone, company, deal value, status, notes, and reminders.

## 3. Client Status

Client status shows where the client is in the sales process. This project uses `lead`, `contacted`, `won`, and `lost`. Status is important because filters, dashboard metrics, reports, and pipeline charts depend on it.

## 4. localStorage

`localStorage` is browser storage that keeps data after refreshing or closing the browser. This CRM uses it for UI preferences, cached frontend state, profile image preview, theme, and session token data. Secure account data is handled by the backend.

## 5. Session

A session means the currently logged-in user. In this project, the session is saved with the `crm_session` key. Protected pages check this value before allowing the user to stay on the page.

## 6. API

API means Application Programming Interface. This CRM uses an Express backend API for real CRM data and keeps a DummyJSON import helper to demonstrate external API usage from the PRD.

## 7. Fetch

`fetch()` is a JavaScript function used to make HTTP requests. In this project, it sends login, signup, clients, tasks, notifications, activity, messenger, settings, and phone requests to the backend API.

## 8. Render

Render means creating or updating HTML from JavaScript data. For example, the Clients page renders client cards from the `clients` array instead of keeping hardcoded client cards in HTML.

## 9. Validation

Validation checks whether user input is correct before saving or submitting. This project validates email, password, required fields, duplicate users, client forms, profile fields, and password changes.

## 10. Modal

A modal is a dialog window that appears above the current page. This CRM uses modals for client details, adding/editing clients, reminders, task details, delete confirmations, settings, reset data, chat, and account deletion.

## 11. Toast

A toast is a small feedback message, usually shown in the corner of the screen. This CRM uses toasts for actions such as successful login, profile update, client reset, and validation feedback.

## 12. Dashboard Metrics

Dashboard metrics are calculated numbers shown on the dashboard, such as total clients, active deals, won revenue, pending tasks, pipeline health, and conversion rate.

## 13. Task Board

The task board is a workflow area where tasks can move between To Do, In Progress, Overdue, and Done. It includes drag and drop, checklist items, comments, assignees, archive, and recycle bin.

## 14. Responsive Design

Responsive design means the layout adapts to different screen sizes. This project uses SCSS media mixins, flexible grids, and a sliding sidebar for tablet/mobile layouts.

## 15. Theme Persistence

Theme persistence means the selected theme remains saved after refresh. This project supports dark theme, light theme, and custom accent color settings saved in browser storage.

## 16. Backend

The backend is the server-side part of the project. This CRM uses Node.js and Express to receive frontend requests, validate data, protect private routes, and communicate with MongoDB.

## 17. MongoDB

MongoDB is the database used by the backend. It stores users, clients, tasks, notifications, activity, messages, and settings as documents.

## 18. JWT

JWT means JSON Web Token. After login, the backend returns a token. The frontend sends this token with protected API requests so the backend knows which user is making the request.
