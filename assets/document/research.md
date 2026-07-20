# 10X CRM Research

## Topic

Using browser storage, Fetch API, and frontend state management in a vanilla JavaScript CRM.

## Sources

- MDN Web Docs - Window: localStorage property: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- MDN Web Docs - Using the Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- MDN Web Docs - Response: ok property: https://developer.mozilla.org/en-US/docs/Web/API/Response/ok
- MDN Web Docs - EventTarget: addEventListener(): https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener

## What I Learned

`localStorage` is browser-based persistent storage. It keeps string data for the current origin even after page refresh or browser restart. Because this CRM is a frontend exam project without a backend, localStorage is used as the temporary data layer for users, sessions, clients, tasks, notifications, theme preferences, settings, communication history, and profile information.

`fetch()` is the browser API for making HTTP requests. It returns a Promise, so it works well with `async` and `await`. One important detail is that `fetch()` only rejects for network-level problems. HTTP errors such as 404 or 500 still return a response object, so the project should check `response.ok` and manually throw an error when the request failed.

Event listeners are the connection between user actions and JavaScript behavior. This project uses submit, click, change, input, drag, and storage events. For dynamic lists such as clients, tasks, notifications, and files, event delegation is useful because the buttons are created by JavaScript after the page loads.

## How This Applies To The CRM

The CRM stores required PRD data with exact localStorage keys:

- `crm_users` stores registered users.
- `crm_session` stores the active logged-in user.
- `crm_clients` stores API-loaded and locally edited clients.
- `crm_theme` stores the selected visual theme.

The CRM uses `js/core/storage.js` to keep JSON parsing and writing reusable. This prevents repeated `JSON.parse`, `JSON.stringify`, and try/catch code across every page.

The CRM uses `js/data/data.js` to communicate with DummyJSON. Initial clients are loaded with a GET request, new clients use a demo POST request, edited clients use a demo PUT request, and deleted clients use a demo DELETE request. Because DummyJSON is not a real project database, the final trusted CRM state is still saved locally in `crm_clients`.

## Exam Explanation

For the exam, I should explain that this is a frontend-first vanilla JavaScript CRM. The project uses localStorage because the PRD focuses on browser APIs, DOM rendering, validation, Fetch API, and responsive UI behavior.

In a real production CRM, private client data and passwords should not be stored in localStorage. A production version would use a backend with secure authentication, password hashing, server-side validation, and a database such as MongoDB.

## Georgian Learning Summary

ამ კვლევიდან გავიგე, რომ `localStorage` არის ბრაუზერის საცავი, რომელიც მონაცემებს ინახავს გვერდის განახლების შემდეგაც. ჩემს CRM-ში ის გამოიყენება იმიტომ, რომ პროექტი ამ ეტაპზე არის frontend-only და მთავარი მიზანია Vanilla JavaScript-ის ცოდნის ჩვენება.

ასევე გავიგე, რომ `fetch()` გამოიყენება API მოთხოვნებისთვის და მუშაობს Promise-ებით. მნიშვნელოვანია, რომ `fetch()` ავტომატურად არ აგდებს შეცდომას HTTP error status-ზე, ამიტომ კოდში საჭიროა `response.ok` შემოწმება.

ამ პროექტში ეს ცოდნა ჩანს `storage.js` და `data.js` ფაილებში. `storage.js` ამარტივებს localStorage-თან მუშაობას, ხოლო `data.js` აკავშირებს CRM-ს DummyJSON API-სთან.

## Critical Thinking

Using localStorage is correct for this educational frontend project, but it is not secure enough for real CRM production data. The best next technical step after the exam would be moving users, sessions, clients, tasks, notes, reminders, notifications, and communication history to a backend API with MongoDB.
