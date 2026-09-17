# Nexora Notification APIs

> This document describes the HTTP APIs provided by the Nexora Notification Management module, including authentication requirements, query parameters, request behavior, responses, and error handling.

---

## Document Information

| Property | Value |
|---|---|
| Project | Nexora |
| Module | Notification Management |
| Document Type | API Specification |
| Document Version | 0.1 |
| Status | Active |
| Review Status | Approved |
| Author | Komala L |
| Last Updated | 17 September 2026 |

---

# 1. API Overview

The Notification Management API provides authenticated users with endpoints to retrieve and manage their notification state.

The API supports:

* Retrieving notifications.
* Retrieving the unread notification count.
* Marking individual notifications as read.
* Marking all notifications as read.

Notifications are created internally by Nexora business services when supported application events occur.

The Notification API does not expose a public endpoint for creating notifications.

Detailed notification architecture and database behavior are documented in the supporting Notification Management documents.

---

## 2. Base Paths

All Notification Management endpoints are exposed under:

```text
/api/v1/notifications
```

For local development:

```text
http://localhost:5000/api/v1/notifications
```

---

## 3. Authentication

All notification endpoints require an authenticated Nexora user.

Authentication is handled using the application's cookie-based JWT authentication system.

The access token is provided through an HTTP-only cookie.

The authenticated user is identified on the backend through:

```js
req.user._id
```

Users can only access and modify notifications belonging to their own account.

---

## 4. Get Notifications

Retrieves notifications belonging to the authenticated user.

**Endpoint**

```text
GET /api/v1/notifications
```

**Authentication**

Required.

**Query Parameters**

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| page | Number | No | 1 | Page number |
| limit | Number | No | 20 | Number of notifications per page |

**Example Request**

```text
GET /api/v1/notifications?page=1&limit=20
```

**Frontend Service**

```js
getNotifications(page, limit)
```

**Success Response**

```json
{
    "success": true,
    "data": {
        "notifications": [],
        "pagination": {
            "page": 1,
            "limit": 20,
            "total": 0,
            "totalPages": 0
        }
    }
}
```

The exact notification objects returned depend on the stored notification records.

Notification sender information is populated with relevant user information such as:

- `_id`
- `name`
- `profilePic`

**Ordering**

Notifications are returned from newest to oldest using:

```js
createdAt: -1
```

---

## 5. Get Unread Notification Count

Retrieves the number of unread notifications belonging to the authenticated user.

**Endpoint**

```text
GET /api/v1/notifications/unread-count
```

**Authentication**

Required.

**Request Body**

None.

**Query Parameters**

None.

**Example Request**

```text
GET /api/v1/notifications/unread-count
```

**Frontend Service**

```js
getUnreadNotificationCount()
```

**Success Response**

The endpoint returns the unread notification count for the authenticated user.

Example:

```json
{
    "success": true,
    "data": {
        "count": 3
    }
}
```

The count represents notifications where:

```text
recipient = authenticated user
read = false
```

**Usage**

The frontend uses this value to display the unread notification badge in the Topbar.

Example:

```text
Bell
  [3]
```

When there are no unread notifications:

```text
Bell
  [0]
```

---

## 6. Mark One Notification as Read

Marks a specific notification as read.

**Endpoint**

```text
PATCH /api/v1/notifications/:notificationId/read
```

**Authentication**

Required.

**Route Parameter**

| Parameter | Type | Required | Description |
|---|---|---|---|
| notificationId | MongoDB ObjectId | Yes | ID of the notification to mark as read |

**Example Request**

```text
PATCH /api/v1/notifications/64f123456789abcdef123456/read
```

**Request Body**

None.

**Frontend Service**

```js
markNotificationAsRead(notificationId)
```

**Behavior**

The endpoint verifies that the notification belongs to the authenticated user before modifying it.

The notification's state changes from:

```js
read: false
```

to:

```js
read: true
```

**Success Response**

A successful request returns the updated operation result using the standard Nexora API response structure.

**Possible Errors**

**Notification Not Found**

`404 Not Found`

Returned when the requested notification does not exist or is not available to the authenticated user.

**Invalid Notification ID**

`400 Bad Request`

May be returned when the supplied notification ID is not a valid MongoDB ObjectId.

**Unauthorized Access**

The API does not allow a user to mark another user's notification as read.

---

## 7. Mark All Notifications as Read

Marks all unread notifications belonging to the authenticated user as read.

**Endpoint**

```text
PATCH /api/v1/notifications/read-all
```

**Authentication**

Required.

**Request Body**

None.

**Query Parameters**

None.

**Example Request**

```text
PATCH /api/v1/notifications/read-all
```

**Frontend Service**

```js
markAllNotificationsAsRead()
```

