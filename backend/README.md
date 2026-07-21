# 10X CRM Backend

This folder will contain the Node.js, Express, MongoDB, and phone-service backend for the CRM.

Current step: Auth API is wired.

## Environment Setup

Create a private `.env` file from `.env.example`:

```bash
copy .env.example .env
```

Then replace the placeholder `MONGO_URI` with your MongoDB Atlas connection string.

Important: `.env` is ignored by Git and must not be pushed.

## Local Test

```bash
cd backend
npm install
npm run dev
```

Then open:

```text
http://localhost:5000/api/health
```

Expected result: a JSON response with `status`, `message`, `environment`, `uptime`, and `timestamp`.

When MongoDB is connected, the health response should also include:

```json
{
  "database": "connected"
}
```

Planned build order:

1. Express server setup. Done.
2. MongoDB connection. Done.
3. Auth API. Done.
4. Clients API.
5. Tasks, notes, reminders, notifications, and activities.
6. Messenger API.
7. Phone service integration.

## Auth API Test Order

Use Thunder Client, Postman, or another API client while `npm run dev` is running.

### Sign up

```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json
```

```json
{
  "fullName": "James Carter",
  "company": "10X CRM Demo",
  "email": "james@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!"
}
```

Expected result: `201 Created`, a `token`, and a safe `user` object without the password.

### Log in

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json
```

```json
{
  "email": "james@example.com",
  "password": "Password123!"
}
```

Expected result: `200 OK`, a `token`, and the same safe `user` object.

### Get current user

```http
GET http://localhost:5000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

Expected result: `200 OK` with the logged-in user's account data.
