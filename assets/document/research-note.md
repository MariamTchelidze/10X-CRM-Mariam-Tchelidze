# 10X CRM Research Note

## Topic

Using browser storage and the Fetch API in a vanilla JavaScript CRM.

## English Sources

- MDN Web Docs - Window: localStorage property: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- MDN Web Docs - Using the Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch

## What I Learned

`localStorage` gives a page access to a browser storage object for the current origin. Data saved there remains available across browser sessions, which is useful for this exam project because the CRM does not have a backend yet. I use it to persist users, session, clients, tasks, theme settings, notifications, and profile image state.

The Fetch API is the modern browser API for making HTTP requests. It returns Promises, so it works naturally with `async` and `await`. A very important detail is that `fetch()` does not automatically fail for HTTP error statuses such as 404. The code should check `response.ok` and throw an error manually when needed.

## How This Applies To My CRM

In the CRM, `js/core/storage.js` wraps localStorage in helper methods: `read`, `write`, and `remove`. This makes the rest of the project cleaner because pages do not repeat `JSON.parse`, `JSON.stringify`, and try/catch logic everywhere.

In `js/data/data.js`, the CRM uses `fetch()` to load users from DummyJSON and transform them into CRM clients. The same data module also contains demo POST, PUT, and DELETE requests. Even though DummyJSON is not a real project backend, it helps me practice real API flow: request, response check, JSON parsing, error handling, and local state update.

## Georgian Summary

ამ კვლევიდან გავიგე, რომ `localStorage` არის ბრაუზერის საცავი, რომელიც მონაცემებს ინახავს გვერდის განახლების ან ბრაუზერის დახურვის შემდეგაც. ჩემს CRM-ში ეს საჭიროა იმიტომ, რომ პროექტს ჯერ არ აქვს backend და მომხმარებლები, სესია, კლიენტები, დავალებები და თემა უნდა დარჩეს შენახული.

ასევე გავიგე, რომ `fetch()` გამოიყენება API მოთხოვნებისთვის და მუშაობს Promise-ებზე. მნიშვნელოვანია, რომ `fetch()` ყოველთვის არ აგდებს შეცდომას HTTP error status-ზე, მაგალითად 404-ზე, ამიტომ კოდში საჭიროა `response.ok` შემოწმება.

ჩემს პროექტში ეს ცოდნა ჩანს `storage.js` და `data.js` ფაილებში. `storage.js` ამარტივებს localStorage-თან მუშაობას, ხოლო `data.js` აკავშირებს CRM-ს DummyJSON API-სთან და კლიენტების საწყის მონაცემებს იღებს.

## Why This Matters For The Exam

I should be able to explain that the current project is frontend-only, so localStorage is used as temporary persistence. I should also explain that a real production CRM would move users, authentication, clients, tasks, notes, and reminders to a backend database such as MongoDB, while the frontend would call backend API endpoints instead of writing directly to browser storage.

## My Critical Thinking

Using localStorage is correct for the course requirement and vanilla JavaScript practice, but it is not secure for real passwords or private client data. For the exam, I will explain that this is a learning/demo storage approach. In a real application, passwords would be hashed on the backend, sessions would use secure tokens/cookies, and client data would be protected by authentication and server-side validation.
