# 10X CRM Backend

This folder will contain the Node.js, Express, MongoDB, and phone-service backend for the CRM.

Current step: Express server setup is ready.

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

Planned build order:

1. Express server setup. Done.
2. MongoDB connection. Next.
3. Auth API.
4. Clients API.
5. Tasks, notes, reminders, notifications, and activities.
6. Messenger API.
7. Phone service integration.
