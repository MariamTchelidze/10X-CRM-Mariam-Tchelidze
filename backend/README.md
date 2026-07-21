# 10X CRM Backend

This folder will contain the Node.js, Express, MongoDB, and phone-service backend for the CRM.

Current step: MongoDB connection is wired.

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
3. Auth API. Next.
4. Clients API.
5. Tasks, notes, reminders, notifications, and activities.
6. Messenger API.
7. Phone service integration.
