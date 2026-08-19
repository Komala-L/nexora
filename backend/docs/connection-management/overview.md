> This document describes the Connection Management module designed for Nexora.
> It explains the responsibilities, architecture, APIs, relationship lifecycle, data model, duplicate-request strategy, and design decisions used to manage user connections within the platform.

# Connection Management Overview

## Document Information

| Property         | Value                 |
| ---------------- | --------------------- |
| Project          | Nexora                |
| Module           | Connection Management |
| Document Type    | Module Overview       |
| Document Version | 0.1                   |
| Status           | Active                |
| Review Status    | Approved              |
| Author           | Komala L              |
| Last Updated     | 19 August 2026        |

---

## Component Structure

| Component             | Location                                   |
| --------------------- | ------------------------------------------ |
| Connection Routes     | `src/routes/connection.routes.js`          |
| Connection Controller | `src/controllers/connection.controller.js` |
| Connection Service    | `src/services/connection.service.js`       |
| Connection Validation | `src/validations/connection.validation.js` |
| Connection Model      | `src/models/connection.model.js`           |

The module follows Nexora's existing layered backend architecture.

---

# 1. Overview

The Connection Management module is responsible for managing relationship requests and established connections between users within the Nexora platform.

The module allows authenticated users to:

* Send connection requests.
* View incoming requests.
* View outgoing requests.
* Accept requests.
* Reject requests.
* Cancel outgoing requests.
* View accepted connections.
* Remove existing connections.

The module uses a single `Connection` collection to represent both pending requests and accepted relationships.

Authentication, user profile management, location management, Nearby Discovery, Chat, and Notifications remain separate responsibilities.

---

# 2. Objectives

The Connection Management module is designed to:

* Provide a secure relationship system between users.
* Prevent duplicate relationships.
* Prevent reverse-pending requests.
* Maintain a clear relationship lifecycle.
* Enforce relationship-level authorization.
* Support paginated relationship lists.
* Protect sensitive user information.
* Provide an authorization boundary for the future Chat module.
* Provide connection events for future Notification integration.

---

# 3. Architecture

The Connection Management module follows Nexora's layered architecture.

```text
Client
   ↓
Connection Routes
   ↓
Authentication Middleware
   ↓
Validation Middleware
   ↓
Connection Controller
   ↓
Connection Service
   ↓
Connection Model
   ↓
MongoDB
```

The **Controller** remains responsible for HTTP communication, while the **Service** contains relationship business logic, authorization, state transitions, and duplicate detection. The **Model** defines the Connection schema and database constraints.

---

# 4. Core Design

Nexora uses a single `Connection` collection containing:

```text
Connection
│
├── requester
├── recipient
├── pairKey
├── status
├── createdAt
└── updatedAt
```

The relationship status has only two persisted values:

```text
pending
accepted
```

Rejected, cancelled, and removed relationships are deleted rather than stored as permanent states. The collection therefore represents the **current relationship state**, not relationship history.

---

# 5. Relationship Identity

Every pair of users has one normalized `pairKey`.

For example:

```text
User A = 123
User B = 456

pairKey = 123:456
```

The reverse ordering must resolve to the same relationship identity.

This establishes the core invariant:

> For any pair of users, Nexora can have at most one active Connection document.

## A unique MongoDB constraint on `pairKey` provides database-level protection against duplicate relationships.

# 6. Relationship Lifecycle

The relationship lifecycle is:

```text
SEND REQUEST
     ↓
  PENDING
   ↙    ↘
ACCEPT  REJECT
  ↓       ↓
ACCEPTED DELETE
  ↓
REMOVE
  ↓
DELETE
```

A requester may also cancel a pending request:

```text
PENDING
   ↓
CANCEL
   ↓
DELETE
```

Only `pending` and `accepted` are persisted.

---

# 7. Core Business Rules

The Connection module enforces the following rules:

* A user cannot send a request to themselves.
* A duplicate pending request is not allowed.
* A reverse pending request is not created.
* A reverse request does not automatically accept the existing request.
* An existing accepted connection cannot be requested again.
* Only the recipient can accept or reject a request.
* Only the requester can cancel a pending request.
* Either connected user can remove an accepted connection.

These rules ensure that each user pair has at most one active relationship document.

---

# 8. Duplicate and Reverse-Request Strategy

Duplicate protection is implemented at two levels.

```text
Service Validation
        ↓
Business Rules
        ↓
Unique pairKey Constraint
```

The service checks for:

