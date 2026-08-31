# Connection Data Model

## Document Information

| Property         | Value                 |
| ---------------- | --------------------- |
| Project          | Nexora                |
| Module           | Connection Management |
| Document Type    | Data Model Design     |
| Document Version | 0.2                   |
| Status           | Active                |
| Review Status    | Approved              |
| Author           | Komala L              |
| Last Updated     | 31 August 2026        |

---

# 1. Overview

Nexora uses a single `Connection` collection to represent both pending connection requests and accepted relationships.

The same document changes state when a request is accepted. Rejected, cancelled, and removed relationships are deleted rather than retained as historical states.

The collection therefore represents the **current active relationship state** between two users.

---

# 2. Connection Document

The conceptual model is:

```text
Connection
│
├── requester
│     └── ObjectId → User
│
├── recipient
│     └── ObjectId → User
│
├── pairKey
│     └── String
│
├── status
│     ├── pending
│     └── accepted
│
├── createdAt
└── updatedAt
```

## Fields

| Field       | Type     | Required  | Purpose                                          |
| ----------- | -------- | --------- | ------------------------------------------------ |
| `requester` | ObjectId | Yes       | User who initiated the connection request        |
| `recipient` | ObjectId | Yes       | User who received the connection request         |
| `pairKey`   | String   | Yes       | Normalized identity of the two-user relationship |
| `status`    | String   | Yes       | Current active relationship state                |
| `createdAt` | Date     | Automatic | Time when the document was created               |
| `updatedAt` | Date     | Automatic | Time when the document was last modified         |

The `requester` and `recipient` fields reference the `User` collection.

---

# 3. Requester and Recipient

A connection request is directional.

For example:

```text
A → B
```

means:

* A is the `requester`.
* B is the `recipient`.

This distinction is required because the relationship begins as a request from one user to another.

After acceptance, the same document represents the established relationship.

The original `requester` and `recipient` values are retained after acceptance.

---

# 4. Relationship Identity

Every pair of users has one normalized `pairKey`.

For example:

```text
User A = 123
User B = 456
```

The normalized relationship identity is:

```text
123:456
```

The reverse ordering:

```text
456:123
```

must resolve to the same relationship identity.

This creates the fundamental invariant:

> For any pair of users, Nexora can have at most one active `Connection` document.

The `pairKey` is uniquely constrained at the database level.

---

# 5. Status

The `status` field represents the current active relationship state.

Only two values are persisted:

```text
pending
accepted
```

## `pending`

A connection request exists and is awaiting a response from the recipient.

## `accepted`

The connection request has been accepted and the users are connected.

Rejected, cancelled, and removed states are not persisted as permanent states. The corresponding document is deleted.

---

# 6. Timestamps

The Connection schema uses automatic timestamps:

```text
createdAt
updatedAt
```

## `createdAt`

Records when the Connection document was initially created.

## `updatedAt`

Records when the Connection document was last modified.

These timestamps are also used by relationship list APIs for ordering results, such as returning the newest requests first.

---

# 7. Database Integrity

The Connection model uses database constraints to protect relationship integrity.

The primary relationship identity constraint is:

```text
pairKey → unique
```

Conceptually:

```text
Service Validation
       ↓
Duplicate Detection
       ↓
MongoDB Unique Constraint
```

Service-level validation handles expected business conflicts.

The database-level unique constraint provides final protection against duplicate relationship documents, including concurrent creation attempts.

---

# 8. User References

The Connection document references users through:

```text
requester → User
recipient → User
```

The Connection collection does not duplicate user profile information.

When relationship data is returned to clients, required public user fields may be populated from the referenced `User` document.

For example:

```text
name
profilePic
bio
interests
```

The Connection model itself does not store copies of these fields.

---

# 9. Location Privacy Boundary

Connection documents do not contain user location information.

The following fields are intentionally not part of the Connection schema:

```text
location
discoveryLocation
```

Nearby Discovery determines which users are nearby, while Connection Management determines the relationship between users.

This maintains a clear separation between location discovery and relationship management.

---

# 10. Data Lifecycle

The Connection document represents the current relationship state.

Conceptually:

```text
Create
  ↓
pending
  ↓
accepted
```

For relationships that are rejected, cancelled, or removed:

```text
pending / accepted
       ↓
     DELETE
```

No separate historical relationship document is created.

Relationship history is outside the scope of the current data model.

---

# 11. Design Decisions

## Why use one Connection collection?

A single collection represents both pending requests and accepted relationships using one relationship document.

This avoids maintaining separate collections for connection requests and established connections.

## Why use requester and recipient?

The initial relationship is directional, so the model must retain who initiated the request and who received it.

## Why use pairKey?

`pairKey` provides a normalized identity for the user pair and ensures that:

```text
A → B
```

and:

```text
B → A
```

refer to the same relationship identity.

## Why store only pending and accepted?

The Connection collection represents the current active relationship rather than relationship history.

Rejected, cancelled, and removed relationships are deleted.

---

# 12. Out of Scope

This data model does not cover:

* Authentication.
* User profile management.
* Nearby user discovery.
* Chat messages.
* Notifications.
* Relationship history.
* Blocking.
* Connection recommendations.
* Connection analytics.

These concerns belong to separate modules or future features.

---

# 13. Related Documents

| Document              | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `overview.md`         | Connection Management module overview        |
| `api.md`              | Connection Management API contracts          |
| `state-machine.md`    | Relationship lifecycle and state transitions |
| `request-strategy.md` | Duplicate and reverse-request handling       |

---

# 14. Revision History

| Version | Description                                                                                                          |
| ------- | -------------------------------------------------------------------------------------------------------------------- |
| 0.1     | Initial Connection Data Model Design                                                                                 |
| 0.2     | Updated data model to reflect the implemented Connection schema, constraints, timestamps, and document relationships |
