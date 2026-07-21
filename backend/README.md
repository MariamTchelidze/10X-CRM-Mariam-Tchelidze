# 10X CRM Backend

This folder will contain the Node.js, Express, MongoDB, and phone-service backend for the CRM.

Current step: Phone settings API is wired.

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
4. Clients API. Done.
5. Tasks API. Done.
6. Notifications and Activity APIs. Done.
7. Messenger API. Done.
8. Phone settings API. Done.
9. Twilio phone service integration.

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

## Clients API Test Order

All clients endpoints require the login token:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

### List clients

```http
GET http://localhost:5000/api/clients
```

Optional filters:

```text
?status=lead&search=alpha&sort=value-desc
```

### Create client

```http
POST http://localhost:5000/api/clients
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

```json
{
  "name": "Alpha Group",
  "company": "Alpha Group LLC",
  "email": "alpha@example.com",
  "phone": "+995 574 431 557",
  "country": "Georgia",
  "timezone": "Asia/Tbilisi",
  "status": "lead",
  "dealValue": 2500
}
```

### Get one client

```http
GET http://localhost:5000/api/clients/CLIENT_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

### Update client

```http
PATCH http://localhost:5000/api/clients/CLIENT_ID
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

```json
{
  "status": "contacted",
  "dealValue": 3000
}
```

### Delete client

```http
DELETE http://localhost:5000/api/clients/CLIENT_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

## Tasks API Test Order

All task endpoints require the login token:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

### List tasks

```http
GET http://localhost:5000/api/tasks
```

Optional filters:

```text
?status=todo&archived=false&deleted=false
```

### Create task

```http
POST http://localhost:5000/api/tasks
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

```json
{
  "title": "Follow up with Alpha Group",
  "client": "Alpha Group",
  "description": "Send pricing notes after the demo.",
  "dueDate": "Jul 24, 2026",
  "dueAt": "2026-07-24T19:59:59.000Z",
  "priority": "High",
  "status": "todo",
  "assignee": "James Carter",
  "subtasks": [
    { "text": "Prepare offer", "done": false },
    { "text": "Send email", "done": false }
  ],
  "comments": []
}
```

### Update task

```http
PATCH http://localhost:5000/api/tasks/TASK_ID
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

```json
{
  "status": "in-progress",
  "comments": [
    {
      "author": "James Carter",
      "mention": "Sales Team",
      "message": "Started working on the offer."
    }
  ]
}
```

### Delete task permanently

```http
DELETE http://localhost:5000/api/tasks/TASK_ID
Authorization: Bearer YOUR_TOKEN_HERE
```

## Notifications API Test Order

All notification endpoints require the login token:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

### List notifications

```http
GET http://localhost:5000/api/notifications
```

### Create notification

```http
POST http://localhost:5000/api/notifications
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

```json
{
  "message": "New task assigned to James Carter: Follow up with Alpha Group",
  "taskId": "TASK_ID_OPTIONAL"
}
```

### Mark one notification read/selected

```http
PATCH http://localhost:5000/api/notifications/NOTIFICATION_ID
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

```json
{
  "read": true,
  "selected": true
}
```

### Batch actions

```http
PATCH http://localhost:5000/api/notifications/mark-all-read
PATCH http://localhost:5000/api/notifications/select-read
DELETE http://localhost:5000/api/notifications/selected
DELETE http://localhost:5000/api/notifications/read
```

## Activity API Test Order

All activity endpoints require the login token:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

### List activity

```http
GET http://localhost:5000/api/activity
```

### Create activity

```http
POST http://localhost:5000/api/activity
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

```json
{
  "type": "task",
  "icon": "calendar",
  "title": "Follow up with Alpha Group created",
  "summary": "Alpha Group - assigned to James Carter",
  "status": "Created",
  "relatedLabel": "Alpha Group",
  "description": "A new task was created from the task board.",
  "details": [
    ["Priority", "High"],
    ["Assignee", "James Carter"]
  ],
  "actionHref": "./dashboard.html#tasks",
  "actionLabel": "Open Task Board"
}
```

### Clear activity

```http
DELETE http://localhost:5000/api/activity
Authorization: Bearer YOUR_TOKEN_HERE
```

## Messenger API Test Order

All messenger endpoints require the login token:

```http
Authorization: Bearer YOUR_TOKEN_HERE
```

### List conversations

```http
GET http://localhost:5000/api/messages
```

Expected result: a `conversations` object where each key is a teammate or department name.

### Send message

```http
POST http://localhost:5000/api/messages
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

```json
{
  "conversation": "Sales Team",
  "role": "user",
  "author": "You",
  "recipient": "Sales Team",
  "text": "Please review today's hot leads."
}
```

### Clear one conversation

```http
DELETE http://localhost:5000/api/messages/Sales%20Team
Authorization: Bearer YOUR_TOKEN_HERE
```

### Clear all messenger history

```http
DELETE http://localhost:5000/api/messages
Authorization: Bearer YOUR_TOKEN_HERE
```

## Phone Settings API Test Order

The company phone settings endpoint stores the caller number that future Twilio calls will use.

Only users with `owner` or `admin` role can update the company phone number. Other logged-in users can read the current phone settings.

### Read phone settings

```http
GET http://localhost:5000/api/settings/phone
Authorization: Bearer YOUR_TOKEN_HERE
```

Expected result:

```json
{
  "status": "success",
  "settings": {
    "workspaceKey": "10x-crm-demo",
    "companyName": "10X CRM Demo",
    "canManage": true,
    "phone": {
      "companyPhoneNumber": "",
      "callingEnabled": false,
      "callerIdStatus": "not_configured"
    }
  }
}
```

### Update phone settings

```http
PATCH http://localhost:5000/api/settings/phone
Content-Type: application/json
Authorization: Bearer OWNER_OR_ADMIN_TOKEN
```

```json
{
  "companyPhoneNumber": "+995574431557",
  "callingEnabled": false,
  "callerIdStatus": "not_configured"
}
```

Phone numbers must use E.164 format: `+` plus country code and number, for example `+995574431557`.