**Behavior**

The endpoint updates notifications belonging to the authenticated user where:

```js
read = false
```

The notifications are changed to:

```js
read = true
```

Notifications belonging to other users are not modified.

**Success Response**

A successful request returns the standard Nexora success response.

**Result**

If the user previously had:

```text
Unread notifications: 3
```

after the operation:

```text
Unread notifications: 0
```

The frontend also updates its local notification state so the user does not need to refresh the page to see the updated read state.

---

## 8. Notification API Summary

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| GET | `/notifications` | Required | Retrieve user's notifications |
| GET | `/notifications/unread-count` | Required | Retrieve unread notification count |
| PATCH | `/notifications/:notificationId/read` | Required | Mark one notification as read |
| PATCH | `/notifications/read-all` | Required | Mark all user's notifications as read |

---

## 9. Internal Notification Creation

Notifications are created internally by Nexora business services rather than through a public client-facing create-notification endpoint.

The reusable service function is:

```js
createNotification()
```

This prevents the frontend from directly creating arbitrary notifications.

Notification creation is triggered by relevant application events.

**Connection Events**

Connection-related notifications are generated by the Connection Management module.

```text
Connection Request
        ↓
Connection Service
        ↓
createNotification()
```

Supported connection notification types include:

- `connection_request`
- `connection_accepted`
- `connection_rejected`

**Message Events**

Message notifications are generated by the Message Management module.

```text
Message Sent
     ↓
Message Service
     ↓
createNotification()
```

The message notification contains references to:

- `recipient`
- `sender`
- `conversation`
- `message`

---

## 10. Authorization Rules

Notification APIs follow these authorization rules:

**User-specific access**

A user can only retrieve their own notifications.

**User-specific modification**

A user can only mark their own notifications as read.

**No direct notification creation**

Clients cannot directly create notifications through the Notification API.

Notifications are generated by trusted backend services as a result of valid application events.

---

## 11. Pagination

The notification retrieval endpoint supports pagination.

Example:

```text
GET /api/v1/notifications?page=2&limit=20
```

The backend calculates:

```text
skip = (page - 1) × limit
```

Example:

```text
page 1 → notifications 1–20
page 2 → notifications 21–40
page 3 → notifications 41–60
```

This prevents the application from loading an unnecessarily large notification history in a single request.

---

## 12. Error Handling

Notification APIs use the centralized Nexora error-handling architecture.

Common error categories include:

| Status | Meaning |
|---|---|
| 400 | Invalid request or identifier |
| 401 | Authentication required |
| 403 | User is not authorized to access the resource |
| 404 | Notification/resource not found |
| 500 | Unexpected server error |

Errors follow the application's standardized response format.

---

## 13. Frontend Integration

The frontend communicates with the Notification API through:

```text
frontend/src/services/notification.service.js
```

Available frontend service functions:

- `getNotifications()`
- `getUnreadNotificationCount()`
- `markNotificationAsRead()`
- `markAllNotificationsAsRead()`

The Notifications page is implemented at:

```text
frontend/src/pages/user/Notifications.jsx
```

The application Topbar displays the unread notification indicator.

---

## 14. Current API Scope

The current Notification Management API supports:

- Retrieving notifications.
- Paginated notification retrieval.
- Retrieving unread notification count.
- Marking an individual notification as read.
- Marking all notifications as read.
- Authenticated user-specific access.
- Connection-related notification events.
- Message-related notification events.

The current API does not expose:

- Client-side notification creation.
- Notification deletion.
- Notification preferences.
- Real-time notification delivery.
- Push notification subscriptions.

These may be considered for future versions.

---

## 15. Related Documents

| Document | Purpose |
|---|---|
| `overview.md` | Notification Management module overview |
| `data-model.md` | Notification database schema, relationships, indexes, and data integrity |
| `api.md` | Notification HTTP API contracts |

This document focuses on the HTTP API contracts and avoids duplicating detailed architectural and data-model information documented in the supporting files.

---

## 16. Implementation References

| File | Responsibility |
|---|---|
| `src/routes/notification.routes.js` | Notification API routes |
| `src/controllers/notification.controller.js` | Notification HTTP handlers |
| `src/services/notification.service.js` | Notification business logic |
| `src/models/notification.model.js` | Notification data model |
| `src/validations/` | Request validation schemas, where applicable |
| `src/services/connection.service.js` | Generates connection-related notifications |
| `src/services/message.service.js` | Generates message-related notifications |
| `frontend/src/services/notification.service.js` | Frontend Notification API integration |

---

## 17. Revision History

| Version | Description |
|---|---|
| 0.1 | Initial Notification API specification covering notification retrieval, unread count, read-state operations, authorization, pagination, and internal notification creation |