* Self-requests.
* Existing pending relationships.
* Existing accepted relationships.
* Reverse pending relationships.

MongoDB's unique `pairKey` constraint provides a final integrity guarantee against concurrent duplicate creation.

A reverse request is **not automatically accepted**.

For example:

```text
A → B
pending

B → A
   ↓
409 Conflict
```

The original request remains pending until the recipient explicitly accepts or rejects it.

---

# 9. API Summary

The initial Connection Management API consists of:

| Method | Endpoint                                         | Purpose                    |
| ------ | ------------------------------------------------ | -------------------------- |
| POST   | `/api/v1/connections/requests/:userId`           | Send connection request    |
| GET    | `/api/v1/connections/requests/incoming`          | Get incoming requests      |
| GET    | `/api/v1/connections/requests/outgoing`          | Get outgoing requests      |
| PATCH  | `/api/v1/connections/requests/:requestId/accept` | Accept request             |
| PATCH  | `/api/v1/connections/requests/:requestId/reject` | Reject request             |
| DELETE | `/api/v1/connections/requests/:requestId`        | Cancel outgoing request    |
| GET    | `/api/v1/connections`                            | Get accepted connections   |
| DELETE | `/api/v1/connections/:userId`                    | Remove accepted connection |

All endpoints require authentication. Detailed request, response, validation, pagination, authorization, and error specifications are documented in `api.md`.

---

# 10. Authorization

Authentication establishes the current user through:

```text
req.user.id
```

The Connection service enforces relationship-level authorization.

| Action            | Authorized User       |
| ----------------- | --------------------- |
| Send request      | Authenticated user    |
| Accept request    | Recipient             |
| Reject request    | Recipient             |
| Cancel request    | Requester             |
| Remove connection | Either connected user |

The frontend must never be trusted to enforce these rules.

---

# 11. Privacy and Security

Connection APIs must expose only the user information required by the client.

Sensitive information such as:

```text
email
password
refreshToken
location
discoveryLocation
```

must never be exposed through Connection APIs.

Connection documents also do not duplicate location information. Nearby Discovery determines which users are nearby, while Connection Management determines the relationship between users.

---

# 12. Pagination

Connection lists support:

```text
page
limit
```

with:

```text
page = 1
limit = 20
maximum limit = 50
```

Pagination is used to prevent unnecessarily large responses and support scalability.

---

# 13. Integration With Other Modules

### Nearby Discovery

Nearby Discovery answers:

> Which users are nearby?

Connection Management answers:

> What relationship exists between two users?

The modules remain separate and do not duplicate each other's responsibilities.

### Chat

The future Chat module will use an accepted Connection as its authorization prerequisite:

```text
Connection.status === "accepted"
```

Pending or deleted relationships must not authorize communication.

### Notifications

Connection events may later be consumed by the Notification module.

Examples include:

```text
Connection Request Created
Connection Request Accepted
```

Notification delivery remains outside the Connection module.

---

# 14. Supporting Documents

Detailed Connection Management decisions are documented separately:

| Document              | Purpose                                                          |
| --------------------- | ---------------------------------------------------------------- |
| `data-model.md`       | Connection schema, relationship identity, and database integrity |
| `state-machine.md`    | Relationship lifecycle and allowed transitions                   |
| `request-strategy.md` | Duplicate and reverse-request handling                           |
| `api.md`              | API contract, validation, authorization, pagination, and errors  |

This overview intentionally avoids duplicating the complete details contained in these documents.

---

# 15. Known Limitations

The initial Connection Management design does not include:

* Connection history.
* Blocking.
* Advanced relationship privacy controls.
* Mutual connection information.
* Connection recommendations.
* Connection analytics.
* Notification delivery.
* Chat functionality.

These concerns may be introduced through separate features or modules when required.

---

# 16. Out of Scope

This module does not cover:

* Authentication.
* Password management.
* User profile management.
* Profile image management.
* Location management.
* Nearby User Discovery implementation.
* Chat messages.
* Notification delivery.
* Relationship history.
* Blocking implementation.

These responsibilities belong to their respective modules or future features.

---

# 17. References

* MongoDB Documentation
* Mongoose Documentation
* Express.js Documentation
* MongoDB Indexing Documentation
* HTTP Semantics / RFC 9110
* OWASP API Security Guidance

---

# 18. Revision History

| Version | Description                                                     |
| ------- | --------------------------------------------------------------- |
| 0.1     | Initial Connection Management Module Overview                   |
