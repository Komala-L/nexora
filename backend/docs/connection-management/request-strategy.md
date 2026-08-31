# Connection Request Strategy

## Document Information

| Property         | Value                   |
| ---------------- | ----------------------- |
| Project          | Nexora                  |
| Module           | Connection Management   |
| Document Type    | Request Strategy Design |
| Document Version | 0.2                     |
| Status           | Active                  |
| Review Status    | Approved                |
| Author           | Komala L                |
| Last Updated     | 31 August 2026          |

---

# 1. Overview

The Connection Management module uses a single `Connection` document to represent both connection requests and accepted connections.

The request strategy is designed to:

* Prevent self-requests.
* Prevent duplicate relationships.
* Prevent reverse-pending requests.
* Prevent duplicate accepted connections.
* Maintain a single relationship identity for each user pair.
* Protect relationship creation from concurrent duplicate requests.

---

# 2. Core Invariant

For any pair of users:

> Nexora can have at most one active `Connection` document.

This invariant is protected at two levels:

```text
Service Validation
       ↓
Business Rules
       ↓
Unique pairKey Constraint
```

Service validation provides predictable business-level errors, while the database constraint provides final data-integrity protection.

---

# 3. Self-Request Prevention

A user cannot send a connection request to themselves.

Example:

```text
A → A
```

The request must be rejected before relationship creation.

No `Connection` document is created.

---

# 4. Relationship Identity

Every user pair is represented by a normalized `pairKey`.

Example:

```text
User A = 123
User B = 456
```

The relationship identity is:

```text
123:456
```

The reverse ordering:

```text
456:123
```

must resolve to the same normalized identity.

Therefore:

```text
A → B
```

and:

```text
B → A
```

cannot create separate active relationships.

---

# 5. Duplicate Pending Request

Suppose:

```text
A → B
status = pending
```

If A attempts to send another request to B, the existing relationship is detected.

The system must:

```text
❌ Not create another document
✅ Return a conflict response
```

The original pending relationship remains unchanged.

---

# 6. Reverse Pending Request

Suppose:

```text
A → B
status = pending
```

and B attempts:

```text
B → A
```

Both requests resolve to the same `pairKey`.

The existing relationship is therefore detected.

The system must:

```text
❌ Not create another document
❌ Not automatically accept the existing request
✅ Return a conflict response
```

The original request remains pending.

---

# 7. Reverse Request Is Not Auto-Accepted

A reverse request must not automatically change:

```text
pending → accepted
```

For example:

```text
A → B
pending
```

does not become:

```text
A ↔ B
accepted
```

merely because B attempts to send a request to A.

The original recipient must explicitly accept the existing request.

This keeps relationship transitions explicit and predictable.

---

# 8. Existing Accepted Connection

Suppose:

```text
A ↔ B
status = accepted
```

A new request between A and B must be rejected.

The system must not create another `Connection` document.

The existing accepted relationship remains unchanged.

---

# 9. Request Processing Strategy

A new connection request conceptually follows:

```text
Authenticated User
       ↓
Validate target user
       ↓
Prevent self-request
       ↓
Generate normalized pairKey
       ↓
Check existing relationship
       ↓
Reject duplicate/reverse/accepted relationship
       ↓
Create pending Connection
```

The requester identity is derived from the authenticated request context.

The client must never be trusted to provide the requester identity.

The service uses the authenticated user identity from:

```text
req.user
```

according to the authentication middleware contract.

---

# 10. Duplicate Protection

Duplicate protection is implemented at two levels.

## Service-Level Protection

The service checks for:

* Self-request.
* Existing pending relationship.
* Existing accepted relationship.
* Reverse pending relationship.

These checks allow the API to return meaningful business errors.

## Database-Level Protection

MongoDB enforces uniqueness on:

```text
pairKey
```

This provides final protection against concurrent requests that could otherwise create duplicate relationship documents.

The database constraint is therefore treated as the final integrity boundary.

---

# 11. Conflict Handling

Relationship conflicts use HTTP `409 Conflict` where appropriate.

Examples include:

* Duplicate connection requests.
* Reverse pending requests.
* Requests involving an existing accepted connection.

Example:

```json
{
    "success": false,
    "statusCode": 409,
    "message": "Connection request already exists"
}
```

The API uses human-readable error messages through Nexora's standard error response structure.

Clients should rely on the HTTP status and structured error response rather than parsing message text for business logic.

---

# 12. Authorization Boundary

The request strategy depends on relationship roles established by the Connection document.

For pending requests:

```text
requester → user who initiated the request
recipient → user who received the request
```

The requester/recipient roles are used by the service to authorize relationship operations.

Detailed authorization rules and state transitions are documented in:

```text
api.md
state-machine.md
```

---

# 13. Location Privacy

Connection requests and relationships do not store location information.

The following fields are outside the Connection model:

```text
location
discoveryLocation
```

Nearby Discovery and Connection Management remain separate responsibilities.

Connection Management only requires the relationship and the limited public user information needed by the client.

---

# 14. Design Decisions

## Why use one relationship document?

A single relationship document represents the current relationship between two users.

This avoids creating separate active documents for requests and accepted connections.

## Why use pairKey?

`pairKey` provides a normalized identity for the user pair.

Therefore:

```text
A → B
```

and:

```text
B → A
```

resolve to the same relationship identity.

## Why not auto-accept reverse requests?

Explicit acceptance keeps the relationship lifecycle predictable and prevents hidden state transitions.

## Why combine service validation with a database constraint?

Service validation provides clear business-level errors.

The unique database constraint provides final protection against concurrent duplicate creation.

Both layers are required for reliable relationship integrity.

---

# 15. Out of Scope

This document does not cover:

* User authentication implementation.
* User profile management.
* Nearby Discovery implementation.
* Chat implementation.
* Notification delivery.
* Relationship history.
* Blocking.
* Detailed state-transition definitions.

These concerns are documented separately or belong to other modules.

---

# 16. Related Documents

| Document           | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `overview.md`      | Connection Management module overview       |
| `api.md`           | API contracts and endpoint behavior         |
| `data-model.md`    | Connection schema and database design       |
| `state-machine.md` | Relationship states and allowed transitions |

---

# 17. Revision History

| Version | Description                                                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 0.1     | Initial Connection Request Strategy Design                                                                                       |
| 0.2     | Updated request strategy to reflect implemented authorization, error handling, and authenticated user identity                   |
